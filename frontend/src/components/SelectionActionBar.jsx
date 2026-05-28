import { Download, Route, X } from 'lucide-react';

export function SelectionActionBar({ count, onTraceRoute, onExportCsv, onClear }) {
  if (count === 0) return null;

  return (
    <div className="sticky top-3 z-20 mb-4 flex flex-col gap-3 rounded-lg border border-gso-blue/20 bg-white p-3 shadow-soft md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-bold text-gso-blue">{count} {count === 1 ? 'empresa selecionada' : 'empresas selecionadas'}</p>
        <p className="text-xs text-slate-500">Use a seleção para rota ou exportação.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onTraceRoute} className="btn-info"><Route size={16} />Traçar rota</button>
        <button type="button" onClick={onExportCsv} className="btn-danger"><Download size={16} />Exportar CSV</button>
        <button type="button" onClick={onClear} className="btn-light"><X size={16} />Limpar</button>
      </div>
    </div>
  );
}
