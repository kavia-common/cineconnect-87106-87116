# Sección de Subida de Videos — Uso

Este proyecto incluye el componente React `VideoUploadSection` para subir y listar videos, con interfaz en español.

Cómo usarlo en una página existente:

```jsx
import React from 'react';
import VideoUploadSection from './src/components/VideoUploadSection'; // o desde components/index.js

export default function SomePage() {
  return (
    <div className="container" style={{ padding: 16 }}>
      <VideoUploadSection />
    </div>
  );
}
```

Novedades (portadas):
- El formulario permite seleccionar una imagen de portada opcional (JPG/PNG/WEBP, < 5MB).
- Al enviar, la imagen se adjunta como `cover_image` en FormData (multipart) junto al video.
- En listados (sección interna del componente, perfil y tarjetas de la home/creators), se muestra la portada cuando está disponible. Si no existe, se muestra un placeholder amigable.

Notas:
- Valida formatos de video comunes (MP4, WebM, OGG, MOV, AVI, MKV) y tamaño máximo de 100MB.
- Muestra barra de progreso durante la subida.
- Consume `https://s4myuxoa90.execute-api.us-east-2.amazonaws.com/devops/videos_shortfilms` para subir (POST con FormData) y listar (GET).
- Estilos integrados a la guía de estilos existente (botones, pill, card, etc.).
- Mensajes de éxito/error en español.

Backends esperados:
- Si el backend soporta `multipart/form-data`, aceptar el campo de archivo del video como `file` y la portada como `cover_image`.
- Si el backend devuelve el campo de portada como `cover_image`, `cover`, `coverUrl`, `thumbnail` o `poster`, la UI lo detectará automáticamente.
- Si tu backend prefiere base64, adapta el endpoint para aceptar `cover_image` como archivo o agrega un parser de base64; en este proyecto enviamos multipart.

Si necesitas añadir una ruta de navegación:
- Ya existe una página dedicada de subida accesible en: `/subir`.
- El componente `VideoUploadSection` se renderiza en `src/pages/Upload.jsx`.
- La ruta está registrada en `src/App.js` y hay un enlace en la navegación superior (TopNav) con la etiqueta “Subir Video”.
- Si prefieres otra ruta (p. ej. `/upload`), puedes agregar una ruta adicional en `App.js` y otro enlace en `TopNav`.
