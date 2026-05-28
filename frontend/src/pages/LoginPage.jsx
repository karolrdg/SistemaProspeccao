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
    <main className="min-h-screen bg-[#071a2c]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LADO ESQUERDO */}
        <section className="relative hidden overflow-hidden lg:flex">

          {/* IMAGEM */}
          <img
            src="/img/vendedoras-prospectcrm.png"
            alt="Equipe ProspectCRM"
            className="h-full w-full object-cover"
          />

          {/* OVERLAY ESCURO */}
          <div className="absolute inset-0 bg-black/55" />

          {/* CONTEÚDO */}
          <div className="absolute inset-0 flex flex-col justify-between p-14">

            {/* LOGO */}
            <div>
              <img
                src="/img/logo-login.png"
                alt="ProspectCRM"
                className="h-24 object-contain"
              />
            </div>

            {/* TEXOS */}
            <div className="max-w-xl">
              <h1 className="mb-2 text-3xl font-extrabold leading-tight text-white">
                Transforme sua equipe de vendas com o ProspectCRM
              </h1>

              <p className="text-xl leading-relaxed text-gray-200">
                Controle leads, acompanhe negociações e aumente os resultados
                da sua empresa com uma plataforma moderna e inteligente.
              </p>
            </div>
          </div>
        </section>

        {/* LADO DIREITO */}
        <section className="flex items-center justify-center px-6 py-10">

          <div className="w-full max-w-md">

            {/* CARD */}
            <form
              onSubmit={handleLogin}
              className="rounded-3xl border border-white/10 bg-white/95 p-10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur"
            >

              {/* LOGO */}
              <img
                src="/img/logo-login.png"
                alt="ProspectCRM"
                className="mx-auto mb-8 h-20 object-contain"
              />

              {/* TITULO */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-[#002b4b]">
                  Bem-vindo
                </h2>

                <p className="mt-2 text-gray-500">
                  Acesse sua conta para continuar
                </p>
              </div>

              {/* EMAIL */}
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-gray-700"
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
                className="mb-5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition-all focus:border-[#086498] focus:ring-4 focus:ring-[#086498]/20"
                autoComplete="email"
              />

              {/* SENHA */}
              <label
                htmlFor="login-senha"
                className="mb-2 block text-sm font-semibold text-gray-700"
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
                className="mb-5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition-all focus:border-[#086498] focus:ring-4 focus:ring-[#086498]/20"
                autoComplete="current-password"
              />

              {/* ERRO */}
              {loginError && (
                <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {loginError}
                </p>
              )}

              {/* BOTÃO */}
              <button
                className="w-full rounded-xl bg-gradient-to-r from-[#086498] to-[#00a86b] py-3 text-lg font-semibold text-white shadow-lg transition-all hover:scale-[1.01] hover:opacity-95"
                type="submit"
              >
                Entrar no Sistema
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}