#!/bin/bash
# Script de configuración para el sistema de chat

echo "🚀 Configurando el sistema de chat para WeTeamWork..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm primero."
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Generar cliente de Prisma
echo "🗄️ Configurando base de datos..."
npx prisma generate

# Verificar que las dependencias de socket.io estén instaladas
echo "🔌 Verificando dependencias de Socket.io..."
if npm list socket.io &> /dev/null && npm list socket.io-client &> /dev/null; then
    echo "✅ Socket.io configurado correctamente"
else
    echo "⚠️ Instalando dependencias de Socket.io..."
    npm install socket.io socket.io-client
fi

echo ""
echo "🎉 ¡Sistema de chat configurado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Configura tu base de datos ejecutando: npx prisma db push"
echo "   2. Inicia el servidor con chat: npm run dev"
echo "   3. Abre tu proyecto y verás el chat en la esquina inferior derecha"
echo ""
echo "💡 Consejos:"
echo "   • El chat inicia minimizado - haz clic en la barra azul para abrirlo"
echo "   • Los mensajes son en tiempo real para todos los miembros del proyecto"
echo "   • Hay un indicador visual cuando tienes mensajes no leídos"
echo ""
echo "🆘 Si tienes problemas:"
echo "   • Revisa que el servidor esté corriendo con 'npm run dev' (no 'dev:next')"
echo "   • Verifica la consola del navegador por errores"
echo "   • Lee CHAT_README.md para más información"
echo ""