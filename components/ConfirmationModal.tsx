import React, { useState, useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      setTimeout(() => {
        setIsRendered(false);
      }, 300); // Match animation duration
    }
  }, [isOpen]);

  if (!isRendered) {
    return null;
  }

  const backdropAnimation = isOpen ? 'animate-fade-in' : 'animate-fade-out';
  const modalAnimation = isOpen ? 'animate-scale-in' : 'animate-scale-out';

  return (
    <div className={`fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex justify-center items-center z-50 ${backdropAnimation}`} aria-modal="true" role="dialog" onClick={onClose}>
      <div className={`bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-slate-700 ${modalAnimation}`} onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-serif text-white mb-4">{title}</h2>
        <div className="text-slate-300 mb-6">{children}</div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-600 rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 focus:ring-offset-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-800 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;