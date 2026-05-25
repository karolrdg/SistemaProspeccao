export function Th({ children, center = false }) {
  return <th className={`px-3 py-3 ${center ? 'text-center' : ''}`}>{children}</th>;
}

export function EmptyRow({ text, colSpan = 10 }) {
  return <tr><td colSpan={colSpan} className="px-4 py-10 text-center font-semibold text-slate-500">{text}</td></tr>;
}
