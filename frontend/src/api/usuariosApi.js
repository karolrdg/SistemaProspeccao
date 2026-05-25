import { request } from './http';

export function listarUsuarios(token) {
  return request('/usuarios/listar', { token });
}

export function cadastrarUsuarioApi(form, token) {
  return request('/usuarios/cadastrar', {
    token,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Nome: form.nome, Email: form.email, Senha: form.senha, Nivel: form.nivel })
  });
}

export function alterarSenhaApi(id, novaSenha, token) {
  return request(`/usuarios/${id}/senha`, {
    token,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ NovaSenha: novaSenha })
  });
}

export function apagarUsuarioApi(id, token) {
  return request(`/usuarios/${id}`, {
    token,
    method: 'DELETE'
  });
}
