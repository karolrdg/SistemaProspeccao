import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Pesquisar...',
  disabled = false
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);

  const selected = options.find((option) => option.value === value);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return options.slice(0, 80);
    return options
      .filter((option) => normalize(option.label).includes(normalizedQuery) || normalize(option.value).includes(normalizedQuery))
      .slice(0, 80);
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectOption(nextValue) {
    onChange(nextValue);
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={rootRef} className="relative">
      {label && <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>}
      <button
        type="button"
        disabled={disabled}
        className="input mb-3 flex min-h-[42px] items-center justify-between gap-2 text-left disabled:opacity-75"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={`truncate ${selected ? 'text-slate-800' : 'text-slate-400'}`}>{selected?.label || placeholder}</span>
        <ChevronDown size={16} className={`shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              className="w-full border-none bg-transparent text-sm outline-none"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
            />
            {value && (
              <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={() => selectOption('')} title="Limpar">
                <X size={15} />
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50"
              onClick={() => selectOption('')}
            >
              {placeholder}
              {!value && <Check size={15} />}
            </button>
            {filteredOptions.map((option) => (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-sky-50"
                onClick={() => selectOption(option.value)}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && <Check size={15} className="shrink-0 text-gso-blue" />}
              </button>
            ))}
            {filteredOptions.length === 0 && <div className="px-3 py-6 text-center text-sm font-semibold text-slate-400">Nenhum resultado.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
