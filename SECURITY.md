# Documentación de Seguridad - Sistema de Inventario

## 🔒 Medidas de Seguridad Implementadas

### 1. Autenticación y Autorización

**NextAuth con JWT**
- Sesiones basadas en JWT (sin almacenamiento en BD)
- Passwords hasheados con bcrypt (10 rounds mínimo)
- Validación con Zod para inputs
- Verificación de usuario activo (`isActive`)

**RBAC (Control de Acceso por Roles)**
- `ADMIN`: Acceso total al sistema
- `STAFF`: Crear/editar productos y movimientos
- `VIEWER`: Solo lectura

**Middleware de protección:**
```typescript
requireSession() // Requiere autenticación
requireAdmin()   // Solo ADMIN
requireRole(['ADMIN', 'STAFF']) // Múltiples roles
```

### 2. Datos de Prueba Auto-Eliminables

**Sistema de Demo Temporal**

Los productos y usuarios creados para pruebas se eliminan automáticamente después de 1 hora.

**Detección automática:**
- **Usuarios:** Si el email contiene `test`, `demo`, o `example` (excepto admin@example.com)
- **Productos:** Si el SKU contiene `test`, `demo`, o `example`

**Campos en base de datos:**
```prisma
isDemo      Boolean   @default(false)
expiresAt   DateTime? // 1 hora después de creación
```

**Limpieza automática:**
- Endpoint: `GET /api/cron/cleanup`
- Frecuencia recomendada: Cada 15 minutos
- Protección: Header `Authorization: Bearer <CRON_SECRET>`

**Configurar cron job:**
```bash
# En cron-job.org o similar
URL: https://demo-inventory.ecotechcare.ca/api/cron/cleanup
Method: GET
Headers: Authorization: Bearer your-secret-token
Frequency: */15 * * * * (cada 15 minutos)
```

### 3. Variables de Entorno

**Validación estricta con Zod:**
```typescript
validateEnv() // Valida al inicio
```

**Variables requeridas:**
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: URL del sitio
- `NEXTAUTH_SECRET`: Min 32 caracteres
- `CRON_SECRET`: (opcional) Protección del cron endpoint

### 4. Security Headers

**Headers configurados en Next.js:**
- `Strict-Transport-Security`: HSTS habilitado
- `X-Frame-Options`: Protección contra clickjacking
- `X-Content-Type-Options`: nosniff
- `X-XSS-Protection`: Protección XSS
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Permissions-Policy`: Bloqueo de cámara/micrófono/geolocalización

### 5. Base de Datos

**Configuración de Pool:**
```typescript
max: 20                      // Máximo 20 conexiones
idleTimeoutMillis: 30000     // Timeout de conexiones idle
connectionTimeoutMillis: 10000 // Timeout de conexión
```

**Cascade Deletes:**
- Eliminar producto → elimina balances y movimientos
- Eliminar usuario → elimina cuentas y sesiones

**Índices de rendimiento:**
- `Product_isDemo_expiresAt_idx`
- `User_isDemo_expiresAt_idx`

### 6. Rate Limiting

**Implementación básica en memoria:**
- 60 requests por minuto por IP
- Ventana deslizante de 1 minuto
- Headers de respuesta con límites

**Para producción seria:** Usar Redis o Upstash

### 7. Protección de Datos Sensibles

**Nunca en git:**
- `.env*` (excepto `.env.example`)
- Secrets y tokens
- Configuraciones de producción

**Logs:**
- Solo errores y warnings en producción
- Sin logging de passwords o datos sensibles

### 8. Configuración de SystemSettings

**Valores por defecto de seguridad:**
```prisma
maxLoginAttempts: 5           // Máximo intentos de login
lockoutDurationMins: 15       // Bloqueo tras intentos fallidos
sessionTimeoutMins: 480       // 8 horas de sesión
demoDataRetentionHours: 1     // Retención de datos demo
```

## 📊 Monitoreo de Datos Demo

**Endpoint de estadísticas (solo ADMIN):**
```
GET /api/admin/demo-stats
```

**Respuesta:**
```json
{
  "success": true,
  "stats": {
    "products": {
      "total": 10,
      "expired": 3,
      "active": 7
    },
    "users": {
      "total": 5,
      "expired": 2,
      "active": 3
    }
  },
  "timestamp": "2024-01-31T10:00:00.000Z"
}
```

## 🚀 Deployment de Seguridad

**Antes de deployar:**

1. **Generar secretos fuertes:**
```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# CRON_SECRET
openssl rand -hex 32
```

2. **Configurar variables de entorno:**
```bash
cp .env.production.example .env.production
# Editar con valores reales
```

3. **Ejecutar migrations:**
```bash
pnpm prisma:migrate
```

4. **Configurar cron job externo:**
- URL: https://demo-inventory.ecotechcare.ca/api/cron/cleanup
- Header: Authorization: Bearer <CRON_SECRET>
- Frecuencia: */15 * * * *

5. **Verificar security headers:**
```bash
curl -I https://demo-inventory.ecotechcare.ca
```

## ⚠️ Recomendaciones Adicionales

### Para entorno de producción seria:

1. **Rate Limiting con Redis:**
```bash
npm install @upstash/redis @upstash/ratelimit
```

2. **Monitoreo:**
- Sentry para error tracking
- Uptime monitoring
- Log aggregation (Datadog, LogRocket)

3. **Backups:**
- Backups automáticos de BD (Neon lo hace)
- Snapshots regulares

4. **WAF (Web Application Firewall):**
- Cloudflare Pro
- AWS WAF

5. **2FA (Two-Factor Authentication):**
- Agregar soporte para TOTP
- NextAuth soporta múltiples providers

6. **Audit Logs:**
- Logging de todas las acciones administrativas
- Tabla de auditoría en BD

7. **IP Whitelisting:**
- Restringir /api/admin/* a IPs específicas
- Usar middleware de Next.js

## 🔍 Checklist de Seguridad

- [x] Autenticación con JWT
- [x] RBAC implementado
- [x] Passwords hasheados con bcrypt
- [x] Validación de inputs con Zod
- [x] Security headers configurados
- [x] Variables de entorno validadas
- [x] Cascade deletes en BD
- [x] Rate limiting básico
- [x] Sistema de demo auto-limpiable
- [x] Cron job para limpieza
- [x] Endpoints protegidos con auth
- [ ] 2FA (recomendado para producción)
- [ ] WAF (recomendado para producción)
- [ ] Audit logging (recomendado para producción)

## 📞 Contacto de Seguridad

Para reportar vulnerabilidades de seguridad, contactar a:
- Email: security@yourdomain.com
- Responsible disclosure policy

---

**Última actualización:** 1 de Febrero 2026
**Versión:** 1.0.0
