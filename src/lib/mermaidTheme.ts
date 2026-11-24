import mermaid from 'mermaid';

let initialized = false;

/**
 * Tema oscuro compartido por todos los diagramas mermaid de la app (ER,
 * mapa de pantallas, arquitectura, documentos). Antes cada pantalla llamaba
 * a `mermaid.initialize` por su cuenta - con mas de un modulo haciendolo,
 * la ultima llamada en orden de carga de modulos pisaba la config de las
 * demas sin que nadie lo notara. Se centraliza en un solo lugar.
 */
export function ensureMermaidInitialized() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
      background: '#102034',
      primaryColor: '#1b2b3f',
      primaryTextColor: '#d3e4fe',
      primaryBorderColor: '#c3c0ff',
      lineColor: '#918fa1',
      secondaryColor: '#102034',
      tertiaryColor: '#0b1c30',
    },
  });
  initialized = true;
}
