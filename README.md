# Habit Tracker AI

Aplicación profesional para rastrear hábitos con backend Python (FastAPI + SQLite) y frontend React (TypeScript + Vite).

## Estructura del Proyecto

```
habit-tracker-ai/
├── backend/          # FastAPI + SQLite
│   ├── app.py
│   ├── models.py
│   ├── database.py
│   ├── schemas.py
│   ├── routes/       (auth, habits, logs, stats)
│   ├── services/     (auth_service, habit_service, log_service, stats_service)
│   ├── utils/        (jwt_utils.py)
│   ├── requirements.txt
│   ├── .env
│   └── habit_tracker.db (auto-created)
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

- Python 3.8+ 
- Node.js 16+ con npm
- SQLite 3

## Instalación y Ejecución

### Backend

```bash
cd backend

# Virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Dependencias
pip install -r requirements.txt

# Ejecutar servidor
python -m uvicorn app:app --reload --port 8000
```

Backend: http://localhost:8000  
Docs: http://localhost:8000/docs

### Frontend

```bash
cd front-end
npm install
npm run dev
```

Frontend: http://localhost:5173

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
**Database**: SQLite  
**Auth**: JWT tokens (24h expiration)
