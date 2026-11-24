# Lineamientos de UI — Ideator Frontend

Este documento resume el sistema de diseño introducido en la transformación
de UI de los sprints 9-10 (ver `src/index.css` para los tokens en código).
Es la referencia a seguir en toda pantalla nueva o rediseñada.

## 1. Colores

Usar siempre los nombres **semánticos**, nunca el nombre crudo de Tailwind
(`indigo`, `red`, etc.) en código nuevo:

| Token | Uso |
|---|---|
| `primary` | Marca, acción principal, estado "actual/seleccionado" |
| `neutral` | Texto, fondos, bordes, estados inactivos |
| `success` | Confirmaciones, estados "completo" / "ok" |
| `warning` | Bloqueos o advertencias no destructivas (ej. preguntas bloqueantes) |
| `danger` | Errores, acciones destructivas (eliminar, cerrar sesión) |
| `info` | Notas neutrales que no son ni éxito ni error |

Cada token tiene la misma escala numérica de Tailwind (`50`...`900`). Ejemplo:
`bg-primary-600`, `text-danger-700`, `border-warning-300`.

**Nunca comunicar un estado solo con color** (regla WCAG 2.2 AA): siempre
acompañar con texto, ícono o ambos (ej. un Badge con texto, no solo un punto
de color).

## 2. Tipografía

No hay tokens de tamaño custom — se usa la escala de Tailwind, pero con un
uso consistente por rol:

| Rol | Clases |
|---|---|
| Título de página (`<h1>` vía `PageHeader`) | `text-2xl font-semibold text-neutral-900` |
| Título de sección (`<h2>`) | `text-lg font-semibold text-neutral-900` |
| Etiqueta de subsección / eyebrow (`<h3>`) | `text-xs font-semibold uppercase tracking-wide text-neutral-500` |
| Cuerpo | `text-sm text-neutral-700` |
| Texto secundario / ayuda | `text-sm text-neutral-500` |
| Texto auxiliar mínimo (metadata, timestamps) | `text-xs text-neutral-400` |

No introducir una séptima variante de `<h3>` para "lo mismo de siempre": si
hace falta una etiqueta de sección, es la fila de "Etiqueta de subsección".

## 3. Espaciado

Retícula de 8px: usar solo múltiplos de 2 en las utilidades de espaciado de
Tailwind (`p-2`, `p-4`, `p-6`, `gap-4`, etc. — no `p-1`, `p-3`, `py-1.5`) en
componentes y pantallas nuevos. El código existente que use valores impares
se corrige de forma oportunista al tocar ese archivo, no en un barrido
aparte.

## 4. Radios

| Token | Valor | Uso |
|---|---|---|
| `rounded-control` | 8px | Botones, inputs, chips |
| `rounded-card` | 12px | Tarjetas, paneles, modales |
| `rounded-pill` | 999px | Badges |

## 5. Sombras

| Token | Uso |
|---|---|
| `shadow-card` | Tarjetas en reposo (lista de proyectos, tarjetas de arquitectura) |
| `shadow-raised` | Tarjetas en hover, modales, menús flotantes |

## 6. Breakpoints

Se usan los breakpoints por defecto de Tailwind, que ya coinciden con lo
pedido: `sm` = 640px, `lg` = 1024px. No se agregan breakpoints custom.

## 7. Accesibilidad (WCAG 2.2 AA) — checklist por componente/pantalla

- Contraste mínimo 4.5:1 (los tokens de color ya cumplen; verificar al
  combinar texto sobre fondos de tono `100` o más claro).
- Todo elemento interactivo con foco visible (`focus-visible:ring-2
  focus-visible:ring-primary-500` como patrón por defecto).
- Objetivos táctiles de al menos 44px de alto en botones/controles
  principales (los tamaños `md`/`lg` de `Button` deben cumplirlo).
- Toda etiqueta de formulario asociada a su control (`<label htmlFor>`).
- Animaciones/transiciones respetan `prefers-reduced-motion` (ver patrón en
  componentes de Fase 2).
- Nunca depender solo del color (ver sección 1).

## 8. Convención de nombres de "tono" en componentes

Todos los componentes compartidos usan las mismas claves de tono:
`primary | neutral | success | warning | danger | info` — ningún componente
nuevo debe inventar su propio alias (ej. `error` en vez de `danger`).
