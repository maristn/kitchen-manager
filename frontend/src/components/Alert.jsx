import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  const types = {
    success: {
      icon: CheckCircle,
      classes: 'bg-green-50/80 border-green-200/50 text-green-800 shadow-soft',
      iconColor: 'text-green-500',
    },
    error: {
      icon: XCircle,
      classes: 'bg-red-50/80 border-red-200/50 text-red-800 shadow-soft',
      iconColor: 'text-red-500',
    },
    warning: {
      icon: AlertCircle,
      classes: 'bg-yellow-50/80 border-yellow-200/50 text-yellow-800 shadow-soft',
      iconColor: 'text-yellow-500',
    },
    info: {
      icon: Info,
      classes: 'bg-blue-50/80 border-blue-200/50 text-blue-800 shadow-soft',
      iconColor: 'text-blue-500',
    },
  };
  
  const { icon: Icon, classes, iconColor } = types[type];
  
  return (
    <div className={`rounded-2xl backdrop-blur-xl border p-5 ${classes} flex items-start space-x-4 animate-in slide-in-from-top-2 fade-in duration-300`}>
      <div className={`${iconColor} flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-black/5 rounded-lg p-1.5 transition-all duration-200 active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
