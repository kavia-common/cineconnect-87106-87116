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

Notas:
- Valida formatos de video comunes (MP4, WebM, OGG, MOV, AVI, MKV) y tamaño máximo de 100MB.
- Muestra barra de progreso durante la subida.
- Consume `https://s4myuxoa90.execute-api.us-east-2.amazonaws.com/devops/videos_shortfilms` para subir (POST con FormData) y listar (GET).
- Estilos integrados a la guía de estilos existente (botones, pill, card, etc.).
- Mensajes de éxito/error en español.

Si necesitas añadir una ruta de navegación:
- Crea una página nueva que importe y renderice `VideoUploadSection`.
- Agrega una `Route` en `src/App.js` y un enlace en `TopNav` si corresponde.
