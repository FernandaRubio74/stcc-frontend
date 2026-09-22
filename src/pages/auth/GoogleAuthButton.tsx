interface GoogleAuthButtonProps {
  onClick: () => void;
  label: string;
}

export function GoogleAuthButton({ onClick, label }: GoogleAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
    >
      {label}
    </button>
  );
}
