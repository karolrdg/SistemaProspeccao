import { API, request } from './http';

export function getEstados(token) {
  return request('/dominios/estados', { token });
}

export function getCidades(uf, token) {
  return request(`/dominios/cidades/${uf}`, { token });
}

export function getCnaes(token) {
  return request('/dominios/cnaes', { token });
}

export function getSegmentos(token) {
  return request('/prospeccao/segmentos', { token });
}

export function buscarEmpresasApi(filters, token) {
  const url = new URL(`${window.location.origin}${API}/prospeccao/empresas`);
  url.searchParams.append('municipio', filters.municipio);
  url.searchParams.append('ordenacao', filters.ordenacao);
  url.searchParams.append('incluirInativas', filters.incluirInativas);
  if (filters.cnae) url.searchParams.append('cnae', filters.cnae);
  if (filters.palavraCnae) url.searchParams.append('palavraCnae', filters.palavraCnae);
  if (filters.porte) url.searchParams.append('porte', filters.porte);
  if (filters.segmento) url.searchParams.append('segmento', filters.segmento);
  if (filters.capital) url.searchParams.append('capital', filters.capital);

  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function autorizarLead(cnpj, draft, token) {
  return request('/prospeccao/autorizar', {
    token,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ Cnpj: cnpj, ClinicaAtual: draft.clinicaAtual || '', Observacao: draft.observacao || '' }])
  });
}

export function liberarLead(cnpj, token) {
  return request(`/prospeccao/liberar/${cnpj}`, {
    token,
    method: 'POST'
  });
}
