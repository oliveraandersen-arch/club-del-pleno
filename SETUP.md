# Club del Pleno — Guía de Configuración y Deploy

## Requisitos previos

- Node.js 20.9+
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Cuenta en [Vercel](https://vercel.com) (opcional, para deploy)

---

## 1. Configurar Supabase

### 1.1 Crear proyecto
1. Ir a [supabase.com](https://supabase.com) → New Project
2. Nombre: `club-del-pleno`
3. Contraseña de base de datos: guardala (la necesitarás)
4. Región: la más cercana a tus usuarios

### 1.2 Correr las migraciones SQL

En Supabase → SQL Editor, correr en orden:

1. Copiar y ejecutar el contenido de `supabase/migrations/001_initial_schema.sql`
2. Copiar y ejecutar el contenido de `supabase/migrations/002_seed_data.sql`

> Esto crea todas las tablas, RLS policies, funciones, logros, niveles y datos iniciales del Mundial 2026.

### 1.3 Obtener credenciales

En Supabase → Settings → API:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (mantener seguro)

---

## 2. Configurar variables de entorno

Editar el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Instalar dependencias y correr localmente

```bash
cd club-del-pleno
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) 🚀

---

## 4. Configurar autenticación (Supabase Auth)

En Supabase → Authentication → Settings:
- **Site URL**: `http://localhost:3000` (desarrollo) / `https://tu-dominio.com` (producción)
- **Redirect URLs**: Agregar `http://localhost:3000/auth/callback`

### Activar Google OAuth (opcional)
En Authentication → Providers → Google:
1. Crear credenciales en [Google Cloud Console](https://console.cloud.google.com)
2. Pegar Client ID y Secret

### Activar Discord OAuth (opcional)
En Authentication → Providers → Discord:
1. Crear app en [Discord Developer Portal](https://discord.com/developers)
2. Pegar Client ID y Secret

---

## 5. Crear el primer usuario administrador

Después de registrarse con el primer usuario:

En Supabase → SQL Editor:

```sql
UPDATE usuarios
SET es_admin = true
WHERE email = 'tu-email@ejemplo.com';
```

Luego podés acceder a `/admin` para gestionar partidos y resultados.

---

## 6. Deploy a producción (Vercel)

```bash
npx vercel
```

O conectar el repositorio en [vercel.com](https://vercel.com) y agregar las variables de entorno en el dashboard.

### Variables de entorno en Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

---

## 7. Gestionar el prode durante el Mundial

### Flujo de partidos:
1. Los partidos ya están pre-cargados en el seed data
2. Los usuarios pueden predecir **antes** de que empiece cada partido
3. Cuando empieza un partido, las predicciones se bloquean automáticamente
4. Al finalizar, el admin carga el resultado en `/admin` → Resultados
5. El sistema calcula puntos automáticamente para todos

### Puntuación:
| Resultado | Puntos |
|-----------|--------|
| Exacto (ej: 2-1 y fue 2-1) | 5 pts |
| Misma diferencia (ej: +2 goles) | 4 pts |
| Ganador correcto | 3 pts |
| Empate correcto | 3 pts |
| Error | 0 pts |
| Bonus: Fecha plena | +10 pts |
| Bonus: Campeón | +25 pts |
| Bonus: Goleador | +15 pts |

---

## 8. Estructura del proyecto

```
src/
├── app/                    # Páginas (Next.js App Router)
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Dashboard principal
│   ├── prode/             # Sistema de predicciones
│   ├── ranking/           # Ranking global
│   ├── perfil/[username]/ # Perfil de usuario
│   ├── ligas/             # Ligas privadas
│   ├── mundial/           # Centro del Mundial
│   ├── estadisticas/      # Estadísticas avanzadas
│   ├── predicciones-especiales/ # Campeón, goleador...
│   ├── comparador/        # Comparar usuarios
│   ├── notificaciones/    # Centro de notificaciones
│   ├── admin/             # Panel de administración
│   └── auth/              # Login y registro
├── components/
│   ├── features/          # Componentes de funcionalidades
│   └── layout/            # Navbar, AppLayout, etc.
├── lib/
│   ├── supabase/          # Clientes Supabase
│   └── constants.ts       # Constantes del sistema
├── stores/                # Zustand stores
├── types/                 # Tipos TypeScript
└── proxy.ts               # Auth proxy (reemplaza middleware)

supabase/
└── migrations/
    ├── 001_initial_schema.sql  # Schema completo
    └── 002_seed_data.sql       # Datos del Mundial 2026
```

---

## 9. Tecnologías utilizadas

| Tecnología | Propósito |
|------------|-----------|
| Next.js 16 | Framework React |
| TypeScript | Tipado estático |
| Tailwind CSS v4 | Estilos |
| Shadcn UI | Componentes base |
| Framer Motion | Animaciones |
| Supabase | Base de datos + Auth + Realtime |
| React Query | Cache y fetching |
| Recharts | Gráficos |
| Zustand | Estado global |
| Sonner | Notificaciones toast |
| date-fns | Manejo de fechas |

---

*Inspirado por la pasión futbolera y el espíritu competitivo de Tim Payne.*
