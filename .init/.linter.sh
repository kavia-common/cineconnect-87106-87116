#!/bin/bash
cd /home/kavia/workspace/code-generation/cineconnect-87106-87116/cinemadrops_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

