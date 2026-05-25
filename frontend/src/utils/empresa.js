import { getField } from './object';

export function empresaId(emp) {
  return getField(emp, ['cnpjCompleto', 'CnpjCompleto', 'cnpjcompleto']);
}

export function buildAddress(emp) {
  const rua = getField(emp, ['rua', 'Rua', 'logradouro', 'Logradouro']);
  const numero = getField(emp, ['numero', 'Numero']) || 'S/N';
  return `${rua}, ${numero}`;
}

export function createDrafts(empresas) {
  return Object.fromEntries(empresas.map((emp) => {
    const cnpj = empresaId(emp);
    return [cnpj, {
      clinicaAtual: getField(emp, ['clinicaAtual', 'ClinicaAtual', 'clinicaatual']),
      observacao: getField(emp, ['observacao', 'Observacao'])
    }];
  }));
}
