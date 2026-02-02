# Pre-Deployment Checklist - Sistema de Inventario

## ✅ Checklist de Pre-Deployment

### Configuración Básica
- [ ] Archivo `.env.production` creado con todas las variables necesarias
- [ ] `NEXTAUTH_SECRET` generado con `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` configurado a `https://demo-inventory.ecotechcare.ca`
- [ ] `DATABASE_URL` apuntando a base de datos de producción (Neon)

### Base de Datos
- [ ] Base de datos PostgreSQL en Neon creada y accesible
- [ ] IP del servidor agregada a whitelist en Neon
- [ ] Migraciones ejecutadas: `pnpm prisma:migrate`
- [ ] Prisma Client generado: `pnpm prisma:generate`
- [ ] Seed ejecutado (opcional): `pnpm prisma:seed`
- [ ] Verificar que tabla `SystemSettings` tenga un registro inicial

### Seguridad
- [ ] Cambiar contraseñas por defecto (admin@example.com, staff@example.com, viewer@example.com)
- [ ] Variables sensibles NO están en git (verificar .gitignore)
- [ ] CORS configurado correctamente en next.config.ts
- [ ] Security headers habilitados

### Build y Testing
- [ ] Build exitoso localmente: `pnpm build`
- [ ] No hay errores de TypeScript
- [ ] No hay errores de ESLint
- [ ] Prisma schema sincronizado con base de datos
- [ ] Todas las dependencias instaladas: `pnpm install`

### Dominio y DNS
- [ ] DNS apuntando `demo-inventory.ecotechcare.ca` a IP del servidor
- [ ] Puerto 80 (HTTP) abierto
- [ ] Puerto 443 (HTTPS) abierto
- [ ] Propagación DNS verificada

### Servidor
- [ ] Node.js 20+ instalado
- [ ] pnpm instalado globalmente
- [ ] Nginx instalado (si se usa como reverse proxy)
- [ ] Certbot instalado para SSL
- [ ] PM2 o similar para process management (opcional)

### Archivos de Deployment
- [ ] `Dockerfile.prod` presente
- [ ] `docker-compose.prod.yml` presente
- [ ] `nginx.conf` configurado
- [ ] `.env.production.example` como referencia
- [ ] `DEPLOYMENT.md` actualizado

### Deployment Options

#### Opción 1: Deployment Directo con Node.js
```bash
# 1. Clonar repositorio
git clone <tu-repo> inventory-system
cd inventory-system

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.production.example .env.production
nano .env.production  # Editar con tus valores reales

# 4. Ejecutar migraciones
pnpm prisma:migrate

# 5. Build
pnpm build

# 6. Iniciar con PM2 (recomendado)
pm2 start pnpm --name "inventory-system" -- start
pm2 save
pm2 startup
```

#### Opción 2: Deployment con Docker
```bash
# 1. Clonar repositorio
git clone <tu-repo> inventory-system
cd inventory-system

# 2. Configurar variables de entorno
cp .env.production.example .env.production
nano .env.production  # Editar con tus valores reales

# 3. Build imagen Docker
pnpm docker:build

# 4. Iniciar contenedor
pnpm docker:up

# 5. Ver logs
pnpm docker:logs
```

### Configurar Nginx (si aplica)
```bash
# Copiar configuración
sudo cp nginx.conf /etc/nginx/sites-available/demo-inventory

# Crear symlink
sudo ln -s /etc/nginx/sites-available/demo-inventory /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Configurar SSL con Certbot
```bash
sudo certbot --nginx -d demo-inventory.ecotechcare.ca
```

### Post-Deployment
- [ ] Sitio accesible en https://demo-inventory.ecotechcare.ca
- [ ] Login funciona con usuarios de prueba
- [ ] Tema oscuro funciona correctamente
- [ ] Crear/editar productos funciona (ADMIN/STAFF)
- [ ] Movimientos de inventario funcionan
- [ ] Exportar PDF/Excel funciona
- [ ] Permisos por rol funcionan (ADMIN/STAFF/VIEWER)
- [ ] Health check responde: https://demo-inventory.ecotechcare.ca/api/health

### Monitoreo
- [ ] Configurar logs rotation
- [ ] Configurar monitoring (Uptime, health checks)
- [ ] Configurar backups de base de datos
- [ ] Documentar procedimiento de rollback

### Comandos Útiles

**Ver logs con PM2:**
```bash
pm2 logs inventory-system
```

**Reiniciar aplicación:**
```bash
pm2 restart inventory-system
```

**Detener aplicación:**
```bash
pm2 stop inventory-system
```

**Ver logs con Docker:**
```bash
pnpm docker:logs
```

**Detener Docker:**
```bash
pnpm docker:down
```

**Backup base de datos (Neon):**
Se hace desde el dashboard de Neon, o usando pg_dump si tienes acceso directo.

---

## 🚨 Troubleshooting Común

### Error: Cannot connect to database
- Verificar `DATABASE_URL` en `.env.production`
- Verificar IP del servidor en whitelist de Neon
- Verificar que la base de datos existe

### Error: NEXTAUTH_SECRET not found
- Verificar que `.env.production` tiene `NEXTAUTH_SECRET`
- Verificar que se generó con `openssl rand -base64 32`

### Error 500 en login
- Verificar que `NEXTAUTH_URL` coincide con el dominio
- Verificar que las migraciones se ejecutaron
- Verificar logs para más detalles

### Tema oscuro no aparece
- Verificar que hay un registro en tabla `SystemSettings`
- Ejecutar seed si es necesario: `pnpm prisma:seed`
- Limpiar caché del navegador

---

**Fecha de última actualización:** $(date)
**Versión del sistema:** 1.0.0
**Dominio de producción:** demo-inventory.ecotechcare.ca
