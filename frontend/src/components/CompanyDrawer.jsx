import { Mail, MapPin, Phone, Tag, X } from 'lucide-react';
import { buildAddress } from '../utils/empresa';
import { getField } from '../utils/object';

export function CompanyDrawer({ emp, onClose, onOpenMap }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50">
      <button type="button" className="hidden flex-1 cursor-default md:block" onClick={onClose} aria-label="Fechar detalhes" />
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Detalhes da empresa</p>
            <h2 className="mt-1 text-xl font-bold text-gso-blue">{getField(emp, ['razaoSocial', 'RazaoSocial', 'razaosocial'], '-')}</h2>
            <p className="mt-1 text-sm text-slate-500">{getField(emp, ['cnpjCompleto', 'CnpjCompleto', 'cnpjcompleto'], '')}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <section className="rounded-lg border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase text-slate-500">Contato</h3>
            <InfoLine icon={<Mail size={17} />} label="E-mail" value={String(getField(emp, ['email', 'Email'])).toLowerCase()} />
            <InfoLine icon={<Phone size={17} />} label="Telefone" value={getField(emp, ['telefone', 'Telefone'], '')} />
          </section>

          <section className="rounded-lg border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase text-slate-500">Localizacao</h3>
            <InfoLine icon={<MapPin size={17} />} label="Endereco" value={buildAddress(emp)} />
            <InfoLine icon={<MapPin size={17} />} label="Bairro" value={getField(emp, ['bairro', 'Bairro'], '-')} />
            <InfoLine icon={<MapPin size={17} />} label="Cidade" value={getField(emp, ['municipioNome', 'MunicipioNome'], '-')} />
            <button type="button" onClick={() => onOpenMap(emp)} className="btn-info mt-3 w-full"><MapPin size={16} />Abrir no mapa</button>
          </section>

          <section className="rounded-lg border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase text-slate-500">Classificação</h3>
            <InfoLine icon={<Tag size={17} />} label="CNAE" value={getField(emp, ['cnaeDescricao', 'CnaeDescricao'], '-')} />
            <InfoLine icon={<Tag size={17} />} label="Segmento" value={getField(emp, ['segmento', 'Segmento'], '-')} />
            <InfoLine icon={<Tag size={17} />} label="Porte" value={getField(emp, ['porte', 'Porte'], '-')} />
          </section>
        </div>
      </aside>
    </div>
  );
}

function InfoLine({ icon, label, value }) {
  return (
    <div className="grid grid-cols-[24px_96px_1fr] gap-2 border-b border-slate-100 py-2 last:border-b-0">
      <span className="mt-0.5 text-gso-blue">{icon}</span>
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="break-words text-sm text-slate-800">{value || '-'}</span>
    </div>
  );
}
