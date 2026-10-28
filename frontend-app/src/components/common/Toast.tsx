import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useAuth();

  if (!toastMessage) return null;

  const isError = toastMessage.isError;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md max-w-md ${
          isError
            ? 'bg-rose-900/90 border-rose-700 text-white'
            : 'bg-slate-900/90 border-slate-700 text-white'
        }`}
      >
        {isError ? (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        )}
        <span className="text-sm font-semibold">{toastMessage.text}</span>
      </div>
    </div>
  );
};
