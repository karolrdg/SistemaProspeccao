import { CircleUser, LogOut, Search, UsersRound } from 'lucide-react';

export function Sidebar({ activeSection, setActiveSection, nome, nivel, logout }) {
  const itemClass = (section) =>
    `relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl transition ${activeSection === section
      ? 'bg-white text-sky-800 shadow-lg shadow-slate-950/20'
      : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[68px] flex-col items-center border-r border-white/10 bg-[#10263d] px-2 text-white shadow-xl shadow-slate-950/10 sm:w-[76px]">
      <div className="flex h-[76px] w-full items-center justify-center border-b border-white/10">
        <img src="/img/logo-menu.png" alt="ProspectCRM" title="ProspectCRM" className="max-h-10 max-w-12 object-contain" />
      </div>
      <nav className="flex w-full flex-1 flex-col items-center gap-2 pt-5" aria-label="Navegação principal">
        <button type="button" aria-label="Prospecção" title="Prospecção" className={itemClass('prospeccao')} onClick={() => setActiveSection('prospeccao')}>
          <Search size={19} strokeWidth={2.2} />
        </button>
        {nivel === 'Admin' && (
          <button type="button" aria-label="Colaboradores" title="Colaboradores" className={itemClass('usuarios')} onClick={() => setActiveSection('usuarios')}>
            <UsersRound size={19} strokeWidth={2.2} />
          </button>
        )}
      </nav>
      <div className="flex w-full flex-col items-center gap-3 border-t border-white/10 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-bold text-white" title={nome || 'Perfil'}>
          {nome?.trim()?.charAt(0)?.toUpperCase() || <CircleUser size={18} />}
        </div>
        <button
          type="button"
          onClick={logout}
          aria-label="Sair"
          title="Sair"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition hover:bg-rose-500/15 hover:text-rose-200"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
