import { Download, Route, X } from 'lucide-react';

export function SelectionActionBar({ count, onTraceRoute, onExportCsv, onClear }) {
  if (count === 0) return null;

  return (
    <div className="sticky top-3 z-20 mb-5 flex flex-col gap-3 rounded-2xl border border-sky-200 bg-white/95 p-4 shadow-lg shadow-sky-950/5 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-sky-100 px-2 text-sm font-bold tabular-nums text-sky-800">{count}</span>
        <div>
          <p className="text-sm font-semibold text-slate-900">{count === 1 ? 'empresa selecionada' : 'empresas selecionadas'}</p>
          <p className="text-xs text-slate-500">Escolha uma ação para continuar.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onTraceRoute} className="btn-info"><Route size={16} />Traçar rota</button>
        <button type="button" onClick={onExportCsv} className="btn-danger"><Download size={16} />Exportar CSV</button>
        <button type="button" onClick={onClear} className="btn-light"><X size={16} />Limpar</button>
      </div>
    </div>
  );
}
