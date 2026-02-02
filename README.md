# Sistema de Inventario Web

Sistema completo de gestión de inventario multi-warehouse con roles de usuario, autenticación segura y tema claro/oscuro.

## 🌟 Características

- **Multi-Warehouse**: Gestión de múltiples almacenes
- **Control de Inventario**: Track de productos, movimientos (IN/OUT/ADJUST/TRANSFER)
- **Autenticación**: NextAuth con JWT y bcrypt
- **Roles de Usuario**: 
  - **ADMIN**: Control total del sistema
  - **STAFF**: Crear/editar productos y movimientos
  - **VIEWER**: Solo lectura
- **Panel de Administración**: Gestión de usuarios, configuración del sistema
- **Tema Claro/Oscuro**: Personalizable desde configuración
- **Exportación**: PDF y Excel de inventario y movimientos
- **Escaneo de Códigos**: Barcode scanner para movimientos rápidos
- **Internacionalización**: Soporte para múltiples idiomas (EN/FR)

## 🚀 Quick Start - Desarrollo

### Prerequisitos

- Node.js 18+
- pnpm (recomendado) o npm
- PostgreSQL (Neon recomendado)

### Instalación

```bash
# Clonar repositorio
git clone <tu-repo>
cd inventario-web

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores (DATABASE_URL, NEXTAUTH_SECRET, etc.)

# Generar Prisma Client
pnpm prisma:generate

# Ejecutar migraciones
pnpm prisma:migrate

# Ejecutar seed (datos de prueba)
pnpm prisma:seed

# Iniciar servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Usuarios de Prueba

Después del seed, puedes usar estos usuarios:

| Rol | Email | Password |
|-----|-------|----------|
| **Admin** | admin@example.com | Admin123! |
| **Staff** | staff@example.com | Staff123! |
| **Viewer** | viewer@example.com | Viewer123! |

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL (Neon)
- **ORM**: Prisma 7
- **Autenticación**: NextAuth 5 (beta)
- **UI**: Tailwind CSS + Radix UI
- **Estado**: React Context
- **Validación**: Zod
- **Internacionalización**: next-intl

## 🌐 Deployment - Producción

Este proyecto está configurado para deployment en **demo-inventory.ecotechcare.ca**

### Deployment Rápido

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows:**
```powershell
.\deploy.ps1
```

### Documentación Completa de Deployment

Ver documentación detallada:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía completa paso a paso
- [PRE-DEPLOYMENT-CHECKLIST.md](./PRE-DEPLOYMENT-CHECKLIST.md) - Checklist y troubleshooting

### Archivos de Configuración

- `Dockerfile.prod` - Docker production build
- `docker-compose.prod.yml` - Docker Compose para producción
- `nginx.conf` - Configuración de Nginx como reverse proxy
- `.env.production.example` - Template de variables de entorno
- `deploy.sh` / `deploy.ps1` - Scripts de deployment automático

### Variables de Entorno Requeridas

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://demo-inventory.ecotechcare.ca"
NEXTAUTH_SECRET="<generado-con-openssl>"
NODE_ENV="production"
```

## 📂 Estructura del Proyecto

```
inventario-web/
├── prisma/
│   ├── schema.prisma          # Modelo de datos
│   ├── seed.ts                # Datos de prueba
│   └── migrations/            # Migraciones de BD
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [locale]/          # Rutas con i18n
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   │   ├── admin/     # Panel de administración
│   │   │   │   ├── inventory/ # Gestión de inventario
│   │   │   │   ├── products/  # Gestión de productos
│   │   │   │   └── movements/ # Movimientos de stock
│   │   │   └── login/         # Página de login
│   │   └── api/               # API Routes
│   ├── components/            # Componentes React
│   │   ├── ui/                # Componentes UI (Radix)
│   │   ├── dashboard/         # Componentes del dashboard
│   │   └── theme-provider.tsx # Provider de tema
│   ├── server/                # Server-side logic
│   │   ├── auth.ts            # Lógica de autenticación
│   │   ├── db.ts              # Cliente de Prisma
│   │   ├── rbac.ts            # Control de acceso por roles
│   │   ├── products.ts        # Lógica de productos
│   │   ├── inventory.ts       # Lógica de inventario
│   │   └── movements.ts       # Lógica de movimientos
│   └── auth.ts                # Configuración de NextAuth
├── DEPLOYMENT.md              # Guía de deployment
├── PRE-DEPLOYMENT-CHECKLIST.md # Checklist pre-deploy
├── deploy.sh / deploy.ps1     # Scripts de deployment
└── nginx.conf                 # Configuración Nginx

```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm dev                    # Servidor de desarrollo
pnpm build                  # Build de producción
pnpm start                  # Iniciar en producción
pnpm lint                   # Linter

# Prisma
pnpm prisma:studio          # Prisma Studio UI
pnpm prisma:seed            # Ejecutar seed
pnpm prisma:migrate         # Ejecutar migraciones
pnpm prisma:generate        # Generar cliente

# Deployment
pnpm build:prod             # Build completo con migraciones
pnpm docker:build           # Build imagen Docker
pnpm docker:up              # Iniciar con Docker Compose
pnpm docker:down            # Detener Docker
pnpm docker:logs            # Ver logs de Docker
```

## 🎨 Tema Claro/Oscuro

El sistema incluye soporte completo para tema claro/oscuro:

1. Los administradores pueden cambiar el tema desde **Dashboard > Configuración**
2. El tema se guarda en la base de datos (tabla `SystemSettings`)
3. Todos los componentes tienen clases `dark:` de Tailwind
4. El tema persiste entre sesiones

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (12 rounds)
- JWT sessions con NextAuth
- RBAC (Role-Based Access Control)
- Security headers configurados
- SQL injection protection (Prisma)
- CORS configurado
- Rate limiting recomendado en producción

## 📊 Health Check

El sistema incluye un endpoint de health check:

```
GET /api/health
```

Respuesta:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-31T10:00:00.000Z",
  "database": "connected"
}
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

[MIT](LICENSE)

## 📧 Contacto

Demo: [https://demo-inventory.ecotechcare.ca](https://demo-inventory.ecotechcare.ca)

---

**Versión:** 1.0.0  
**Última actualización:** Enero 2024
