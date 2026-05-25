export function IconButton({ children, title, className, disabled, onClick }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded text-white transition disabled:cursor-not-allowed disabled:bg-slate-300 ${className}`}
    >
      {children}
    </button>
  );
}
