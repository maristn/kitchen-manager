import { X } from 'lucide-react';
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-all duration-300"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`inline-block align-bottom bg-white/95 backdrop-blur-2xl rounded-3xl text-left overflow-hidden shadow-soft-lg transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]} animate-in zoom-in-95 slide-in-from-bottom-4 duration-300`}>
          {/* Header */}
          <div className="bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm px-7 py-5 border-b border-gray-200/50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-xl p-2 transition-all duration-200 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="bg-white/50 backdrop-blur-sm px-7 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
