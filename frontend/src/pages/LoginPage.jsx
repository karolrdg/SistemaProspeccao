import { useState } from 'react';
import { login as loginApi } from '../api/authApi';
import { parseResponse } from '../api/http';

export function LoginPage({ onLogin }) {
  const [login, setLogin] = useState({ email: '', senha: '' });
  const [loginError, setLoginError] = useState('');

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError('');

    try {
      const res = await loginApi(login);
      const data = await parseResponse(res);
      if (!res.ok) {
        setLoginError(data.erro || 'E-mail ou senha incorretos.');
        return;
      }
      onLogin(data);
    } catch {
      setLoginError('Nao foi possivel conectar na API.');
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#086498,#002b4b_46%,#00182a)] px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-2xl">
        <img src="/img/logo-login.png" alt="Grupo ProspectCRM" className="mx-auto mb-7 max-h-24 max-w-48 object-contain" />
        <label className="sr-only" htmlFor="login-email">E-mail</label>
        <input
          id="login-email"
          type="email"
          placeholder="Seu e-mail"
          value={login.email}
          onChange={(event) => setLogin((prev) => ({ ...prev, email: event.target.value }))}
          className="input"
          autoComplete="email"
        />
        <label className="sr-only" htmlFor="login-senha">Senha</label>
        <input
          id="login-senha"
          type="password"
          placeholder="Sua senha"
          value={login.senha}
          onChange={(event) => setLogin((prev) => ({ ...prev, senha: event.target.value }))}
          className="input"
          autoComplete="current-password"
        />
        {loginError && <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{loginError}</p>}
        <button className="btn-primary w-full" type="submit">Entrar no Sistema</button>
      </form>
    </main>
  );
}
