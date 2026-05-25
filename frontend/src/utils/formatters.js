export function formatDate(value) {
  if (!value) return '-';
  const str = String(value);
  if (str.includes('-')) return str.split('T')[0].split('-').reverse().join('/');
  return str;
}
