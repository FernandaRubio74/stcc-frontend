# Checklist manual de accesibilidad y responsive (Fase 6)

El proyecto no tiene ninguna herramienta automática de accesibilidad
configurada (ni axe, ni Lighthouse CI, ni similar), así que esta es la
checklist manual pedida en el plan, con lo que ya se verificó y lo que
queda para revisar a mano en el navegador.

## Responsive (360 / 768 / 1280px)

Verificado en código (sin scroll horizontal, con `flex-wrap`/`min-w-0` +
`truncate` donde había texto largo):

- [x] Header de `AppShell`: nombre de usuario se oculta bajo `sm` y se
      trunca arriba de eso; el botón de logout nunca se corta.
- [x] Fila de miembro (`MembersPanel`): pasa a columna en mobile
      (`flex-col` → `sm:flex-row`); nombre/email truncan en vez de
      desbordar.
- [x] Fila de endpoint (`ApiSpecViewer`): la ruta trunca con `truncate`,
      los badges de respuesta pasan a `flex-wrap`.
- [x] `Stepper`, `PageHeader` (acciones), formulario de invitar miembro,
      botones de `DocumentsPage`: todos con `flex-wrap`.
- [x] Grilla de `DocumentsPage` (lista de versiones + visor) ya es una
      sola columna por debajo de `md`.

Pendiente de confirmar a ojo en el navegador (no se puede verificar leyendo
el código): que ningún diagrama Mermaid (modelo de datos, mapa de
pantallas, arquitectura) fuerce scroll horizontal de toda la página en vez
de quedar contenido en su propio `overflow-x-auto`.

## Teclado

- [x] Todo elemento interactivo nuevo es un `<button>`/`<a>`/control de
      formulario real (nunca un `<div onClick>`), así que Tab ya los
      alcanza por default.
- [x] `Modal`: Tab no se saca del flujo del documento con una trampa de
      foco explícita, pero el foco entra al abrir y vuelve a donde estaba
      al cerrar, y Escape cierra.
- [x] `Tabs` y `Stepper`: soportan flechas / foco visible.
- [x] `Tooltip`: se muestra con foco de teclado, no solo con mouse.

## ARIA

- [x] `role="alert"` para errores y advertencias, `role="status"` para
      éxito/info (`Alert`, `Toast`).
- [x] `aria-current="step"` en la etapa activa de los steppers.
- [x] `aria-describedby` en todos los campos con ayuda/error (`Input`,
      `Textarea`, `Select`).
- [x] Iconos puramente decorativos con `aria-hidden="true"` (ver
      `src/components/icons.tsx`); el significado siempre lo lleva texto.

## Contraste

Se revisaron a mano los tokens de `src/index.css` contra fondo blanco/
`neutral-50`. Se corrigieron los casos que no llegaban a 4.5:1 (texto) o
3:1 (iconos/UI):

- [x] `text-neutral-400` → `text-neutral-500` en el separador "o" de los
      formularios de auth, la etiqueta "Mockup de baja fidelidad" y el
      estado `locked` del `Stepper`.
- [x] Icono de cerrar de `Modal`: `text-neutral-400` → `text-neutral-500`.

## Títulos de página y `lang`

- [x] `<html lang="es">` en `index.html`.
- [x] Cada pantalla pone su propio `document.title` vía `usePageTitle`
      (antes todas mostraban "Ideator" en la pestaña sin distinción).

## `prefers-reduced-motion`

- [x] Todas las animaciones (`animate-spin`, `animate-pulse`,
      `animate-bounce`, transiciones de `Modal`/`Toast`) tienen su
      contraparte `motion-reduce:` que las apaga o las deja instantáneas.
