export function getField(obj, names, fallback = '') {
  for (const name of names) {
    if (obj?.[name] !== undefined && obj?.[name] !== null) return obj[name];
  }
  return fallback;
}
