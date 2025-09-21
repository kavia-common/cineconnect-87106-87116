# Lambda Bug Fix Guide: TypeError for "<" between 'str' and 'int' in handle_url_upload

This document explains the root cause and provides a patch template for the AWS Lambda handler (handle_url_upload) used to download a video from an external URL and upload it to storage. The fix ensures all numeric comparisons use integers to avoid the Python error:

TypeError: '<' not supported between instances of 'str' and 'int'

## Root cause
During the URL upload flow we typically:
1. Parse incoming JSON/body parameters such as `max_size_mb`, `timeout`, `part_size`, etc.
2. Fetch remote resource headers with `requests` or `urllib` to get `Content-Length`.
3. Compare values with `<` or `>` to enforce size limits or control logic.

When any of these numeric values are strings (e.g., environment vars, query/body params, or HTTP headers like `Content-Length` are read as strings), Python raises a TypeError when comparing to ints.

Common places:
- `if content_length < max_size_bytes:` where `content_length` came from `headers['Content-Length']` as a string.
- `if part_size < 5 * 1024 * 1024:` where `part_size` came from request body as string.
- `if timeout < 1:` where `timeout` is string.

## Fix strategy
- Coerce inputs to integers early and validate.
- Use defensive parsing: allow numeric strings (e.g., "50", "50.0") and handle missing values.
- For HTTP headers like `Content-Length`, parse safely and default to None when absent.

## Example patch for handle_url_upload

Below is a generalized patch you can adapt to your Lambda function. Replace your existing parsing and comparisons with the following pattern.

```python
# PUBLIC_INTERFACE
def handle_url_upload(event, context):
    """
    Handle video download from a provided URL and upload to storage.

    Body JSON (example):
      - url: str (required)
      - max_size_mb: int or str numeric (optional, default 1024)  # 1 GB
      - timeout: int or str numeric seconds (optional, default 30)
      - part_size_mb: int or str numeric (optional, default 8)

    Returns:
      JSON response with status and metadata; raises 4xx/5xx on error.
    """
    import json
    import math
    import os
    import re
    import requests

    def _to_int(value, default=None, field_name=""):
        """
        Convert value to int when possible:
        - Accepts int, float, numeric strings (e.g., "10", "10.0")
        - Returns default if None/empty, or raises ValueError for invalid non-numeric
        """
        if value is None or value == "":
            return default
        if isinstance(value, int):
            return value
        if isinstance(value, float):
            return int(value)
        if isinstance(value, str):
            s = value.strip()
            # Accept simple numeric formats
            if re.fullmatch(r"[+-]?\d+", s):
                return int(s)
            if re.fullmatch(r"[+-]?\d+\.\d+", s):
                return int(float(s))
        raise ValueError(f"Invalid integer for {field_name or 'value'}: {value!r}")

    # Parse body
    body = event.get("body")
    if isinstance(body, str):
        try:
            body = json.loads(body)
        except json.JSONDecodeError:
            body = {}
    elif body is None:
        body = {}

    url = (body.get("url") or "").strip()
    if not url:
        return {"statusCode": 400, "body": json.dumps({"error": "Missing 'url'"})}

    # Coerce numeric inputs with defaults
    max_size_mb = _to_int(body.get("max_size_mb"), default=1024, field_name="max_size_mb")
    timeout = _to_int(body.get("timeout"), default=30, field_name="timeout")
    part_size_mb = _to_int(body.get("part_size_mb"), default=8, field_name="part_size_mb")

    # Compute byte values
    max_size_bytes = max_size_mb * 1024 * 1024
    part_size = part_size_mb * 1024 * 1024

    # Enforce sane minimums
    if timeout < 1:
        timeout = 1
    if part_size < 5 * 1024 * 1024:  # e.g., minimum 5MB chunk for multipart
        part_size = 5 * 1024 * 1024

    # HEAD request to inspect content length
    try:
        head = requests.head(url, timeout=timeout, allow_redirects=True)
    except Exception as e:
        return {"statusCode": 502, "body": json.dumps({"error": f"HEAD request failed: {str(e)}"})}

    content_length = head.headers.get("Content-Length")
    # Coerce Content-Length if present
    cl_int = None
    try:
        if content_length is not None:
            cl_int = _to_int(content_length, field_name="Content-Length")
    except ValueError:
        # Non-numeric content length - proceed as unknown
        cl_int = None

    # Compare only with integers
    if cl_int is not None and cl_int > max_size_bytes:
        return {
            "statusCode": 413,
            "body": json.dumps({"error": "File too large", "max_size_mb": max_size_mb, "content_length": cl_int})
        }

    # Proceed with download (streaming) and enforce limit during stream as well
    try:
        with requests.get(url, stream=True, timeout=timeout) as r:
            r.raise_for_status()
            downloaded = 0
            # Example: write to tmp and/or upload to S3 in parts
            for chunk in r.iter_content(chunk_size=part_size):
                if not chunk:
                    continue
                downloaded += len(chunk)

                # Guard with integer comparison
                if downloaded > max_size_bytes:
                    return {"statusCode": 413, "body": json.dumps({"error": "File exceeded max size during download"})}

                # ... write/upload chunk ...
            # ... finalize upload ...
    except requests.RequestException as e:
        return {"statusCode": 502, "body": json.dumps({"error": f"GET request failed: {str(e)}"})}

    return {"statusCode": 200, "body": json.dumps({"status": "ok"})}
```

## Checklist to find and fix in your codebase
Search in your Lambda project for:
- `handle_url_upload` or similar handler.
- Any `<` or `>` comparisons involving:
  - `max_size`, `max_size_mb`, `max_bytes`
  - `timeout`, `part_size`, `chunk_size`
  - `Content-Length`, `content_length`, `headers.get('Content-Length')`

Ensure both sides are integers:
- Convert headers to int: `cl_int = int(headers.get('Content-Length'))` with try/except.
- Convert request params: `int(body.get('max_size_mb', 1024))`.
- Avoid comparing strings to ints.

## Example diff-style guidance (pseudo)
Before:
```python
max_size_mb = event['queryStringParameters'].get('max_size_mb', '1024')
if content_length < max_size_mb * 1024 * 1024:
    ...
```

After:
```python
max_size_mb = int(event.get('queryStringParameters', {}).get('max_size_mb', 1024))
cl = headers.get('Content-Length')
content_length = int(cl) if cl is not None and cl.isdigit() else None

if content_length is not None and content_length < max_size_mb * 1024 * 1024:
    ...
```

## Summary of the bug
- Bug: Python TypeError due to comparing a string (e.g., "12345") with an integer using `<`.
- Fix: Coerce all numeric inputs (params and headers) to integers before comparison; add validation and safe defaults.

Apply this pattern in your Lambda handler and any helpers it uses to ensure consistent numeric types throughout the flow.
