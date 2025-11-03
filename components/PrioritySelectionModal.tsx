import React, { useState, useEffect } from 'react';
import { RecordItem, Priority } from '../types';

interface PrioritySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (priority: Priority) => void;
  record: RecordItem | null;
}

const PrioritySelectionModal: React.FC<PrioritySelectionModalProps> = ({ isOpen, onClose, onConfirm, record }) => {
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setTimeout(() => {
        setIsRendered(false);
      }, 300); // Match animation duration
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isRendered || !record) {
    return null;
  }

  const handlePrioritySelect = (priority: Priority) => {
    onConfirm(priority);
  };

  const backdropAnimation = isOpen ? 'animate-fade-in' : 'animate-fade-out';
  const modalAnimation = isOpen ? 'animate-scale-in' : 'animate-scale-out';

  return (
    <div
      className={`fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 p-4 overflow-y-auto ${backdropAnimation}`}
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div className="flex items-center justify-center min-h-full">
        <div
          className={`bg-slate-800 rounded-lg shadow-xl w-full max-w-sm m-auto border border-slate-700 ${modalAnimation}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-2xl font-serif text-white mb-2">Set Wishlist Priority</h2>
            <p className="text-slate-400 mb-4">How badly do you want this record?</p>
            
            <div className="flex items-center gap-4 bg-slate-700/50 p-3 rounded-md mb-6">
              <img src={record.cover_image} alt={`${record.artist} - ${record.title}`} className="w-16 h-16 object-cover rounded flex-shrink-0" />
              <div className="truncate">
                <p className="font-semibold text-white truncate">{record.title}</p>
                <p className="text-sm text-slate-400 truncate">{record.artist}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handlePrioritySelect('High')}
                className="px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-800 transition-all transform hover:scale-105"
              >
                High
              </button>
              <button
                onClick={() => handlePrioritySelect('Medium')}
                className="px-4 py-3 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-slate-800 transition-all transform hover:scale-105"
              >
                Medium
              </button>
              <button
                onClick={() => handlePrioritySelect('Low')}
                className="px-4 py-3 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800 transition-all transform hover:scale-105"
              >
                Low
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-4 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrioritySelectionModal;
