#!/bin/bash

# Quick Start Script para Deployment
# Este script automatiza el deployment en un servidor Linux

set -e  # Exit on error

echo "🚀 Iniciando deployment de Sistema de Inventario..."
echo "=================================================="

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ ERROR: Archivo .env.production no encontrado"
    echo "Por favor crea .env.production basado en .env.production.example"
    exit 1
fi

echo "✅ Archivo .env.production encontrado"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ ERROR: Node.js 18+ requerido. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js versión: $(node -v)"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Instalando pnpm..."
    npm install -g pnpm
fi

echo "✅ pnpm instalado: $(pnpm -v)"

# Install dependencies
echo "📦 Instalando dependencias..."
pnpm install --frozen-lockfile

# Generate Prisma Client
echo "🔧 Generando Prisma Client..."
pnpm prisma:generate

# Run migrations
echo "🗄️  Ejecutando migraciones de base de datos..."
pnpm prisma:migrate

# Optional: Run seed
read -p "¿Deseas ejecutar el seed de base de datos? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Ejecutando seed..."
    pnpm prisma:seed
fi

# Build application
echo "🔨 Construyendo aplicación..."
pnpm build

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
    echo "🚀 Iniciando aplicación con PM2..."
    pm2 delete inventory-system 2>/dev/null || true
    pm2 start pnpm --name "inventory-system" -- start
    pm2 save
    echo "✅ Aplicación iniciada con PM2"
    echo "📊 Ver logs: pm2 logs inventory-system"
else
    echo "⚠️  PM2 no instalado. Iniciando con 'pnpm start'..."
    echo "Recomendación: Instala PM2 para mejor gestión de procesos"
    echo "  npm install -g pm2"
    pnpm start
fi

echo ""
echo "=================================================="
echo "✅ Deployment completado!"
echo "=================================================="
echo ""
echo "📝 Próximos pasos:"
echo "1. Verificar que el sitio funciona: http://localhost:3000"
echo "2. Configurar Nginx si es necesario (ver nginx.conf)"
echo "3. Configurar SSL con certbot"
echo "4. Cambiar contraseñas por defecto de usuarios de prueba"
echo ""
echo "🔗 URLs importantes:"
echo "  - Sitio: https://demo-inventory.ecotechcare.ca"
echo "  - Health check: https://demo-inventory.ecotechcare.ca/api/health"
echo ""
echo "👤 Usuarios de prueba:"
echo "  Admin: admin@example.com / Admin123!"
echo "  Staff: staff@example.com / Staff123!"
echo "  Viewer: viewer@example.com / Viewer123!"
echo ""
