# Ideator — Frontend

Interfaz web de **Ideator**: wizard conversacional, visualización del modelo de datos, especificación de API, mapa de pantallas/mockups, selección de arquitectura y descarga de la documentación final generada.

## Stack

- **Framework:** React 18 + Vite
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Estado remoto/cache:** React Query (o SWR)
- **Renderizado de diagramas:** Mermaid.js (ER diagrams, mapas de navegación)
- **Testing:** Vitest + React Testing Library + Playwright (E2E)

> Stack propuesto por defecto. Ajustar según la arquitectura definitiva confirmada en `EPIC-09`.

## Requisitos previos

- Node.js 20 o superior
- Backend de Ideator corriendo localmente (ver repo `ideator-backend`)

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
| `npm test` | Ejecuta pruebas unitarias/componentes |
| `npm run test:e2e` | Ejecuta pruebas end-to-end (Playwright) |
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