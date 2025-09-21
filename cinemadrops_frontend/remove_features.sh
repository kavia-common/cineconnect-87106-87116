#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# remove_features.sh
# Script de limpieza para eliminar Chat, Notificaciones y componentes asociados
# del proyecto React (Cinemadrops Frontend).
#
# Uso:
#   bash remove_features.sh
#
# Qué elimina:
#   - src/drawers/ (ChatDrawer.jsx, NotificationsDrawer.jsx, QuickActionsDrawer.jsx)
#   - src/services/Socket.js
#   - src/__mocks__/socket.io-client.js (mock de jest)
#   - Tests asociados en src/__tests__/drawers/*
#   - Referencias residuales en App.js y TopNav.jsx se deben haber actualizado
#     por code-mods. Este script sólo borra archivos.
#
# Seguridad:
#   - Solicita confirmación antes de borrar.
#   - Modo “dry run” si se pasa --dry-run (no borra, sólo muestra).
#
# Requisitos:
#   - bash en Unix/macOS/Linux
# -----------------------------------------------------------------------------

set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$BASE_DIR/src"

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "[i] Modo dry run: no se borrará ningún archivo."
fi

# Lista de rutas a eliminar
TO_DELETE=(
  "$SRC_DIR/drawers/ChatDrawer.jsx"
  "$SRC_DIR/drawers/NotificationsDrawer.jsx"
  "$SRC_DIR/drawers/QuickActionsDrawer.jsx"
  "$SRC_DIR/services/Socket.js"
  "$SRC_DIR/__mocks__/socket.io-client.js"
  "$SRC_DIR/__tests__/drawers/test_ChatDrawer.test.jsx"
  "$SRC_DIR/__tests__/drawers/test_NotificationsDrawer.test.jsx"
  "$SRC_DIR/__tests__/drawers/test_QuickActionsDrawer.test.jsx"
)

echo "Se eliminarán los siguientes archivos y pruebas relacionadas con chat/notificaciones:"
for f in "${TO_DELETE[@]}"; do
  echo " - $f"
done

read -r -p "¿Confirmas la eliminación? (escribe 'sí' para continuar): " confirm
if [[ "$confirm" != "sí" && "$confirm" != "si" ]]; then
  echo "Operación cancelada por el usuario."
  exit 0
fi

for f in "${TO_DELETE[@]}"; do
  if [[ -e "$f" ]]; then
    if [[ "$DRY_RUN" == true ]]; then
      echo "[dry-run] rm -f \"$f\""
    else
      rm -f "$f"
      echo "[ok] Borrado: $f"
    fi
  else
    echo "[skip] No existe: $f"
  fi
done

# Intentar borrar directorios vacíos
DIRS=(
  "$SRC_DIR/drawers"
  "$SRC_DIR/__mocks__"
  "$SRC_DIR/__tests__/drawers"
)
for d in "${DIRS[@]}"; do
  if [[ -d "$d" ]]; then
    if [[ -z "$(ls -A "$d" 2>/dev/null)" ]]; then
      if [[ "$DRY_RUN" == true ]]; then
        echo "[dry-run] rmdir \"$d\""
      else
        rmdir "$d" && echo "[ok] Directorio eliminado (vacío): $d" || true
      fi
    else
      echo "[info] Directorio no vacío, se conserva: $d"
    fi
  fi
done

echo "Limpieza completada. Recomendado: ejecutar npm test para validar."
