import { buildAddress, empresaId } from './empresa';
import { getField } from './object';

export function exportMyMapsCsv(empresas, selected, estado) {
  const rows = ['Razao Social,Endereco,Bairro,Cidade,Estado,CNPJ,Segmento'];

  empresas.filter((emp) => selected.includes(empresaId(emp))).forEach((emp) => {
    const values = [
      getField(emp, ['razaoSocial', 'RazaoSocial', 'razaosocial']),
      buildAddress(emp),
      getField(emp, ['bairro', 'Bairro']),
      getField(emp, ['municipioNome', 'MunicipioNome']),
      estado,
      empresaId(emp),
      getField(emp, ['segmento', 'Segmento'])
    ].map((value) => `"${String(value || '').replace(/"/g, '')}"`);
    rows.push(values.join(','));
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([`\uFEFF${rows.join('\n')}`], { type: 'text/csv;charset=utf-8;' }));
  link.download = 'GSO_Prospeccao_MyMaps.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
