export const API = '/api';

export async function parseResponse(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { mensagem: text };
  }
}

export async function request(path, { token, ...options } = {}) {
  const headers = {
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(`${API}${path}`, {
    ...options,
    headers
  });
}
