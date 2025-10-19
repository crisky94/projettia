#!/bin/bash

echo "🚀 Iniciando servidor de desarrollo con chat en tiempo real..."

# Matar cualquier proceso previo en el puerto 3000
lsof -ti :3000 | xargs kill -9 2>/dev/null || true

# Esperar un momento para que el puerto se libere
sleep 2

# Iniciar el servidor con soporte para chat
node app/server.js
