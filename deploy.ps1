# Quick Start Script para Deployment en Windows
# Este script automatiza el deployment en Windows con PowerShell

Write-Host "🚀 Iniciando deployment de Sistema de Inventario..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check if .env.production exists
if (-not (Test-Path .env.production)) {
    Write-Host "❌ ERROR: Archivo .env.production no encontrado" -ForegroundColor Red
    Write-Host "Por favor crea .env.production basado en .env.production.example" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Archivo .env.production encontrado" -ForegroundColor Green

# Check Node.js version
$nodeVersion = (node -v).Replace('v','').Split('.')[0]
if ([int]$nodeVersion -lt 18) {
    Write-Host "❌ ERROR: Node.js 18+ requerido. Versión actual: $(node -v)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js versión: $(node -v)" -ForegroundColor Green

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm -v
    Write-Host "✅ pnpm instalado: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Instalando pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Install dependencies
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
pnpm install --frozen-lockfile

# Generate Prisma Client
Write-Host "🔧 Generando Prisma Client..." -ForegroundColor Yellow
pnpm prisma:generate

# Run migrations
Write-Host "🗄️  Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
pnpm prisma:migrate

# Optional: Run seed
$runSeed = Read-Host "¿Deseas ejecutar el seed de base de datos? (y/N)"
if ($runSeed -eq 'y' -or $runSeed -eq 'Y') {
    Write-Host "🌱 Ejecutando seed..." -ForegroundColor Yellow
    pnpm prisma:seed
}

# Build application
Write-Host "🔨 Construyendo aplicación..." -ForegroundColor Yellow
pnpm build

# Check if PM2 is installed
try {
    pm2 -v | Out-Null
    Write-Host "🚀 Iniciando aplicación con PM2..." -ForegroundColor Yellow
    pm2 delete inventory-system 2>$null
    pm2 start "pnpm" --name "inventory-system" -- start
    pm2 save
    Write-Host "✅ Aplicación iniciada con PM2" -ForegroundColor Green
    Write-Host "📊 Ver logs: pm2 logs inventory-system" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  PM2 no instalado. Para instalar:" -ForegroundColor Yellow
    Write-Host "  npm install -g pm2" -ForegroundColor White
    Write-Host ""
    Write-Host "Iniciando con 'pnpm start'..." -ForegroundColor Yellow
    pnpm start
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ Deployment completado!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Verificar que el sitio funciona: http://localhost:3000"
Write-Host "2. Configurar reverse proxy si es necesario"
Write-Host "3. Configurar SSL"
Write-Host "4. Cambiar contraseñas por defecto de usuarios de prueba"
Write-Host ""
Write-Host "🔗 URLs importantes:" -ForegroundColor Yellow
Write-Host "  - Sitio: https://demo-inventory.ecotechcare.ca"
Write-Host "  - Health check: https://demo-inventory.ecotechcare.ca/api/health"
Write-Host ""
Write-Host "👤 Usuarios de prueba:" -ForegroundColor Yellow
Write-Host "  Admin: admin@example.com / Admin123!"
Write-Host "  Staff: staff@example.com / Staff123!"
Write-Host "  Viewer: viewer@example.com / Viewer123!"
Write-Host ""
