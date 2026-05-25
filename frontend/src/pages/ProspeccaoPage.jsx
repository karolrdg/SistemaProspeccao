import { Download, Eye, Map, MapPin, Route, Save, Search, Unlock } from 'lucide-react';
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
      <section className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gso-blue">Prospecao de Empresas</h1>
          <p className="text-sm text-slate-500">{empresas.length > 0 ? `${empresas.length} empresas carregadas` : 'Use os filtros para buscar oportunidades'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={traceRoute} className="btn-info"><Route size={16} />Tracar Rota</button>
          <button type="button" onClick={exportCsv} className="btn-danger"><Download size={16} />Exportar My Maps</button>
          <a href="https://www.google.com/mymaps" target="_blank" rel="noreferrer" className="btn-success"><Map size={16} />Abrir My Maps</a>
        </div>
      </section>

      <SelectionActionBar
        count={selected.length}
        onTraceRoute={traceRoute}
        onExportCsv={exportCsv}
        onClear={() => setSelected([])}
      />

      <section className="mb-5 rounded-lg bg-white p-4 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              <option value="">Todos</option>
              <option value="03">ME</option>
              <option value="05">EPP</option>
              <option value="01">Medio/Grande</option>
            </select>
          </Field>
          <Field label="Ordenar por">
            <select className="input" value={filters.ordenacao} onChange={(e) => updateFilter('ordenacao', e.target.value)}>
              <option value="mais_novas">Mais Novas</option>
              <option value="mais_antigas">Mais Antigas</option>
            </select>
          </Field>
          <Field label="Pesquisa livre">
            <input className="input" value={filters.palavraCnae} onChange={(e) => updateFilter('palavraCnae', e.target.value)} placeholder="Ex: combustivel, medicina..." />
          </Field>
          <SearchableSelect
            label="CNAE especifico"
            value={filters.cnae}
            onChange={(value) => updateFilter('cnae', value)}
            options={cnaeOptions}
            placeholder="Segmento especifico..."
            searchPlaceholder="Buscar CNAE ou codigo..."
          />
          <SearchableSelect
            label="Segmento macro"
            value={filters.segmento}
            onChange={(value) => updateFilter('segmento', value)}
            options={segmentoOptions}
            placeholder="Todos"
            searchPlaceholder="Buscar segmento..."
          />
          <div className="flex items-end gap-4">
            <label className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" className="h-5 w-5 accent-gso-blue" checked={filters.incluirInativas} onChange={(e) => updateFilter('incluirInativas', e.target.checked)} />
              Exibir inativas
            </label>
            <button type="button" onClick={buscarEmpresas} className="btn-primary mb-3 flex-1" disabled={loading}>
              <Search size={16} />{loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>
      </section>

      {message && <div className="mb-4 rounded bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{message}</div>}

      <section className="overflow-hidden rounded-lg bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
            <thead className="bg-gso-blue text-xs uppercase text-white">
              <tr>
                <th className="w-12 px-3 py-3 text-center">
                  <input type="checkbox" className="h-5 w-5 accent-white" checked={pageEmpresas.length > 0 && pageEmpresas.every((emp) => selected.includes(empresaId(emp)))} onChange={(e) => toggleAllPage(e.target.checked)} />
                </th>
                <Th>CNPJ</Th>
                <Th>Razao Social</Th>
                <Th>Bairro</Th>
                <Th>Endereco</Th>
                <Th>Abertura</Th>
                <Th>CNAE</Th>
                <Th>Clinica Atual</Th>
                <Th>Observacao</Th>
                <Th center>Acoes</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <EmptyRow text="Buscando..." />}
              {!loading && pageEmpresas.length === 0 && <EmptyRow text="Nenhuma empresa na tabela." />}
              {!loading && pageEmpresas.map((emp) => {
                const cnpj = empresaId(emp);
                const dono = getField(emp, ['vendedorDono', 'VendedorDono', 'vendedordono']);
                const isOwner = dono.trim().toLowerCase() === session.nome.trim().toLowerCase();
                const isAdmin = session.nivel === 'Admin';
                const canEdit = !dono || isOwner || isAdmin;
                const draft = drafts[cnpj] || { clinicaAtual: '', observacao: '' };
                return (
                  <tr key={cnpj} className={`border-b border-slate-100 ${dono && !canEdit ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-3 py-3 text-center"><input type="checkbox" className="h-5 w-5 accent-gso-blue" checked={selected.includes(cnpj)} onChange={() => toggleSelected(cnpj)} /></td>
                    <td className="px-3 py-3 text-xs">{cnpj}</td>
                    <td className="max-w-[280px] px-3 py-3 font-semibold">
                      {getField(emp, ['razaoSocial', 'RazaoSocial', 'razaosocial'], '-')}
                      {dono && <OwnerBadge dono={dono} isOwner={isOwner} isAdmin={isAdmin} />}
                    </td>
                    <td className="px-3 py-3">{getField(emp, ['bairro', 'Bairro'], '-')}</td>
                    <td className="px-3 py-3">{buildAddress(emp)}</td>
                    <td className="px-3 py-3">{formatDate(getField(emp, ['dataAbertura', 'DataAbertura', 'dataabertura'], null))}</td>
                    <td className="max-w-[240px] px-3 py-3 text-xs">{getField(emp, ['cnaeDescricao', 'CnaeDescricao', 'cnaedescricao'], '-')}</td>
                    <td className="px-3 py-3">
                      <input className="table-input" disabled={!canEdit} value={draft.clinicaAtual || ''} onChange={(e) => setDrafts((prev) => ({ ...prev, [cnpj]: { ...draft, clinicaAtual: e.target.value } }))} />
                    </td>
                    <td className="px-3 py-3">
                      <input className="table-input" disabled={!canEdit} value={draft.observacao || ''} onChange={(e) => setDrafts((prev) => ({ ...prev, [cnpj]: { ...draft, observacao: e.target.value } }))} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center gap-1">
                        <IconButton title="Info" className="bg-sky-700 hover:bg-sky-800" onClick={() => setModal(emp)}><Eye size={16} /></IconButton>
                        <IconButton title="Ver no mapa" className="bg-red-600 hover:bg-red-700" onClick={() => openMap(emp)}><MapPin size={16} /></IconButton>
                        <IconButton title="Autorizar" className="bg-gso-green hover:bg-green-700" disabled={!canEdit} onClick={() => saveLead(cnpj)}><Save size={16} /></IconButton>
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
    </>
  );
}
