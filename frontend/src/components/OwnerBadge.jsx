import { Lock, UserCheck } from 'lucide-react';

export function OwnerBadge({ dono, isOwner, isAdmin }) {
  if (isOwner) {
    return <span className="mt-1 inline-flex items-center gap-1 rounded bg-gso-blue px-2 py-1 text-xs font-bold text-white"><UserCheck size={12} />Sua Empresa</span>;
  }
  if (isAdmin) {
    return <span className="mt-1 inline-flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white"><Lock size={12} />Vendedor: {dono}</span>;
  }
  return <span className="mt-1 inline-flex items-center gap-1 rounded bg-slate-500 px-2 py-1 text-xs font-bold text-white"><Lock size={12} />Empresa Ocupada</span>;
}
