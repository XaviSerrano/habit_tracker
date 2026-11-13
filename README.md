# Habit Tracker AI

Aplicación para rastrear hábitos con backend Python (FastAPI), frontend React (TypeScript + Vite) y SQLite en local o PostgreSQL en Vercel.

## Estructura del Proyecto

```
habit-tracker-ai/
├── backend/
│   ├── app/          # API FastAPI, modelos, rutas y servicios
│   ├── requirements.txt
│   └── .env.example
│
└── front-end/        # React + TypeScript + Vite
    ├── src/
    │   ├── components/
    │   ├── contexts/       (AuthContext)
    │   ├── utils/
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## Requisitos

- Node.js 22 con npm
- [uv](https://docs.astral.sh/uv/getting-started/installation/) para gestionar Python 3.12 y las dependencias del backend

## Desarrollo local

Desde la raíz, instala las dependencias de Node una sola vez:

```bash
npm ci
npm ci --prefix front-end
```

Después, un solo comando inicia frontend y backend:

```bash
npm run dev
```

Abre http://localhost:3001. La API está en http://localhost:8001 y su documentación en http://localhost:8001/docs. Vite redirige `/api` al backend. Detén ambos procesos con Ctrl+C. `uv` instala Python 3.12 y las dependencias necesarias si faltan.

Por defecto, el backend guarda los datos en `backend/habit_tracker.db`. Opcionalmente, copia `backend/.env.example` a `backend/.env` y ajusta la configuración local. No subas el archivo `.env` al repositorio.

## Despliegue en Vercel

El archivo `vercel.json` configura [Vercel Services](https://vercel.com/docs/services) (beta) para desplegar Vite y FastAPI juntos y dirigir `/api` al backend. En Vercel, selecciona la raíz del repositorio como **Root Directory**.

Antes de desplegar, configura estas variables de entorno en Vercel para Preview y Production:

- `DATABASE_URL`: URL de una base PostgreSQL persistente, por ejemplo `postgresql://...`. SQLite no es persistente en Vercel. Usa bases separadas para Preview y Production.
- `SECRET_KEY`: clave aleatoria larga y distinta para cada entorno. No uses la clave de ejemplo ni la incluyas en el código.

Las tablas se crean al arrancar la API si todavía no existen. Los datos locales de SQLite no se migran automáticamente a PostgreSQL.

Conecta el repositorio en Vercel para desplegar con Git, o instala la CLI de Vercel y ejecuta desde la raíz:

```bash
vercel
```

La CLI pedirá autenticarte y vincular el proyecto la primera vez. Para publicar en producción después de comprobar el despliegue de prueba, usa `vercel --prod`.

## Flujo de Uso

1. Registrarse o hacer login
2. Crear hábitos (categoría, frecuencia, objetivo)
3. Loguear progreso diario
4. Ver estadísticas: rachas, heatmap, métricas
5. Archivar o eliminar hábitos

## API Endpoints

### Auth (sin protección)
- `POST /api/auth/register` - Registrarse
- `POST /api/auth/login` - Login → token JWT

### Protegidos (header: `Authorization: Bearer <token>`)
- `GET/POST /api/habits` - CRUD hábitos
- `GET/POST/DELETE /api/logs` - CRUD logs
- `GET /api/stats/dashboard` - Métricas agregadas
- `GET /api/stats/habits/{id}` - Rachas de hábito
- `GET /api/stats/heatmap` - Mapa de intensidad

## Características

✅ Autenticación JWT multi-usuario  
✅ CRUD hábitos con categorías  
✅ Logging diario de progreso  
✅ Cálculo automático de rachas  
✅ Heatmap de intensidad  
✅ Archivado de hábitos  
✅ Filtrado y búsqueda  
✅ Export/import de datos  
✅ Interfaz responsiva  

## Tecnología

**Backend**: FastAPI, SQLAlchemy, PyJWT, bcrypt  
**Frontend**: React 19, TypeScript, Tailwind CSS, Lucide icons  
**Database**: SQLite en local, PostgreSQL en Vercel
**Auth**: JWT tokens (24h expiration)
