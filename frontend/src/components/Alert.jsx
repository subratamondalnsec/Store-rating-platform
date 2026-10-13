import React from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const typeConfig = {
    success: {
      bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
    },
    error: {
      bgColor: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
    },
    warning: {
      bgColor: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
    },
    info: {
      bgColor: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-500 shrink-0" />
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      className={`flex items-start justify-between p-4 rounded-lg border text-sm shadow-sm ${config.bgColor} ${className}`}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        {config.icon}
        <div className="font-medium">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="ml-3 inline-flex text-slate-400 hover:text-slate-700 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
