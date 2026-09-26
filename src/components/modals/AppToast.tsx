import React from 'react';
import { useUIStore } from '../../store/useUIStore';

export const AppToast: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div id="appToast" className="app-toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`app-toast toast-${toast.type} show`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="toast-text">{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
