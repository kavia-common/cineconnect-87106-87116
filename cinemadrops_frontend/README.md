# Cinemadrops Frontend (React)

Cinemadrops es una plataforma lúdica y colaborativa para cortometrajes. Este frontend implementa:
- Feed de descubrimiento
- Páginas detalladas de películas con “behind the scenes” y scripts
- Perfiles de creadores
- Comentarios y foros
- Retos semanales
- Layout responsive con navegación superior, barra lateral derecha y una cuadrícula principal

Estado actual: se ha eliminado la funcionalidad de chat en vivo y notificaciones en tiempo real.

Nota sobre Discover:
- Por requerimiento de pruebas, el feed Discover muestra SIEMPRE una imagen de portada estática en cada tarjeta de video, sin depender de campos de asset/thumbnail. Esto se implementa en el componente FilmCard usando un placeholder fijo (/assets/pexels-amar-29656074.jpg).

## Tech
- React 18 + React Router v6
- SWR para fetching
- CSS artesanal (sin framework pesado)

## Ejecutar localmente
1) Copia la configuración de entorno
```
cp .env.example .env
```
2) Edita `.env` y define la URL base de tu API:
```
# Si usas el gateway Lambda en AWS:
REACT_APP_API_BASE_URL=https://s4myuxoa90.execute-api.us-east-2.amazonaws.com/devops

# O si usas un backend local:
REACT_APP_API_BASE=http://localhost:4000
```
3) Instala y arranca
```
npm install
npm start
```

Abre http://localhost:3000

## Estructura del proyecto
- src/services/Api.js — helpers de API y SWR
- src/components/* — Componentes reutilizables (TopNav, RightSidebar, FilmCard, Comments)
- src/pages/* — Páginas de rutas (Home, FilmDetails, CreatorProfile, Forums, Challenges)
- src/index.css — Estilos del tema

Se han removido:
- src/drawers/* — Chat, Notificaciones, Quick Actions
- src/services/Socket.js — Proveedor de WebSocket

## Script de limpieza
Para borrar los archivos de chat/notificaciones en otros entornos o ramas:
```
bash remove_features.sh
```
Opcionalmente, puedes ejecutar primero en modo dry run:
```
bash remove_features.sh --dry-run
```

## Variables de entorno
- REACT_APP_API_BASE — Base URL del backend REST (desarrollo/local).
- REACT_APP_API_BASE_URL — Base URL del API Gateway (Lambda) para producción o staging.

Descubrir/Discover:
- Ahora la página Discover integra el endpoint real GET `/videos_shortfilms` (Lambda/API Gateway).
- El componente parsea `response.body.videos` según el código de Lambda y renderiza: título, género, autor, fecha de subida y URL del video (campos auxiliares quedan disponibles para futuras vistas).
- Asegúrate de definir `REACT_APP_API_BASE_URL` (o `REACT_APP_API_BASE`) para que `ApiProvider` pueda construir las URLs correctas.

No uses secretos reales en el repo; utiliza `.env` locales o variables de entorno en despliegue.
