#!/bin/bash

# Chat Setup Script para macOS
# Este script configura el sistema de chat para el proyecto werteamwork

echo "🚀 Configurando el sistema de chat para werteamwork en macOS..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm"
    exit 1
fi

echo "✅ Node.js y npm están instalados"

# Instalar dependencias si no están instaladas
echo "📦 Verificando dependencias del chat..."

# Verificar si socket.io está instalado
if ! npm list socket.io &> /dev/null; then
    echo "📦 Instalando socket.io..."
    npm install socket.io
fi

# Verificar si socket.io-client está instalado
if ! npm list socket.io-client &> /dev/null; then
    echo "📦 Instalando socket.io-client..."
    npm install socket.io-client
fi

echo "✅ Todas las dependencias están instaladas"

# Verificar que los archivos del chat existan
echo "🔍 Verificando archivos del chat..."

if [ ! -f "app/components/chat/MinimizableChat.jsx" ]; then
    echo "❌ Archivo MinimizableChat.jsx no encontrado"
    exit 1
fi

if [ ! -f "app/lib/socket.js" ]; then
    echo "❌ Archivo socket.js no encontrado"
    exit 1
fi

if [ ! -f "app/server.js" ]; then
    echo "❌ Archivo server.js no encontrado"
    exit 1
fi

echo "✅ Todos los archivos del chat están presentes"

# Crear script de desarrollo para macOS
echo "📝 Creando script de desarrollo..."

cat > start-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando servidor de desarrollo con chat en tiempo real..."

# Matar cualquier proceso previo en el puerto 3000
lsof -ti :3000 | xargs kill -9 2>/dev/null || true

# Esperar un momento para que el puerto se libere
sleep 2

# Iniciar el servidor con soporte para chat
node app/server.js
EOF

chmod +x start-dev.sh

echo "✅ Script de desarrollo creado (start-dev.sh)"

# Verificar la base de datos
echo "🗄️ Verificando configuración de la base de datos..."

if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Schema de Prisma no encontrado"
    exit 1
fi

# Verificar que el modelo Message exista en el schema
if ! grep -q "model Message" prisma/schema.prisma; then
    echo "❌ Modelo Message no encontrado en el schema de Prisma"
    echo "Por favor asegúrate de que el modelo Message esté definido en prisma/schema.prisma"
    exit 1
fi

echo "✅ Configuración de base de datos verificada"

echo ""
echo "🎉 ¡Configuración del chat completada!"
echo ""
echo "📋 Para usar el chat:"
echo "   1. Ejecuta: ./start-dev.sh"
echo "   2. Abre http://localhost:3000"
echo "   3. Ve a cualquier proyecto"
echo "   4. El chat aparecerá en la esquina inferior derecha"
echo ""
echo "💡 Características del chat:"
echo "   • Chat en tiempo real para cada proyecto"
echo "   • Interfaz minimizable"
echo "   • Indicador de mensajes no leídos"
echo "   • Scroll automático a nuevos mensajes"
echo "   • Diseño responsive para móvil y desktop"
echo ""
echo "🔧 Si necesitas ayuda:"
echo "   • Verifica que el puerto 3000 esté libre"
echo "   • Revisa los logs del servidor en la terminal"
echo "   • Asegúrate de que la base de datos esté corriendo"
echo ""