import { useState } from 'react';

function readSession() {
  return {
    token: localStorage.getItem('token') || '',
    nome: localStorage.getItem('nome') || '',
    nivel: localStorage.getItem('nivel') || 'Usuario'
  };
}

export function useSession() {
  const [session, setSession] = useState(readSession);

  function saveSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('nome', data.nome || '');
    localStorage.setItem('nivel', data.nivel || 'Usuario');
    setSession(readSession());
  }

  function clearSession() {
    localStorage.clear();
    setSession(readSession());
  }

  return {
    session,
    isLogged: Boolean(session.token),
    saveSession,
    clearSession
  };
}
