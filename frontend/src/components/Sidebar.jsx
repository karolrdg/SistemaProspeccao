import { CircleUser, LogOut, Search, UsersRound } from 'lucide-react';

export function Sidebar({ activeSection, setActiveSection, nome, logout }) {
  const itemClass = (section) =>
    `group flex w-full items-center border-l-4 px-4 py-4 text-left text-sm font-semibold transition ${activeSection === section
      ? 'border-sky-400 bg-white/10 text-white'
      : 'border-transparent text-white/80 hover:border-sky-600 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <aside className="group fixed inset-y-0 left-0 z-30 flex w-[76px] flex-col overflow-hidden whitespace-nowrap bg-gso-navy transition-all duration-300 hover:w-64 md:w-[85px]">
      <div className="flex h-24 items-center justify-center border-b border-white/10 px-3">
        <img src="/img/logo-menu.png" alt="ProspectCRM" className="max-h-12 max-w-14 object-contain transition-all duration-300 group-hover:max-w-44" />
      </div>
      <nav className="flex-1 pt-4">
        <button type="button" className={itemClass('prospeccao')} onClick={() => setActiveSection('prospeccao')}>
          <Search className="h-5 min-w-11" />
          <span className="opacity-0 transition group-hover:opacity-100">Prospeccao</span>
        </button>
        <button type="button" className={itemClass('usuarios')} onClick={() => setActiveSection('usuarios')}>
          <UsersRound className="h-5 min-w-11" />
          <span className="opacity-0 transition group-hover:opacity-100">Colaboradores</span>
        </button>
      </nav>
      <div className="space-y-3 border-t border-white/10 p-4">
        <div className="flex items-center text-white/90">
          <CircleUser className="h-6 min-w-11" />
          <span className="truncate text-sm font-semibold opacity-0 transition group-hover:opacity-100">{nome}</span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center rounded border border-red-400/80 py-2 text-red-200 transition hover:bg-red-500 hover:text-white"
        >
          <LogOut className="h-5 min-w-11" />
          <span className="opacity-0 transition group-hover:opacity-100">Sair</span>
        </button>
      </div>
    </aside>
  );
}
