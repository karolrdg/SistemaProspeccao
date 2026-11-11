import { useState } from 'react';
import { ConfirmDialog, PromptDialog, ToastViewport } from './components/Feedback';
import { Sidebar } from './components/Sidebar';
import { useFeedback } from './hooks/useFeedback';
import { useSession } from './hooks/useSession';
import { LoginPage } from './pages/LoginPage';
import { ProspeccaoPage } from './pages/ProspeccaoPage';
import { UsuariosPage } from './pages/UsuariosPage';

function App() {
  const [activeSection, setActiveSection] = useState('prospeccao');
  const { session, isLogged, saveSession, clearSession } = useSession();
  const {
    ui,
    toasts,
    closeToast,
    confirmDialog,
    setConfirmDialog,
    promptDialog,
    setPromptDialog
  } = useFeedback();

  function logout() {
    clearSession();
    setActiveSection('prospeccao');
  }

  if (!isLogged) {
    return (
      <>
        <LoginPage onLogin={saveSession} />
        <ToastViewport toasts={toasts} onClose={closeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gso-surface text-slate-800">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        nome={session.nome}
        nivel={session.nivel}
        logout={logout}
      />
      <main className="ml-[68px] min-h-screen px-4 py-6 transition-all duration-300 sm:ml-[76px] sm:px-6 md:py-8 xl:px-10">
        {activeSection === 'usuarios' && session.nivel === 'Admin' ? (
          <UsuariosPage session={session} logout={logout} ui={ui} />
        ) : (
          <ProspeccaoPage session={session} logout={logout} ui={ui} />
        )}
      </main>

      <ToastViewport toasts={toasts} onClose={closeToast} />
      {confirmDialog && (
        <ConfirmDialog
          dialog={confirmDialog}
          onClose={(result) => {
            confirmDialog.resolve(result);
            setConfirmDialog(null);
          }}
        />
      )}
      {promptDialog && (
        <PromptDialog
          dialog={promptDialog}
          onClose={(value) => {
            promptDialog.resolve(value);
            setPromptDialog(null);
          }}
          onChange={(value) => setPromptDialog((prev) => ({ ...prev, value }))}
        />
      )}
    </div>
  );
}

export default App;
