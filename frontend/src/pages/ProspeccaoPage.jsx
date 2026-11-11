import { Building2, Download, Eye, Filter, Map, MapPin, Route, Save, Search, Unlock } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  autorizarLead,
  buscarEmpresasApi,
  getCidades,
  getCnaes,
  getEstados,
  getSegmentos,
  liberarLead
} from '../api/prospeccaoApi';
import { parseResponse } from '../api/http';
import { CompanyDrawer } from '../components/CompanyDrawer';
import { Field } from '../components/Field';
import { IconButton } from '../components/IconButton';
import { OwnerBadge } from '../components/OwnerBadge';
import { Pagination } from '../components/Pagination';
import { SearchableSelect } from '../components/SearchableSelect';
import { SelectionActionBar } from '../components/SelectionActionBar';
import { EmptyRow, Th } from '../components/Table';
import { INITIAL_FILTERS, ITENS_POR_PAGINA } from '../utils/constants';
import { buildAddress, createDrafts, empresaId } from '../utils/empresa';
import { exportMyMapsCsv } from '../utils/exportCsv';
import { formatDate } from '../utils/formatters';
import { getField } from '../utils/object';

export function ProspeccaoPage({ session, logout, ui }) {
  const [dominios, setDominios] = useState({ estados: [], cidades: [], cnaes: [], segmentos: [] });
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [empresas, setEmpresas] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(null);

  async function handleAuth(res) {
    if (res.status === 401) {
      ui.notify({ type: 'warning', title: 'Sessao expirada', message: 'Entre novamente para continuar.' });
      logout();
      return false;
    }
    return true;
  }

  useEffect(() => {
    async function load() {
      try {
        const [estadosRes, cnaesRes, segmentosRes] = await Promise.all([
          getEstados(session.token),
          getCnaes(session.token),
          getSegmentos(session.token)
        ]);
        if (!(await handleAuth(estadosRes)) || !(await handleAuth(cnaesRes)) || !(await handleAuth(segmentosRes))) return;
        const [estados, cnaes, segmentos] = await Promise.all([
          estadosRes.json(),
          cnaesRes.json(),
          segmentosRes.json()
        ]);
        setDominios((prev) => ({ ...prev, estados, cnaes, segmentos }));
      } catch {
        setMessage('Falha ao carregar filtros.');
        ui.notify({ type: 'error', title: 'Filtros indisponiveis', message: 'Nao foi possivel carregar os filtros agora.' });
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadCities() {
      if (!filters.estado) {
        setDominios((prev) => ({ ...prev, cidades: [] }));
        setFilters((prev) => ({ ...prev, municipio: '' }));
        return;
      }
      const res = await getCidades(filters.estado, session.token);
      if (!(await handleAuth(res))) return;
      const cidades = await res.json();
      setDominios((prev) => ({ ...prev, cidades }));
      setFilters((prev) => ({ ...prev, municipio: '' }));
    }
    loadCities();
  }, [filters.estado]);

  const totalPages = Math.ceil(empresas.length / ITENS_POR_PAGINA);
  const pageEmpresas = empresas.slice((page - 1) * ITENS_POR_PAGINA, page * ITENS_POR_PAGINA);
  const estadoOptions = dominios.estados.map((uf) => ({ value: uf, label: uf }));
  const cidadeOptions = dominios.cidades.map((cidade) => ({ value: String(cidade.codigo), label: cidade.descricao || cidade.codigo }));
  const cnaeOptions = dominios.cnaes.map((cnae) => ({ value: String(cnae.codigo), label: cnae.descricao || cnae.codigo }));
  const segmentoOptions = dominios.segmentos.map((seg) => {
    const value = seg.novo_seguimento || seg.novoSeguimento || seg.NovoSeguimento;
    return { value, label: value };
  }).filter((option) => option.value);

  function updateFilter(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function buscarEmpresas() {
    if (!filters.municipio) {
      ui.notify({ type: 'warning', title: 'Cidade obrigatoria', message: 'Selecione uma cidade antes de buscar.' });
      return;
    }

    setLoading(true);
    setMessage('');
    setSelected([]);
    try {
      const res = await buscarEmpresasApi(filters, session.token);
      if (!(await handleAuth(res))) return;
      const data = await parseResponse(res);
      if (!res.ok) {
        setMessage(data.erro || 'Erro ao buscar empresas.');
        ui.notify({ type: 'error', title: 'Erro na busca', message: data.erro || 'Nao foi possivel buscar empresas.' });
        setEmpresas([]);
        setDrafts({});
        return;
      }

      if (!Array.isArray(data)) {
        const errorMessage = 'A API retornou uma resposta invalida ao buscar empresas.';
        setEmpresas([]);
        setDrafts({});
        setMessage(errorMessage);
        ui.notify({ type: 'error', title: 'Resposta invalida', message: errorMessage });
        return;
      }

      setEmpresas(data);
      setDrafts(createDrafts(data));
      setPage(1);
      if (data.length === 0) setMessage('Nenhuma empresa encontrada.');
      else ui.notify({ type: 'success', title: 'Busca concluida', message: `${data.length} empresas encontradas.` });
    } catch {
      setMessage('Erro de conexao ao buscar empresas.');
      ui.notify({ type: 'error', title: 'Sem conexao', message: 'A API nao respondeu a busca.' });
    } finally {
      setLoading(false);
    }
  }

  function openMap(emp) {
    const cidade = getField(emp, ['municipioNome', 'MunicipioNome']);
    const query = `${buildAddress(emp)}, ${cidade} - ${filters.estado}`.replace(/"/g, '');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  }

  function traceRoute() {
    if (selected.length === 0 || selected.length > 10) {
      ui.notify({ type: 'warning', title: 'Selecao invalida', message: 'Selecione de 1 a 10 empresas para tracar rota.' });
      return;
    }
    const url = selected.reduce((acc, cnpj) => {
      const emp = empresas.find((item) => empresaId(item) === cnpj);
      if (!emp) return acc;
      const cidade = getField(emp, ['municipioNome', 'MunicipioNome']);
      const query = `${buildAddress(emp)}, ${cidade} - ${filters.estado}`.replace(/"/g, '');
      return `${acc}${encodeURIComponent(query)}/`;
    }, 'https://www.google.com/maps/dir/');
    window.open(url, '_blank');
  }

  function exportCsv() {
    if (selected.length === 0) {
      ui.notify({ type: 'warning', title: 'Nada selecionado', message: 'Selecione pelo menos uma empresa para exportar.' });
      return;
    }
    exportMyMapsCsv(empresas, selected, filters.estado);
    ui.notify({ type: 'success', title: 'CSV gerado', message: `${selected.length} empresas exportadas para My Maps.` });
  }

  async function saveLead(cnpj) {
    const draft = drafts[cnpj] || {};
    const res = await autorizarLead(cnpj, draft, session.token);
    if (!(await handleAuth(res))) return;
    const data = await parseResponse(res);
    if (!res.ok) {
      ui.notify({ type: 'error', title: 'Lead nao salvo', message: data.erro || 'Nao autorizado.' });
      return;
    }
    ui.notify({ type: 'success', title: 'Lead salvo', message: 'As informacoes da empresa foram atualizadas.' });
    await buscarEmpresas();
  }

  async function releaseLead(cnpj) {
    const confirmed = await ui.confirm({
      tone: 'warning',
      title: 'Liberar empresa?',
      message: 'As observacoes serao apagadas e ela voltara para a lista geral.',
      confirmLabel: 'Liberar empresa'
    });
    if (!confirmed) return;
    const res = await liberarLead(cnpj, session.token);
    if (!(await handleAuth(res))) return;
    const data = await parseResponse(res);
    if (!res.ok) {
      ui.notify({ type: 'error', title: 'Erro ao liberar', message: data.erro || 'Tente novamente em instantes.' });
      return;
    }
    ui.notify({ type: 'success', title: 'Empresa liberada', message: 'Ela voltou para a lista geral.' });
    await buscarEmpresas();
  }

  function toggleSelected(cnpj) {
    setSelected((prev) => prev.includes(cnpj) ? prev.filter((item) => item !== cnpj) : [...prev, cnpj]);
  }

  function toggleAllPage(checked) {
    const ids = pageEmpresas.map(empresaId);
    setSelected((prev) => checked ? [...new Set([...prev, ...ids])] : prev.filter((id) => !ids.includes(id)));
  }

  return (
    <>
      <div className="mx-auto max-w-[1680px]">
        <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 sm:flex">
              <Building2 size={25} strokeWidth={1.8} />
            </div>
            <div>
              <p className="section-kicker mb-1">Workspace <span className="px-1 text-slate-300">/</span> Comercial</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-[34px]">Prospecção</h1>
              <p className="mt-1.5 text-sm text-slate-500">Encontre empresas com potencial e organize os próximos contatos.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={traceRoute} className="btn-light"><Route size={16} />Traçar rota</button>
            <button type="button" onClick={exportCsv} className="btn-light"><Download size={16} />Exportar</button>
            <a href="https://www.google.com/mymaps" target="_blank" rel="noreferrer" className="btn-primary"><Map size={16} />Abrir My Maps</a>
          </div>
        </section>

        <SelectionActionBar
          count={selected.length}
          onTraceRoute={traceRoute}
          onExportCsv={exportCsv}
          onClear={() => setSelected([])}
        />

        <section className="surface-card mb-6 p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Filter size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Refine sua busca</h2>
              <p className="mt-0.5 text-xs text-slate-500">Escolha a região e os critérios para encontrar empresas.</p>
            </div>
          </div>

          <div className="grid gap-x-5 gap-y-1 sm:grid-cols-2 xl:grid-cols-4">
            <SearchableSelect
              label="Estado"
              value={filters.estado}
              onChange={(value) => updateFilter('estado', value)}
              options={estadoOptions}
              placeholder="Selecione..."
              searchPlaceholder="Buscar UF..."
            />
            <SearchableSelect
              label="Cidade"
              value={filters.municipio}
              onChange={(value) => updateFilter('municipio', value)}
              options={cidadeOptions}
              placeholder={filters.estado ? 'Selecione a cidade...' : 'Selecione o Estado...'}
              searchPlaceholder="Buscar cidade..."
              disabled={!filters.estado}
            />
            <Field label="Porte">
              <select className="input" value={filters.porte} onChange={(e) => updateFilter('porte', e.target.value)}>
                <option value="">Todos os portes</option>
                <option value="03">Microempresa</option>
                <option value="05">Empresa de pequeno porte</option>
                <option value="01">Médio ou grande porte</option>
              </select>
            </Field>
            <Field label="Ordenar por">
              <select className="input" value={filters.ordenacao} onChange={(e) => updateFilter('ordenacao', e.target.value)}>
                <option value="mais_novas">Empresas mais novas</option>
                <option value="mais_antigas">Empresas mais antigas</option>
              </select>
            </Field>
            <Field label="Atividade ou palavra-chave">
              <input className="input" value={filters.palavraCnae} onChange={(e) => updateFilter('palavraCnae', e.target.value)} placeholder="Ex.: combustível, medicina..." />
            </Field>
            <SearchableSelect
              label="CNAE específico"
              value={filters.cnae}
              onChange={(value) => updateFilter('cnae', value)}
              options={cnaeOptions}
              placeholder="Todos os CNAEs"
              searchPlaceholder="Buscar CNAE ou código..."
            />
            <SearchableSelect
              label="Segmento"
              value={filters.segmento}
              onChange={(value) => updateFilter('segmento', value)}
              options={segmentoOptions}
              placeholder="Todos os segmentos"
              searchPlaceholder="Buscar segmento..."
            />
            <div className="flex items-end gap-3 pb-4">
              <label className="flex min-h-11 flex-1 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition hover:bg-white">
                <input type="checkbox" className="h-4 w-4 rounded accent-emerald-600" checked={filters.incluirInativas} onChange={(e) => updateFilter('incluirInativas', e.target.checked)} />
                Incluir inativas
              </label>
              <button type="button" onClick={buscarEmpresas} className="btn-primary min-w-32" disabled={loading}>
                <Search size={16} />{loading ? 'Buscando...' : 'Buscar empresas'}
              </button>
            </div>
          </div>
        </section>

        {message && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">{message}</div>}

        <section className="surface-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-semibold text-slate-900">Empresas encontradas</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600">{empresas.length}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Selecione empresas para exportar ou montar uma rota.</p>
            </div>
            {empresas.length > 0 && <span className="text-xs font-medium text-slate-400">Exibindo {pageEmpresas.length} nesta página</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1320px] w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="w-12 px-3 py-3 text-center">
                    <input type="checkbox" aria-label="Selecionar todas as empresas desta página" className="h-4 w-4 rounded accent-sky-700" checked={pageEmpresas.length > 0 && pageEmpresas.every((emp) => selected.includes(empresaId(emp)))} onChange={(e) => toggleAllPage(e.target.checked)} />
                  </th>
                  <Th>CNPJ</Th>
                  <Th>Razão social</Th>
                  <Th>Bairro</Th>
                  <Th>Endereço</Th>
                  <Th>Abertura</Th>
                  <Th>CNAE</Th>
                  <Th>Clínica atual</Th>
                  <Th>Observação</Th>
                  <Th center>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {loading && <EmptyRow text="Buscando empresas..." />}
                {!loading && pageEmpresas.length === 0 && <EmptyRow text="Nenhuma empresa para exibir. Ajuste os filtros e faça uma busca." />}
                {!loading && pageEmpresas.map((emp) => {
                  const cnpj = empresaId(emp);
                  const dono = getField(emp, ['vendedorDono', 'VendedorDono', 'vendedordono']);
                  const isOwner = dono.trim().toLowerCase() === session.nome.trim().toLowerCase();
                  const isAdmin = session.nivel === 'Admin';
                  const canEdit = !dono || isOwner || isAdmin;
                  const draft = drafts[cnpj] || { clinicaAtual: '', observacao: '' };
                  return (
                    <tr key={cnpj} className={`border-b border-slate-100 transition-colors ${selected.includes(cnpj) ? 'bg-sky-50/70' : dono && !canEdit ? 'bg-amber-50/50' : 'hover:bg-slate-50/80'}`}>
                      <td className="px-3 py-3 text-center"><input type="checkbox" aria-label={`Selecionar ${cnpj}`} className="h-4 w-4 rounded accent-sky-700" checked={selected.includes(cnpj)} onChange={() => toggleSelected(cnpj)} /></td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-500">{cnpj}</td>
                      <td className="max-w-[280px] px-3 py-3 font-semibold text-slate-800">
                        {getField(emp, ['razaoSocial', 'RazaoSocial', 'razaosocial'], '-')}
                        {dono && <OwnerBadge dono={dono} isOwner={isOwner} isAdmin={isAdmin} />}
                      </td>
                      <td className="px-3 py-3 text-slate-600">{getField(emp, ['bairro', 'Bairro'], '-')}</td>
                      <td className="px-3 py-3 text-slate-600">{buildAddress(emp)}</td>
                      <td className="px-3 py-3 tabular-nums text-slate-600">{formatDate(getField(emp, ['dataAbertura', 'DataAbertura', 'dataabertura'], null))}</td>
                      <td className="max-w-[240px] px-3 py-3 text-xs text-slate-600">{getField(emp, ['cnaeDescricao', 'CnaeDescricao', 'cnaedescricao'], '-')}</td>
                      <td className="px-3 py-3"><input aria-label={`Clínica atual de ${cnpj}`} className="table-input" disabled={!canEdit} value={draft.clinicaAtual || ''} onChange={(e) => setDrafts((prev) => ({ ...prev, [cnpj]: { ...draft, clinicaAtual: e.target.value } }))} /></td>
                      <td className="px-3 py-3"><input aria-label={`Observação de ${cnpj}`} className="table-input" disabled={!canEdit} value={draft.observacao || ''} onChange={(e) => setDrafts((prev) => ({ ...prev, [cnpj]: { ...draft, observacao: e.target.value } }))} /></td>
                      <td className="px-3 py-3">
                        <div className="flex justify-center gap-1">
                          <IconButton title="Detalhes" className="bg-sky-700 hover:bg-sky-800" onClick={() => setModal(emp)}><Eye size={16} /></IconButton>
                          <IconButton title="Ver no mapa" className="bg-slate-700 hover:bg-slate-800" onClick={() => openMap(emp)}><MapPin size={16} /></IconButton>
                          <IconButton title="Salvar lead" className="bg-emerald-600 hover:bg-emerald-700" disabled={!canEdit} onClick={() => saveLead(cnpj)}><Save size={16} /></IconButton>
                          {dono && canEdit && <IconButton title="Liberar empresa" className="bg-amber-400 text-slate-900 hover:bg-amber-500" onClick={() => releaseLead(cnpj)}><Unlock size={16} /></IconButton>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} totalItems={empresas.length} setPage={setPage} />}
        {modal && <CompanyDrawer emp={modal} onClose={() => setModal(null)} onOpenMap={openMap} />}
      </div>
    </>
  );
}
