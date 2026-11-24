# Ideator — Frontend

[![CI Frontend](https://github.com/FernandaRubio74/stcc-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/FernandaRubio74/stcc-frontend/actions/workflows/ci.yml)

Interfaz web de **Ideator**: wizard conversacional, visualización del modelo de datos, especificación de API, mapa de pantallas/mockups, selección de arquitectura y descarga de la documentación final generada.

## Stack

Confirmado y en uso:

- **Framework:** React 18 + Vite
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Routing:** React Router
- **Estado remoto/cache:** TanStack Query (React Query)
- **Renderizado de diagramas:** Mermaid.js (diagrama ER, mapa de navegación de pantallas)
- **Markdown:** `react-markdown` + `remark-gfm` (vista previa de los documentos finales)
- **Testing:** Vitest + React Testing Library (solo unitario/componentes — no hay suite E2E de frontend; el E2E del producto vive en `stcc-backend`, contra el servidor real)

## Módulos de la UI

| Área (`src/pages/`) | Qué hace | Historias |
|---|---|---|
| `auth` | Registro, login, callback de SSO | US-011 |
| `dashboard` | Listado de proyectos | US-012 |
| `project/wizard` | Wizard conversacional de definición | US-018 |
| `project/data-model` | Visualizador y editor inline del diagrama ER | US-022 |
| `project/api-spec` | Vista de documentación de API tipo Swagger | US-025 |
| `project/screens` | Visor del mapa de pantallas (mockups clickeables) | US-030 |
| `project/architecture` | Selector comparativo de arquitectura | US-030 |
| `project/review` | Checklist de revisión final por etapa | US-033 |
| `project/documents` | Vista previa, descarga individual/conjunta e historial de versiones | US-037 |
| `components/` | Sistema de diseño compartido (Button, Alert, Badge, EmptyState, Spinner, PageHeader) | US-043 |

## Requisitos previos

- Node.js 20 o superior
- Backend de Ideator corriendo localmente (ver `stcc-backend`, incluye el `docker-compose.yml` que levanta ambos)

## Instalación

```bash
git clone https://github.com/tu-org/ideator-frontend.git
cd ideator-frontend
npm install
cp .env.example .env
```

Completa las variables de `.env` y luego:

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Levantar todo con Docker

El `docker-compose.yml` que levanta base de datos + backend + frontend con un
solo comando vive en `stcc-backend` (requiere los dos repos clonados como
carpetas hermanas). Ver la sección correspondiente en
[el README del backend](https://github.com/FernandaRubio74/stcc-backend#levantar-el-entorno-completo-desde-cero-docker).

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API del backend | `http://localhost:3000` |
| `VITE_SSO_CLIENT_ID` | Client ID público del proveedor SSO | — |
| `VITE_ENV` | Entorno de ejecución | `development` |

Nunca commitear el archivo `.env`. Usar siempre `.env.example` como plantilla sin valores reales.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo con hot reload |
| `npm run build` | Genera el build de producción |
| `npm run preview` | Sirve localmente el build de producción |
| `npm test` | Ejecuta pruebas unitarias/componentes (Vitest) |
| `npm run lint` | Ejecuta el linter |
| `npm run format` | Formatea el código |

## Estructura del proyecto

Ver detalle completo en la sección de estructura de carpetas más abajo.

## Convenciones de trabajo

Ver [`CONTRIBUTING.md`](./CONTRIBUTING.md) para flujo de ramas, convención de commits y checklist de Pull Request.

## Documentación relacionada

- Especificación funcional del producto: repositorio `ideator-docs`
- Documentación de arquitectura: repositorio `ideator-docs`
- Tablero de trabajo: Jira, proyecto `stcc`