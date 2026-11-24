interface GoogleAuthButtonProps {
  onClick: () => void;
  label: string;
}

// Boton de SSO: se mantiene distinto de Button (no es primary/secondary/
// danger) porque lleva la marca de Google, pero toma radios/alto/foco del
// mismo sistema de diseño.
export function GoogleAuthButton({ onClick, label }: GoogleAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-full items-center justify-center gap-2 rounded-control border border-outline-variant bg-surface-container-lowest px-3 text-body-sm font-medium text-on-surface transition hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M19.6 10.23c0-.68-.06-1.33-.17-1.96H10v3.71h5.4a4.62 4.62 0 0 1-2 3.03v2.52h3.24c1.9-1.75 3-4.33 3-7.3z"
        />
        <path
          fill="#34A853"
          d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.6-4.11H1.06v2.6A10 10 0 0 0 10 20z"
        />
        <path fill="#FBBC05" d="M4.4 11.9a6 6 0 0 1 0-3.8V5.5H1.06a10 10 0 0 0 0 9z" />
        <path
          fill="#EA4335"
          d="M10 3.98c1.47 0 2.8.5 3.84 1.49l2.88-2.88A9.6 9.6 0 0 0 10 0 10 10 0 0 0 1.06 5.5l3.34 2.6C5.2 5.73 7.4 3.98 10 3.98z"
        />
      </svg>
      {label}
    </button>
  );
}
