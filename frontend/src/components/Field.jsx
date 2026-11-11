export function Field({ label, children }) {
  return (
    <label className="mb-1 block text-sm font-medium text-slate-700">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}
