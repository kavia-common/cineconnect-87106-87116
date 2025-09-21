# Cinemadrops Frontend (React)

Cinemadrops es una plataforma lúdica y colaborativa para cortometrajes. Este frontend implementa:
- Feed de descubrimiento y listas curadas
- Páginas detalladas de películas con “behind the scenes” y scripts
- Perfiles de creadores
- Comentarios y foros
- Retos semanales
- Layout responsive con navegación superior, barra lateral derecha y una cuadrícula principal

Estado actual: se ha eliminado la funcionalidad de chat en vivo y notificaciones en tiempo real.

## Tech
- React 18 + React Router v6
- SWR para fetching
- CSS artesanal (sin framework pesado)

## Ejecutar localmente
1) Copia la configuración de entorno
```
cp .env.example .env
```
2) Edita `.env` y define:
```
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
- src/pages/* — Páginas de rutas (Home, FilmDetails, CreatorProfile, Forums, Challenges, Curated)
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
- REACT_APP_API_BASE — Base URL del backend REST (requerido)

No uses secretos reales en el repo; utiliza `.env` locales o variables de entorno en despliegue.
