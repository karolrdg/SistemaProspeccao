import { request } from './http';

export function getEstados(token) {
  return request('/dominios/estados', { token });
}

export function getCidades(uf, token) {
  return request(`/dominios/cidades/${encodeURIComponent(uf)}`, { token });
}

export function getCnaes(token) {
  return request('/dominios/cnaes', { token });
}

export function getSegmentos(token) {
  return request('/prospeccao/segmentos', { token });
}

export function buscarEmpresasApi(filters, token) {
  const query = new URLSearchParams({
    municipio: filters.municipio,
    ordenacao: filters.ordenacao,
    incluirInativas: String(filters.incluirInativas)
  });

  for (const name of ['cnae', 'palavraCnae', 'porte', 'segmento', 'capital']) {
    if (filters[name]) query.set(name, filters[name]);
  }

  return request(`/prospeccao/empresas?${query.toString()}`, { token });
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
  return request(`/prospeccao/liberar/${encodeURIComponent(cnpj)}`, {
    token,
    method: 'POST'
  });
}
