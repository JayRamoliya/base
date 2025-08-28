
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substring(2);
    const newToast = { id, ...toast };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, type = 'success' }) => {
      return addToast({ title, description, type });
    },
    [addToast]
  );

  const success = useCallback((title, description) => toast({ title, description, type: 'success' }), [toast]);
  const error = useCallback((title, description) => toast({ title, description, type: 'error' }), [toast]);
  const warning = useCallback((title, description) => toast({ title, description, type: 'warning' }), [toast]);
  const info = useCallback((title, description) => toast({ title, description, type: 'info' }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const { type, title, description } = toast;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-white border-l-4 border-l-green-500 shadow-lg';
      case 'error':
        return 'bg-white border-l-4 border-l-red-500 shadow-lg';
      case 'warning':
        return 'bg-white border-l-4 border-l-yellow-500 shadow-lg';
      case 'info':
        return 'bg-white border-l-4 border-l-blue-500 shadow-lg';
      default:
        return 'bg-white border-l-4 border-l-purple-500 shadow-lg';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className={`${getToastStyles()} rounded-lg p-4 min-w-80 animate-in slide-in-from-right`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export {
  ToastContainer,
  Toast,
}
