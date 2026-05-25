import { AlertTriangle, Check, X } from 'lucide-react';

export function ToastViewport({ toasts, onClose }) {
  return (
    <div className="fixed right-4 top-4 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => <Toast key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />)}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const styles = {
    success: {
      icon: <Check size={18} />,
      className: 'border-green-200 bg-green-50 text-green-800',
      iconClass: 'bg-green-600 text-white'
    },
    error: {
      icon: <X size={18} />,
      className: 'border-red-200 bg-red-50 text-red-800',
      iconClass: 'bg-red-600 text-white'
    },
    warning: {
      icon: <AlertTriangle size={18} />,
      className: 'border-amber-200 bg-amber-50 text-amber-900',
      iconClass: 'bg-amber-500 text-white'
    },
    info: {
      icon: <Check size={18} />,
      className: 'border-sky-200 bg-sky-50 text-sky-800',
      iconClass: 'bg-sky-600 text-white'
    }
  };
  const tone = styles[toast.type] || styles.info;

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 shadow-soft ${tone.className}`}>
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone.iconClass}`}>{tone.icon}</div>
      <div className="min-w-0 flex-1">
        <p className="font-bold leading-5">{toast.title}</p>
        {toast.message && <p className="mt-1 text-sm leading-5 opacity-90">{toast.message}</p>}
      </div>
      <button type="button" onClick={onClose} className="rounded p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100" title="Fechar">
        <X size={16} />
      </button>
    </div>
  );
}

export function ConfirmDialog({ dialog, onClose }) {
  const danger = dialog.tone === 'danger';

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${danger ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{dialog.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{dialog.message}</p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-light" onClick={() => onClose(false)}>{dialog.cancelLabel || 'Cancelar'}</button>
          <button type="button" className={danger ? 'btn-danger' : 'btn-warning'} onClick={() => onClose(true)}>
            {dialog.confirmLabel || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PromptDialog({ dialog, onClose, onChange }) {
  function submit(event) {
    event.preventDefault();
    onClose(dialog.value.trim());
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{dialog.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{dialog.message}</p>
          </div>
          <button type="button" onClick={() => onClose('')} className="rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" title="Fechar">
            <X size={20} />
          </button>
        </div>
        <label className="block text-sm font-semibold text-slate-700">
          <span className="mb-1 block">{dialog.label}</span>
          <input
            className="input"
            type={dialog.type || 'text'}
            value={dialog.value}
            onChange={(event) => onChange(event.target.value)}
            autoFocus
          />
        </label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-light" onClick={() => onClose('')}>{dialog.cancelLabel || 'Cancelar'}</button>
          <button type="submit" className="btn-primary" disabled={!dialog.value.trim()}>{dialog.confirmLabel || 'Salvar'}</button>
        </div>
      </form>
    </div>
  );
}
