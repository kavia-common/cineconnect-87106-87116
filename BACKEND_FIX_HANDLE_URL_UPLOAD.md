# Lambda: handle_url_upload (versión corregida y robusta contra comparaciones str vs int)

El siguiente código implementa la función Lambda para recibir una URL de video, validar cabeceras y límites de tamaño, descargar en streaming y generar una carga a S3 (incluye ejemplo directo y vía multipart opcional). Se han eliminado funciones duplicadas y se añadieron helpers únicos y comentados. Todas las variables numéricas susceptibles de llegar como string (p. ej., MAX_FILE_SIZE, expiration, Content-Length, part_size_mb, timeout) se convierten explícitamente a enteros antes de usarlas o compararlas.

Notas:
- PUBLIC_INTERFACE marca funciones públicas como se solicitó.
- Se documenta dónde y por qué se realiza cada conversión.
- No se hardcodean secretos; los nombres de variables de entorno deben configurarse externamente por el usuario/deployment:
  - AWS_REGION
  - S3_BUCKET
  - S3_PREFIX (opcional)
  - MAX_FILE_SIZE_MB (opcional; predeterminado 1024)
  - DEFAULT_URL_TIMEOUT_SEC (opcional; predeterminado 30)
  - DEFAULT_PART_SIZE_MB (opcional; predeterminado 8)
  - UPLOAD_URL_EXPIRATION_SEC (opcional; predeterminado 3600)

```python
import json
import os
import re
import math
import time
import uuid
import logging
from contextlib import contextmanager

import boto3
import botocore
import requests

logger = logging.getLogger()
logger.setLevel(logging.INFO)


# =========================
# Helpers de conversión
# =========================

def _coerce_int(value, default=None, field_name="value"):
    """
    Convierte a int si es posible:
    - Acepta int, float, strings numéricas ("10", "10.5").
    - Devuelve default si value es None o string vacío.
    - Lanza ValueError si no puede convertirse.
    """
    if value is None or value == "":
        return default
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    if isinstance(value, str):
        s = value.strip()
        # Acepta enteros y floats como texto
        if re.fullmatch(r"[+-]?\d+", s):
            return int(s)
        if re.fullmatch(r"[+-]?\d+\.\d+", s):
            return int(float(s))
    raise ValueError(f"Invalid integer for {field_name}: {value!r}")


def _env_int(name, default):
    """
    Lee variable de entorno y la convierte a int con default. Si llega como string, la convierte.
    """
    raw = os.getenv(name, None)
    try:
        return _coerce_int(raw, default=default, field_name=name)
    except ValueError:
        logger.warning("Invalid env var %s=%r, using default %r", name, raw, default)
        return default


def _safe_content_length(headers):
    """
    Intenta convertir Content-Length de cabeceras HTTP a int.
    Si no existe o no es numérico, devuelve None.
    """
    cl = None
    if not headers:
        return None
    # Algunas libs normalizan el caso; requests usa dict-like con claves tal cual.
    for key in ("Content-Length", "content-length", "CONTENT-LENGTH"):
        if key in headers:
            cl = headers.get(key)
            break
    try:
        return _coerce_int(cl, default=None, field_name="Content-Length") if cl is not None else None
    except ValueError:
        return None


@contextmanager
def _requests_session():
    """
    Context manager para asegurar cierre de sesión requests.
    """
    s = requests.Session()
    try:
        yield s
    finally:
        try:
            s.close()
        except Exception:
            pass


def _s3_client():
    """
    Crea cliente S3 respetando región si está definida.
    """
    region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION")
    if region:
        return boto3.client("s3", region_name=region)
    return boto3.client("s3")


def _build_s3_key(filename: str, prefix: str = ""):
    """
    Genera una clave S3 única usando un UUID y conserva la extensión si existe.
    """
    base = str(uuid.uuid4())
    ext = ""
    if "." in filename:
        # Evitar extensiones peligrosas; esto solo mantiene el sufijo.
        ext = "." + filename.split(".")[-1].strip().lower()[:10]
    key = f"{base}{ext}"
    if prefix:
        prefix = prefix.strip().strip("/")
        key = f"{prefix}/{key}"
    return key


# =========================
# Validación y parsing del evento
# =========================

def _parse_body(event):
    """
    Normaliza el body del evento (JSON) a un dict.
    """
    body = event.get("body")
    if isinstance(body, str):
        try:
            return json.loads(body)
        except json.JSONDecodeError:
            return {}
    return body or {}


def _extract_params(event):
    """
    Extrae parámetros de body y env, aplicando coerciones a int con defaults seguros.

    Conversiones destacadas (evitan el bug de comparar str vs int):
    - max_size_mb -> int
    - timeout -> int
    - part_size_mb -> int
    - expiration -> int
    - Content-Length -> int (vía _safe_content_length)
    """
    body = _parse_body(event)
    # URL
    url = (body.get("url") or "").strip()
    if not url:
        raise ValueError("Missing 'url'")

    # Nombre de archivo sugerido (opcional)
    filename = (body.get("filename") or "").strip() or "upload.bin"

    # Tamaño máximo permitido (MB). Puede venir del body o del entorno.
    max_size_mb = None
    try:
        max_size_mb = _coerce_int(body.get("max_size_mb"), default=None, field_name="max_size_mb")
    except ValueError:
        pass
    if max_size_mb is None:
        max_size_mb = _env_int("MAX_FILE_SIZE_MB", 1024)  # default 1GB

    # Timeout de requests (segundos)
    timeout = None
    try:
        timeout = _coerce_int(body.get("timeout"), default=None, field_name="timeout")
    except ValueError:
        pass
    if timeout is None:
        timeout = _env_int("DEFAULT_URL_TIMEOUT_SEC", 30)

    # Tamaño de parte (MB) para streaming o multipart
    part_size_mb = None
    try:
        part_size_mb = _coerce_int(body.get("part_size_mb"), default=None, field_name="part_size_mb")
    except ValueError:
        pass
    if part_size_mb is None:
        part_size_mb = _env_int("DEFAULT_PART_SIZE_MB", 8)

    # Expiración de URLs prefirmadas (segundos)
    expiration = None
    try:
        expiration = _coerce_int(body.get("expiration"), default=None, field_name="expiration")
    except ValueError:
        pass
    if expiration is None:
        expiration = _env_int("UPLOAD_URL_EXPIRATION_SEC", 3600)

    # Calcular bytes
    max_size_bytes = max_size_mb * 1024 * 1024
    part_size = part_size_mb * 1024 * 1024

    # Sane mínimos
    if timeout < 1:
        timeout = 1
    # En multipart de S3, el mínimo recomendado es 5MB por parte
    min_part = 5 * 1024 * 1024
    if part_size < min_part:
        part_size = min_part

    # Bucket y prefijo
    bucket = (os.getenv("S3_BUCKET") or "").strip()
    if not bucket:
        raise ValueError("Missing S3_BUCKET env var")
    prefix = (os.getenv("S3_PREFIX") or "").strip()

    return {
        "url": url,
        "filename": filename,
        "max_size_mb": max_size_mb,
        "max_size_bytes": max_size_bytes,
        "timeout": timeout,
        "part_size_mb": part_size_mb,
        "part_size": part_size,
        "expiration": expiration,
        "bucket": bucket,
        "prefix": prefix,
    }


# =========================
# S3 Upload helpers
# =========================

def _upload_stream_simple(s3, bucket, key, response_iter, max_size_bytes: int):
    """
    Sube el contenido recibido en streaming a S3 usando upload_fileobj-like via PutObject.
    Para robustez y control del límite, agregamos los chunks manualmente en memoria limitada.

    Nota: Para archivos grandes, conviene _upload_stream_multipart.
    """
    # Usamos MultipartUpload si el archivo pudiera ser grande; este helper es para cargas más sencillas.
    # Aquí almacenamos en partes acotadas y hacemos un put_object por chunk acumulado si fuese necesario.
    # Sin embargo, la API de put_object acepta todo el Body de una; para mejor control, usamos multipart.
    # Mantenemos esta función como fallback para contenidos pequeños (<50MB aprox).
    import io

    buf = io.BytesIO()
    total = 0
    for chunk in response_iter:
        if not chunk:
            continue
        total += len(chunk)
        if total > max_size_bytes:
            raise ValueError("File exceeded max size during download")
        buf.write(chunk)

    buf.seek(0)
    s3.put_object(Bucket=bucket, Key=key, Body=buf)
    return {"bytes_uploaded": total, "parts": 1}


def _upload_stream_multipart(s3, bucket, key, response_iter, part_size: int, max_size_bytes: int):
    """
    Sube en multipart para manejar archivos grandes sin exceder memoria.
    """
    mpu = s3.create_multipart_upload(Bucket=bucket, Key=key)
    upload_id = mpu["UploadId"]
    parts = []
    part_number = 1
    total = 0
    import io

    try:
        buf = io.BytesIO()
        for chunk in response_iter:
            if not chunk:
                continue
            # Control de tamaño máximo total (numérico vs numérico)
            total += len(chunk)
            if total > max_size_bytes:
                raise ValueError("File exceeded max size during download")

            # Acumular chunk
            buf.write(chunk)

            # Si pasamos part_size, subimos la parte
            if buf.tell() >= part_size:
                buf.seek(0)
                resp = s3.upload_part(
                    Bucket=bucket,
                    Key=key,
                    PartNumber=part_number,
                    UploadId=upload_id,
                    Body=buf
                )
                parts.append({"ETag": resp["ETag"], "PartNumber": part_number})
                part_number += 1
                buf = io.BytesIO()

        # Última parte si queda residual
        if buf.tell() > 0:
            buf.seek(0)
            resp = s3.upload_part(
                Bucket=bucket,
                Key=key,
                PartNumber=part_number,
                UploadId=upload_id,
                Body=buf
            )
            parts.append({"ETag": resp["ETag"], "PartNumber": part_number})

        # Completar
        s3.complete_multipart_upload(
            Bucket=bucket,
            Key=key,
            MultipartUpload={"Parts": parts},
            UploadId=upload_id
        )
        return {"bytes_uploaded": total, "parts": len(parts)}
    except Exception as e:
        # Abort en error
        try:
            s3.abort_multipart_upload(Bucket=bucket, Key=key, UploadId=upload_id)
        except Exception:
            pass
        raise


# =========================
# Lógica principal de carga por URL
# =========================

# PUBLIC_INTERFACE
def handle_url_upload(event, context):
    """
    Maneja la descarga desde una URL y la subida a S3.

    Body JSON:
      - url: str (requerido)
      - filename: str (opcional; sugerido para el nombre base)
      - max_size_mb: int|str (opcional; por defecto 1024)
      - timeout: int|str (opcional; por defecto 30)
      - part_size_mb: int|str (opcional; por defecto 8; mínimo 5 MB)
      - expiration: int|str (opcional; por defecto 3600)

    Respuesta:
      - 200 con metadata de la subida a S3, incluyendo la clave y tamaño.
      - 4xx/5xx con detalles de error.

    Conversión y validación:
    - Todas las entradas potencialmente string que representan números se convierten a int antes de compararlas.
      Esto evita TypeError: '<' not supported between instances of 'str' and 'int'.
    """
    try:
        params = _extract_params(event)
    except ValueError as ve:
        return _json(400, {"error": str(ve)})

    url = params["url"]
    filename = params["filename"]
    timeout = params["timeout"]
    max_size_bytes = params["max_size_bytes"]
    part_size = params["part_size"]
    bucket = params["bucket"]
    prefix = params["prefix"]
    expiration = params["expiration"]

    # Inicializaciones defensivas para evitar NameError si ocurre un error temprano.
    s3 = None
    key = None
    cl_int = None
    result = None

    # HEAD para inspeccionar Content-Length (si disponible)
    with _requests_session() as sess:
        try:
            head = sess.head(url, timeout=timeout, allow_redirects=True)
        except Exception as e:
            return _json(502, {"error": f"HEAD request failed: {str(e)}"})

        cl_int = _safe_content_length(head.headers)
        # Comparación SOLO con enteros
        if cl_int is not None and cl_int > max_size_bytes:
            return _json(413, {
                "error": "File too large",
                "max_size_mb": params["max_size_mb"],
                "content_length": cl_int
            })

        # GET streaming con control de tamaño durante la descarga
        try:
            r = sess.get(url, stream=True, timeout=timeout)
            r.raise_for_status()
        except requests.RequestException as e:
            return _json(502, {"error": f"GET request failed: {str(e)}"})

        # Preparar S3
        try:
            s3 = _s3_client()
            key = _build_s3_key(filename, prefix)
        except Exception as e:
            # Si fallara la creación del cliente o la key, devolver 500 con detalle y no continuar.
            return _json(500, {"error": f"S3 client initialization failed: {str(e)}"})

        # Elegir modo de carga: si tamaño desconocido o grande, multipart
        # Regla simple: usar multipart si cl_int es None o cl_int >= 8MB
        use_multipart = (cl_int is None) or (cl_int >= 8 * 1024 * 1024)

        try:
            if use_multipart:
                result = _upload_stream_multipart(
                    s3, bucket, key,
                    response_iter=r.iter_content(chunk_size=part_size),
                    part_size=part_size,
                    max_size_bytes=max_size_bytes
                )
            else:
                result = _upload_stream_simple(
                    s3, bucket, key,
                    response_iter=r.iter_content(chunk_size=part_size),
                    max_size_bytes=max_size_bytes
                )
        except ValueError as ve:
            # Exceso de tamaño durante la lectura
            return _json(413, {"error": str(ve)})
        except botocore.exceptions.ClientError as ce:
            return _json(502, {"error": f"S3 upload failed: {str(ce)}"})
        except Exception as e:
            return _json(500, {"error": f"Upload failed: {str(e)}"})

    # Si por alguna razón no se produjo subida (result es None), devolvemos error genérico controlado.
    if result is None or s3 is None or key is None:
        return _json(500, {"error": "Upload did not complete"})

    # Presign de lectura opcional (útil para devolver un link temporal del archivo subido)
    read_url = None
    try:
        read_url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=expiration
        )
    except Exception:
        # Si falla presign, no es crítico para la subida
        read_url = None

    return _json(200, {
        "status": "ok",
        "bucket": bucket,
        "key": key,
        "bytes_uploaded": result.get("bytes_uploaded"),
        "parts": result.get("parts"),
        "content_length_header": cl_int,
        "read_url_expires_in": expiration,
        "read_url": read_url
    })


def _json(status, data):
    """
    Respuesta JSON con statusCode y body serializado.
    """
    return {
        "statusCode": int(status),
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(data)
    }


# PUBLIC_INTERFACE
def lambda_handler(event, context):
    """
    Entry point de AWS Lambda. Delegamos en handle_url_upload.

    Parámetros:
      - event: dict AWS (incluye "body" como str JSON o dict).
      - context: objeto Lambda.

    Retorno:
      - dict con statusCode, headers y body JSON.
    """
    try:
        return handle_url_upload(event, context)
    except Exception as e:
        logger.exception("Unhandled error in lambda_handler")
        return _json(500, {"error": f"Unhandled error: {str(e)}"})
```

## Puntos clave de robustez incorporados

- Conversión explícita a int para:
  - max_size_mb, part_size_mb, timeout, expiration (desde body y/o env).
  - Content-Length (desde cabeceras HTTP) con `_safe_content_length`.
- Comparaciones numéricas siempre entre enteros.
- Mínimo de 5MB por parte en multipart para S3.
- Descarga en streaming con control de `max_size_bytes` durante la lectura para evitar exceder límites si el servidor no entrega `Content-Length`.
- Manejo de errores coherente con códigos 4xx/5xx y mensajes claros.
- Sin funciones duplicadas: un único set de helpers para coerción, parsing y carga.

### Nota de diagnóstico para "Internal Server Error" (500)
Si ve en API Gateway la respuesta genérica `{"message":"Internal Server Error"}`, revise CloudWatch Logs. Antes de este parche, era posible que se lanzara un `NameError/UnboundLocalError` por variables no inicializadas (`s3`, `key`, `result`, `cl_int`) usadas fuera del bloque `with` cuando una rama de error ocurría dentro. Este parche inicializa defensivamente estas variables y evita el uso posterior si la carga no se completó, devolviendo un error controlado con JSON. Además, asegúrese de definir `S3_BUCKET`, `AWS_REGION`/`AWS_DEFAULT_REGION` en el entorno de Lambda.
