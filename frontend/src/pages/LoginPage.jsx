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
      setLoginError('Não foi possível conectar na API.');
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sky-100 via-slate-50 to-emerald-50">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden min-h-screen overflow-hidden lg:flex">

          <img
            src={`${window.location.origin}/img/vendedoras-prospectcrm.png`}
            alt="Equipe"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-[#071a2c]/80 via-[#071a2c]/55 to-emerald-950/35" />

          {/* CONTEÚDO */}
          <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-16">

            {/* LOGO */}
            <div>
              <img
                src="/img/logo-login.png"
                alt="ProspectCRM"
                className="h-24 object-contain"
              />
            </div>

            <div className="max-w-xl">
              <h1 className="mb-3 text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Transforme sua equipe de vendas com o ProspectCRM
              </h1>

              <p className="max-w-lg text-lg leading-relaxed text-slate-200">
                Controle leads, acompanhe negociações e aumente os resultados
                da sua empresa com uma plataforma moderna e inteligente.
              </p>
            </div>
          </div>
        </section>

        {/* LADO DIREITO */}
        <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="absolute left-7 top-7 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-700 text-white"><img src="/img/logo-menu.png" alt="" className="max-h-6 max-w-7 object-contain" /></span>
            <span className="text-sm font-bold tracking-tight text-slate-800">ProspectCRM</span>
          </div>
          <div className="w-full max-w-[440px]">

            {/* CARD */}
            <form
              onSubmit={handleLogin}
              className="rounded-3xl border border-white/80 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-10"
            >

              {/* LOGO */}
              <img
                src="/img/logo-login.png"
                alt="ProspectCRM"
                className="mx-auto mb-7 h-16 object-contain"
              />

              {/* TITULO */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Bem-vindo
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Acesse sua conta para continuar
                </p>
              </div>

              {/* EMAIL */}
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                E-mail
              </label>

              <input
                id="login-email"
                type="email"
                placeholder="Digite seu e-mail"
                value={login.email}
                onChange={(event) =>
                  setLogin((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                className="input mb-5 px-4 py-3"
                autoComplete="email"
              />

              {/* SENHA */}
              <label
                htmlFor="login-senha"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Senha
              </label>

              <input
                id="login-senha"
                type="password"
                placeholder="Digite sua senha"
                value={login.senha}
                onChange={(event) =>
                  setLogin((prev) => ({
                    ...prev,
                    senha: event.target.value,
                  }))
                }
                className="input mb-5 px-4 py-3"
                autoComplete="current-password"
              />

              {/* ERRO */}
              {loginError && (
                <p className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {loginError}
                </p>
              )}

              {/* BOTÃO */}
              <button
                className="btn-primary w-full py-3.5 text-base shadow-lg shadow-emerald-900/10"
                type="submit"
              >
                Entrar no Sistema
              </button>
            </form>
          </div>
        </section>
      </div>
    </main >
  );
}
