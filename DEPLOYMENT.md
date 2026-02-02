# Guía de Deployment - Sistema de Inventario

## 🚀 Deployment desde Git (Recomendado)

El sistema está listo para deployment automático desde repositorios Git en múltiples plataformas.

### Opción 1: Vercel (Más Fácil para Next.js) ⭐

**Características:**
- ✅ Deploy automático desde GitHub/GitLab
- ✅ Preview deployments en cada PR
- ✅ SSL automático
- ✅ CDN global
- ✅ Edge functions

**Pasos:**

1. **Sube tu código a GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/inventory-system.git
git push -u origin main
```

2. **Conecta con Vercel:**
- Ve a [vercel.com](https://vercel.com)
- Click en "Import Project"
- Selecciona tu repositorio de GitHub
- Vercel detectará Next.js automáticamente

3. **Configura Variables de Entorno en Vercel:**
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://tu-proyecto.vercel.app
NEXTAUTH_SECRET=<genera con: openssl rand -base64 32>
CRON_SECRET=<genera con: openssl rand -hex 32>
NODE_ENV=production
```

4. **Deploy:**
- Click "Deploy"
- Vercel ejecutará: `pnpm install`, `pnpm build`, y desplegará automáticamente

5. **Configurar Dominio Personalizado:**
- En Vercel Dashboard → Settings → Domains
- Agregar: `demo-inventory.ecotechcare.ca`
- Configurar DNS apuntando a Vercel

6. **Configurar Cron Job:**
- Usa [cron-job.org](https://cron-job.org) o [EasyCron](https://easycron.com)
- URL: `https://demo-inventory.ecotechcare.ca/api/cron/cleanup`
- Header: `Authorization: Bearer <CRON_SECRET>`
- Frecuencia: Cada 15 minutos

**Ventajas:**
- Deploy en segundos
- Preview automático de PRs
- No requiere configuración de servidor

**Limitaciones:**
- Serverless (no puedes correr cron jobs nativos)

---

### Opción 2: Railway 🚂

**Características:**
- ✅ Deployment desde GitHub
- ✅ Base de datos PostgreSQL incluida
- ✅ Cron jobs nativos
- ✅ Variables de entorno fáciles

**Pasos:**

1. **Sube a GitHub** (igual que Vercel)

2. **Deploy en Railway:**
- Ve a [railway.app](https://railway.app)
- "New Project" → "Deploy from GitHub repo"
- Selecciona tu repositorio

3. **Agregar PostgreSQL:**
- En tu proyecto Railway, click "New" → "Database" → "PostgreSQL"
- Railway generará `DATABASE_URL` automáticamente

4. **Configurar Variables de Entorno:**
```
NEXTAUTH_URL=https://tu-app.railway.app
NEXTAUTH_SECRET=<openssl rand -base64 32>
CRON_SECRET=<openssl rand -hex 32>
NODE_ENV=production
```

5. **Build Settings:**
Railway detecta Next.js automáticamente. Si necesitas customizar:
```
Build Command: pnpm install && pnpm prisma:generate && pnpm build
Start Command: pnpm start
```

6. **Migraciones Automáticas:**
Agrega script en `package.json`:
```json
"railway:build": "pnpm prisma:generate && pnpm prisma migrate deploy && pnpm build"
```

7. **Configurar Cron Job en Railway:**
- Railway permite cron jobs nativos con Railway CLI
- O usa cron-job.org externo

**Ventajas:**
- PostgreSQL incluido
- Soporte para cron jobs
- Precios competitivos

---

### Opción 3: Render 🎨

**Características:**
- ✅ Deploy automático desde Git
- ✅ PostgreSQL incluido
- ✅ Cron jobs nativos
- ✅ SSL gratuito

**Pasos:**

1. **Crear Web Service en Render:**
- Ve a [render.com](https://render.com)
- "New" → "Web Service"
- Conecta tu repositorio GitHub

2. **Configuración:**
```
Name: inventory-system
Build Command: pnpm install && pnpm prisma:generate && pnpm build
Start Command: pnpm start
```

3. **Variables de Entorno:**
Agregar en Render Dashboard:
```
DATABASE_URL=<URL de PostgreSQL de Render>
NEXTAUTH_URL=https://inventory-system.onrender.com
NEXTAUTH_SECRET=<openssl rand -base64 32>
CRON_SECRET=<openssl rand -hex 32>
NODE_ENV=production
```

4. **Agregar PostgreSQL:**
- "New" → "PostgreSQL"
- Render generará `DATABASE_URL`

5. **Cron Job en Render:**
- "New" → "Cron Job"
- Command: `curl -H "Authorization: Bearer $CRON_SECRET" https://tu-app.onrender.com/api/cron/cleanup`
- Schedule: `*/15 * * * *` (cada 15 minutos)

**Ventajas:**
- PostgreSQL + Web Service + Cron Jobs todo en uno
- Free tier disponible

---

### Opción 4: GitHub Actions + Tu Servidor

**Para deployment en tu propio servidor con auto-deploy desde Git:**

1. **Crea `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /var/www/inventory-system
          git pull origin main
          pnpm install
          pnpm prisma:generate
          pnpm prisma migrate deploy
          pnpm build
          pm2 restart inventory-system
```

2. **Configurar Secrets en GitHub:**
- Settings → Secrets → Actions
- Agregar: `SERVER_HOST`, `SERVER_USER`, `SSH_PRIVATE_KEY`

3. **Cada push a `main` desplegará automáticamente**

---

## 📋 Preparación del Repositorio Git

### Archivos Importantes

**`.gitignore` ya incluye:**
```gitignore
.env*
!.env.example
!.env.production.example
node_modules/
.next/
```

**Archivos a incluir en Git:**
- ✅ `package.json`
- ✅ `prisma/schema.prisma`
- ✅ `prisma/migrations/`
- ✅ `.env.example`
- ✅ `.env.production.example`
- ✅ Todo el código fuente (`src/`)

**NO subir a Git:**
- ❌ `.env`
- ❌ `.env.production` (contiene secretos)
- ❌ `node_modules/`
- ❌ `.next/`

### Comandos Git Básicos

```bash
# Inicializar repositorio
git init

# Agregar archivos
git add .

# Commit
git commit -m "Sistema de inventario completo con seguridad y demo cleanup"

# Conectar a GitHub
git remote add origin https://github.com/tu-usuario/inventory-system.git

# Subir código
git push -u origin main

# Crear branch para features
git checkout -b feature/nueva-funcionalidad

# Merge a main
git checkout main
git merge feature/nueva-funcionalidad
git push
```

---

## Preparación para Deployment en demo-inventory.ecotechcare.ca

### 1. Variables de Entorno

Crea un archivo `.env.production` en el directorio raíz con las siguientes variables:

```bash
# Database URL - Tu base de datos PostgreSQL en Neon
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="https://demo-inventory.ecotechcare.ca"
NEXTAUTH_SECRET="tu-secret-aqui-generado-con-openssl"

NODE_ENV="production"
```

#### Generar NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 2. Configuración de Base de Datos

1. Asegúrate de que tu base de datos PostgreSQL en Neon esté configurada
2. Ejecuta las migraciones en producción:
```bash
pnpm prisma migrate deploy
```

3. (Opcional) Ejecuta el seed para crear usuarios iniciales:
```bash
pnpm prisma db seed
```

### 3. Build del Proyecto

```bash
pnpm install
pnpm build
```

### 4. Variables de Entorno Requeridas en el Host

En tu servidor/hosting, configura estas variables de entorno:

- `DATABASE_URL`: URL de conexión a PostgreSQL
- `NEXTAUTH_URL`: https://demo-inventory.ecotechcare.ca
- `NEXTAUTH_SECRET`: Tu secret generado
- `NODE_ENV`: production

### 5. Configuración del Servidor

#### Opción A: Node.js Server
```bash
pnpm start
```

#### Opción B: Docker (recomendado)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 6. Configuración de Dominio

En tu DNS, apunta `demo-inventory.ecotechcare.ca` a tu servidor.

Si usas Nginx como reverse proxy:

```nginx
server {
    listen 80;
    server_name demo-inventory.ecotechcare.ca;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. SSL/HTTPS (Certbot)

```bash
sudo certbot --nginx -d demo-inventory.ecotechcare.ca
```

### 8. Usuarios por Defecto

Después del seed, tendrás estos usuarios de prueba:

**Admin:**
- Email: admin@example.com
- Password: Admin123!

**Staff:**
- Email: staff@example.com
- Password: Staff123!

**Viewer:**
- Email: viewer@example.com
- Password: Viewer123!

⚠️ **IMPORTANTE**: Cambia estas contraseñas en producción después del primer login.

### 9. Verificación Post-Deployment

- [ ] El sitio carga en https://demo-inventory.ecotechcare.ca
- [ ] Login funciona correctamente
- [ ] Tema oscuro funciona (cambiar en Configuración)
- [ ] Roles ADMIN/STAFF/VIEWER funcionan según permisos
- [ ] Operaciones de inventario funcionan
- [ ] Exportar PDF/Excel funciona

### 10. Mantenimiento

#### Ver logs:
```bash
pnpm logs
```

#### Reiniciar aplicación:
```bash
pnpm restart
```

#### Actualizar código:
```bash
git pull
pnpm install
pnpm build
pnpm restart
```

### Troubleshooting

**Error de conexión a base de datos:**
- Verifica DATABASE_URL
- Confirma que la IP del servidor está en la whitelist de Neon

**Error 500 en login:**
- Verifica NEXTAUTH_SECRET esté configurado
- Verifica NEXTAUTH_URL coincida con tu dominio

**Tema oscuro no funciona:**
- Limpia caché del navegador
- Verifica que SystemSettings tenga un registro en la base de datos
