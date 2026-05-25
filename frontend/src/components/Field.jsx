export function Field({ label, children }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
