import React from 'react';
import { useAppContext } from '../AppContext';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useAppContext();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : toast.type === 'warning'
              ? 'bg-amber-900 text-white border-amber-800'
              : 'bg-indigo-950 text-white border-indigo-900'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle className="text-emerald-400" size={18} />}
            {toast.type === 'warning' && <AlertTriangle className="text-amber-400" size={18} />}
            {toast.type === 'info' && <Info className="text-cyan-400" size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-xs tracking-wide">{toast.title}</h5>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
