import { useMemo, useState } from 'react';

export function useFeedback() {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [promptDialog, setPromptDialog] = useState(null);

  function notify({ type = 'info', title, message }) {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4200);
  }

  function closeToast(id) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  function askConfirm(options) {
    return new Promise((resolve) => {
      setConfirmDialog({ ...options, resolve });
    });
  }

  function askPrompt(options) {
    return new Promise((resolve) => {
      setPromptDialog({ ...options, value: '', resolve });
    });
  }

  const ui = useMemo(() => ({
    notify,
    confirm: askConfirm,
    prompt: askPrompt
  }), []);

  return {
    ui,
    toasts,
    closeToast,
    confirmDialog,
    setConfirmDialog,
    promptDialog,
    setPromptDialog
  };
}
