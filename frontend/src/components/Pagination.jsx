import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, totalItems, setPage }) {
  const pages = [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <div className="my-5 flex flex-col items-center justify-between gap-3 rounded-lg bg-white p-3 shadow-soft md:flex-row">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-page" type="button" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}><ChevronLeft size={16} />Anterior</button>
        {start > 1 && <button className="btn-page" type="button" onClick={() => setPage(1)}>1</button>}
        {start > 2 && <span className="px-1 text-slate-400">...</span>}
        {pages.map((item) => <button key={item} className={`btn-page ${item === page ? 'active' : ''}`} type="button" onClick={() => setPage(item)}>{item}</button>)}
        {end < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}
        {end < totalPages && <button className="btn-page" type="button" onClick={() => setPage(totalPages)}>{totalPages}</button>}
        <button className="btn-page" type="button" disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>Proxima<ChevronRight size={16} /></button>
      </div>
      <span className="text-sm font-semibold text-slate-500">Total: {totalItems} empresas</span>
    </div>
  );
}
