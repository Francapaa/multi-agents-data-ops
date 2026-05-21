# TO-DO — Migración a Celery + Upload de archivos

> **Fuente única de verdad** — tachar lo que ya está hecho.

---

## 1. Backend — Dependencias

- [ ] Agregar `celery[redis]` a `requirements.txt`
- [ ] Agregar `python-docx` a `requirements.txt`
- [ ] Agregar `PyMuPDF` a `requirements.txt`

---

## 2. Backend — Configuración de Celery

- [ ] Crear `backend/config/celery_app.py` con la app de Celery (broker=Redis)
- [ ] Variables de entorno: `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`

---

## 3. Backend — Servicio de parseo de archivos

- [ ] Crear `backend/services/file_parser.py`
- [ ] Función `parse_file(file_bytes: bytes, filename: str) -> str`
  - [ ] Soporte para `.docx` (python-docx)
  - [ ] Soporte para `.pdf` (PyMuPDF / fitz)
  - [ ] Soporte para `.txt` (built-in)
  - [ ] Publicar eventos de progreso a Redis Pub/Sub durante el parseo

---

## 4. Backend — Celery task del pipeline

- [ ] Crear `backend/tasks/__init__.py`
- [ ] Crear `backend/tasks/pipeline.py`
- [ ] Task `process_project(project_id, user_id, file_bytes, filename)`:
  - [ ] Lee el proyecto de la DB
  - [ ] Parsea el archivo → texto plano → publica eventos de progreso
  - [ ] Guarda el PRD extraído en la DB
  - [ ] Setea status = `"running"`
  - [ ] Ejecuta el grafo LangGraph (lo que hoy hace `run_pipeline()`)
  - [ ] Publica eventos de progreso de cada agente a Redis Pub/Sub
  - [ ] Al finalizar: actualiza DB + publica `"complete"` o `"error"`

---

## 5. Backend — Endpoint de upload

- [ ] Agregar `POST /api/projects/upload` en `api/projects/endpoints.py`
- [ ] Acepta `multipart/form-data` con:
  - `file` (obligatorio, .docx / .pdf / .txt)
  - `title` (opcional, si no se manda usa el nombre del archivo)
- [ ] Crea proyecto en DB con status `"pending"`
- [ ] Encola Celery task `process_project.delay(project_id, user_id, file_bytes, filename)`
- [ ] Responde inmediatamente: `{ id, title, status: "pending", created_at }`
- [ ] Validar tamaño máximo del archivo (ej: 10 MB)

---

## 6. Backend — Stream Hub migrar a Redis Pub/Sub

- [ ] Cambiar `services/stream_hub.py` de colas en memoria a Redis Pub/Sub
- [ ] `subscribe(project_id)` → se subscribe al canal `project:{id}`
- [ ] `publish(project_id, event, data)` → publica a `project:{id}`
- [ ] `unsubscribe(project_id)` → cleanup de la subscripción
- [ ] `GET /api/projects/{id}/stream` ya no dispara el pipeline, solo escucha

---

## 7. Frontend — Hook `useProjectStream.ts`

- [ ] Setear `finished = true` al recibir evento `"complete"`
- [ ] Setear `finished = true` al recibir evento `"error"`
- [ ] Incorporar campo `message` en el tipo de estado para mostrar al usuario

---

## 8. Frontend — Upload de archivos

- [ ] Componente de upload que acepte .docx / .pdf / .txt
- [ ] Llamar a `POST /api/projects/upload` con multipart
- [ ] Navegar al dashboard/stream después de recibir el `id`

---

## 9. Frontend — Dashboard con progreso

- [ ] Mostrar `message` del evento `status` en la UI (ej: "Extrayendo datos del PRD...")
- [ ] Mostrar barra de progreso animada según el `progress` del evento
- [ ] Cuando llega `"complete"` mostrar resultado final
- [ ] Cuando llega `"error"` mostrar mensaje de error
