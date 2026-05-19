# Multi-Agent DataOps

Plataforma de automatización de pipelines de datos impulsada por agentes IA, construida con una arquitectura multiagente usando LangGraph.

## Descripción del Proyecto

**Multi-Agent DataOps** es una aplicación web que permite a los usuarios crear proyectos y generar contenido técnico automatizado mediante un sistema de múltiples agentes especializados. El sistema toma un Product Requirements Document (PRD) como entrada y lo transforma en contenido estructurado y verificado a través de un flujo de trabajo de agentes coordinados.

## Arquitectura del Sistema

### Stack Tecnológico

| Componente | Tecnología |
|------------|-------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS v4, Framer Motion |
| **Backend** | FastAPI (Python), LangGraph, LangChain |
| **Base de Datos** | Neon (PostgreSQL Serverless) |
| **Autenticación** | Neon Auth (JWT con EdDSA) |
| **Búsqueda** | Tavily Search API |
| **LLM** | Google Gemini (configurable) |
| **Cola de Tareas** | Celery + Redis |
| **Comunicación Real-time** | Server-Sent Events (SSE) |

### Estructura del Proyecto

```
multi-agents-data-ops/
├── app/
│   ├── backend/               # API FastAPI
│   │   ├── agents/            # Sistema multiagente LangGraph
│   │   │   ├── nodes/         # Agentes: researcher, writer, checker, polisher
│   │   │   ├── validators/    # Validaciones de flujo de trabajo
│   │   │   ├── graph.py       # Definición del grafo de agentes
│   │   │   └── state.py       # Definición del estado compartido
│   │   ├── api/              # Endpoints REST
│   │   │   ├── projects/      # CRUD de proyectos
│   │   │   └── metrics/       # Métricas y estadísticas
│   │   ├── services/         # Lógica de negocio
│   │   ├── config/           # Configuración (DB, pricing)
│   │   ├── middleware/       # Autenticación JWT
│   │   ├── schemas/          # Modelos Pydantic
│   │   └── tasks/           # Tareas Celery para procesamiento asíncrono
│   │
│   └── frontend/             # Aplicación Next.js
│       ├── app/
│       │   ├── dashboard/    # Panel principal del usuario
│       │   ├── auth/         # Autenticación (sign-in, sign-up)
│       │   ├── profile/      # Perfil del usuario
│       │   └── api/         # Rutas API del frontend
│       └── lib/
│           ├── auth/         # Utilidades de autenticación
│           └── components/  # Componentes UI reutilizables
```

## Sistema Multiagente

El corazón del sistema es un grafo de LangGraph con **4 agentes especializados**:

```
┌─────────────┐    ┌─────────┐    ┌────────────┐    ┌──────────┐
│ Researcher  │───▶│  Writer │───▶│   Checker  │───▶│ Polisher │
└─────────────┘    └─────────┘    └────────────┘    └──────────┘
       │                                   │
       │           Confidence < 0.6        │
       └───────────────────────────────────┘
```

### Flujo de Trabajo

1. **Researcher Agent**
   - Analiza el PRD proporcionado por el usuario
   - Genera 3 consultas de búsqueda optimizadas
   - Ejecuta búsquedas en la web via Tavily
   - Recopila hechos técnicos y fuentes

2. **Writer Agent**
   - Recibe el PRD y los hechos del investigador
   - Genera un borrador estructurado en inglés
   - Maneja retroalimentación del checker (reintentos)
   - Límite de reintentos: 3 intentos

3. **Checker Agent (Fast Checker)**
   - Verifica consistencia entre borrador y hechos
   - Calcula puntuación de confianza (0.0 - 1.0)
   - Identifica "failed facts" (hechos contradichos/omitidos)
   - Threshold: confianza >= 0.6 para aprobar

4. **Polisher Agent**
   - Refina estilo y estructura del contenido
   - Corrige hechos fallidos identificados
   - Valida calidad mínima del output
   - Genera el post final

### Métricas de Tokens

El sistema rastrea tokens consumidos por cada agente:

| Modelo | Costo Input | Costo Output |
|--------|-------------|--------------|
| Gemini | $0.075 / 1M tokens | $0.30 / 1M tokens |

## Procesamiento Asíncrono con Celery

El sistema utiliza **Celery** junto con **Redis** como broker para manejar el procesamiento asíncrono de pipelines:

- Los proyectos se crean en estado "pending" y se encolan para procesamiento
- Las tareas de Celery ejecutan el pipeline de agentes en background
- El backend puede escalar horizontalmente para manejar múltiples proyectos concurrentes
- Redis actúa como mensaje broker y también como store para el estado de streaming

### Flujo con Celery

```
Frontend → POST /api/projects → Redis Queue → Celery Worker → Pipeline Agents
                              ↓
                         Stream Hub (Redis)
                              ↓
                         SSE Connection
```

## Comunicación en Tiempo Real con SSE

El sistema implementa **Server-Sent Events (SSE)** para proporcionar feedback en tiempo real al frontend:

- El endpoint `/api/projects/{id}/stream` mantiene una conexión SSE abierta
- El **Stream Hub** (implementado con Redis Pub/Sub) pubblica eventos de progreso
- Cada agente envía actualizaciones de estado durante la ejecución
- El frontend recibe eventos de progreso, métricas parciales y resultado final

### Eventos SSE

| Evento | Descripción |
|--------|-------------|
| `status` | Progreso del pipeline (researcher: 25%, writer: 50%, checker: 65%, polisher: 90%) |
| `complete` | Pipeline terminado exitosamente (métricas finales) |
| `error` | Error en el pipeline (detalle del error) |

### Stream Hub

El Stream Hub es un componente que gestiona las suscripciones SSE:

- Suscriptores se registran por `project_id`
- Los eventos se publican en canales Redis
- Cada cliente recibe solo los eventos de sus proyectos
- Timeout de 30 segundos con heartbeats para mantener la conexión viva

## API Endpoints

### Proyectos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/projects` | Crear nuevo proyecto (se encola en Celery) |
| `GET` | `/api/projects` | Listar proyectos del usuario |
| `GET` | `/api/projects/{id}` | Obtener proyecto específico |
| `PATCH` | `/api/projects/{id}` | Actualizar métricas del proyecto |
| `GET` | `/api/projects/{id}/stream` | Streaming SSE de progreso |

### Métricas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/metrics/overview` | Resumen de proyectos (total, completados, fallidos) |
| `GET` | `/api/metrics/costs` | Costos en tokens y USD |
| `GET` | `/api/metrics/recent-posts` | Posts recientes generados |
| `GET` | `/api/metrics/health` | Salud del sistema (tasa de éxito, reintentos promedio) |

## Autenticación

El sistema utiliza **Neon Auth** para autenticación:

- Middleware JWT con validación de firma EdDSA
- JWKS cacheado para verificación de tokens
- Soporte para Google OAuth (opcional)
- Sesiones persistentes con tokens seguros

## Configuración

### Variables de Entorno (Backend)

```env
NEON_DATABASE_CONNECTION_STRING=postgresql://...
NEON_AUTH_BASE_URL=https://auth.neon.tech
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
LLM_PROVIDER=google
LLM_API_KEY=your_gemini_key

# Redis para Celery y Stream Hub
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### Variables de Entorno (Frontend)

```env
DATABASE_URL=postgresql://...
AUTH_SIGNING_KEY=your_signing_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Ejecución del Proyecto

### Backend

```bash
cd app/backend
pip install -r requirements.txt

# Iniciar Redis (requerido para Celery y Stream Hub)
redis-server

# Iniciar worker de Celery
celery -A tasks worker --loglevel=info

# Iniciar servidor FastAPI
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd app/frontend
npm install
npm run dev
```

## Características Principales

- **Automatización completa**: De PRD a post final en un solo paso
- **Verificación de hechos**: Cada borrador es validado contra las fuentes
- **Reintentos inteligentes**: El sistema reintenta automáticamente si la confianza es baja
- **Procesamiento asíncrono**: Celery maneja pipelines sin bloquear el servidor
- **Feedback en tiempo real**: SSE para streaming de progreso y métricas
- **Métricas detalladas**: Seguimiento de tokens, costos y tiempo de ejecución
- **Historial de proyectos**: Persistencia de proyectos y posts generados
- **Dashboard interactivo**: Interfaz web para gestionar proyectos

## Contribuir

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork del repositorio
2. Crear una rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit de los cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear un Pull Request