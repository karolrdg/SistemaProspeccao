import { KeyRound, ShieldCheck, Trash2, UserCheck, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { alterarSenhaApi, apagarUsuarioApi, cadastrarUsuarioApi, listarUsuarios } from '../api/usuariosApi';
import { parseResponse } from '../api/http';
import { Field } from '../components/Field';
import { IconButton } from '../components/IconButton';
import { EmptyRow, Th } from '../components/Table';

export function UsuariosPage({ session, logout, ui }) {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', nivel: 'Usuario' });
  const [message, setMessage] = useState('');

  async function loadUsuarios() {
    const res = await listarUsuarios(session.token);
    if (res.status === 401) {
      ui.notify({ type: 'warning', title: 'Sessao expirada', message: 'Entre novamente para continuar.' });
      logout();
      return;
    }
    const data = await parseResponse(res);
    if (!res.ok) {
      setMessage(data.erro || 'Erro ao listar usuarios.');
      ui.notify({ type: 'error', title: 'Erro ao listar', message: data.erro || 'Nao foi possivel carregar usuarios.' });
      return;
    }
    setUsuarios(data);
  }

  useEffect(() => {
    loadUsuarios();
  }, []);

  async function cadastrarUsuario(event) {
    event.preventDefault();
    const res = await cadastrarUsuarioApi(form, session.token);
    const data = await parseResponse(res);
    if (!res.ok) {
      setMessage(data.erro || 'Erro ao cadastrar usuario.');
      ui.notify({ type: 'error', title: 'Cadastro nao concluido', message: data.erro || 'Revise os dados e tente novamente.' });
      return;
    }
    setMessage(data.mensagem || 'Usuario cadastrado com sucesso!');
    ui.notify({ type: 'success', title: 'Usuario cadastrado', message: `${form.nome} foi adicionado ao sistema.` });
    setForm({ nome: '', email: '', senha: '', nivel: 'Usuario' });
    loadUsuarios();
  }

  async function alterarSenha(user) {
    const nome = user.nome || user.Nome;
    const novaSenha = await ui.prompt({
      title: 'Alterar senha',
      message: `Informe a nova senha para ${nome}.`,
      label: 'Nova senha',
      type: 'password',
      confirmLabel: 'Atualizar senha'
    });
    if (!novaSenha) return;
    const id = user.id || user.Id;
    const res = await alterarSenhaApi(id, novaSenha, session.token);
    const data = await parseResponse(res);
    if (!res.ok) {
      ui.notify({ type: 'error', title: 'Senha nao alterada', message: data.erro || 'Nao foi possivel atualizar a senha.' });
      return;
    }
    ui.notify({ type: 'success', title: 'Senha alterada', message: `A senha de ${nome} foi atualizada.` });
  }

  async function apagarUsuario(user) {
    const nome = user.nome || user.Nome;
    const confirmed = await ui.confirm({
      tone: 'danger',
      title: 'Remover colaborador?',
      message: `${nome} sera removido do sistema. Essa acao nao pode ser desfeita.`,
      confirmLabel: 'Remover'
    });
    if (!confirmed) return;
    const id = user.id || user.Id;
    const res = await apagarUsuarioApi(id, session.token);
    const data = await parseResponse(res);
    if (!res.ok) {
      ui.notify({ type: 'error', title: 'Erro ao remover', message: data.erro || 'Nao foi possivel remover usuario.' });
      return;
    }
    ui.notify({ type: 'success', title: 'Colaborador removido', message: `${nome} saiu da lista de usuarios.` });
    loadUsuarios();
  }

  return (
    <section className="mx-auto max-w-[1680px]">
      <div className="mb-7 flex items-start gap-4">
        <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 sm:flex"><UsersRound size={24} /></div>
        <div>
          <p className="section-kicker mb-1">Workspace <span className="px-1 text-slate-300">/</span> Administração</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-[34px]">Colaboradores</h1>
          <p className="mt-1.5 text-sm text-slate-500">Gerencie acessos e mantenha sua equipe comercial atualizada.</p>
        </div>
      </div>
      {message && <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">{message}</div>}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,380px)_1fr]">
        <form onSubmit={cadastrarUsuario} className="surface-card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><UserCheck size={18} /></div>
            <div><h2 className="font-semibold text-slate-900">Novo colaborador</h2><p className="mt-0.5 text-xs text-slate-500">Crie um acesso para sua equipe.</p></div>
          </div>
          <Field label="Nome"><input className="input" value={form.nome} onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))} required /></Field>
          <Field label="E-mail"><input type="email" className="input" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required /></Field>
          <Field label="Senha"><input type="password" className="input" value={form.senha} onChange={(e) => setForm((prev) => ({ ...prev, senha: e.target.value }))} required /></Field>
          <Field label="Nivel">
            <select className="input" value={form.nivel} onChange={(e) => setForm((prev) => ({ ...prev, nivel: e.target.value }))}>
              <option value="Usuario">Vendedor</option>
              <option value="Admin">Administrador</option>
            </select>
          </Field>
          <button className="btn-primary mt-4 w-full" type="submit"><UserCheck size={16} />Criar colaborador</button>
        </form>
        <div className="surface-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
            <div><h2 className="font-semibold text-slate-900">Equipe cadastrada</h2><p className="mt-1 text-xs text-slate-500">{usuarios.length} colaboradores</p></div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><ShieldCheck size={18} /></span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr><Th>Nome</Th><Th>E-mail</Th><Th>Nivel</Th><Th center>Acoes</Th></tr>
              </thead>
              <tbody>
                {usuarios.map((user) => (
                  <tr key={user.id || user.Id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold">{user.nome || user.Nome}</td>
                    <td className="px-4 py-3">{user.email || user.Email}</td>
                    <td className="px-4 py-3"><span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{user.nivel || user.Nivel}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <IconButton title="Alterar senha" className="bg-sky-700 hover:bg-sky-800" onClick={() => alterarSenha(user)}><KeyRound size={16} /></IconButton>
                        <IconButton title="Apagar usuario" className="bg-red-600 hover:bg-red-700" onClick={() => apagarUsuario(user)}><Trash2 size={16} /></IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && <EmptyRow text="Nenhum usuario carregado." colSpan={4} />}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
