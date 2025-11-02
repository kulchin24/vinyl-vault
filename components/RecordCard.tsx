import React from 'react';
import { RecordItem } from '../types';

interface RecordCardProps {
  record: RecordItem;
  variant: 'inventory' | 'wishlist';
  onDelete?: () => void;
  onMove?: () => void;
  onViewDetails?: () => void;
  animationDelay?: number;
}

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const RecordCard: React.FC<RecordCardProps> = ({ record, variant, onDelete, onMove, onViewDetails, animationDelay = 0 }) => {
  const handleActionClick = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    action?.();
  };
  
  return (
    <div
      className="group relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl hover:shadow-gold-500/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500 animate-scale-in"
      style={{ animationDelay: `${animationDelay}ms`, opacity: 0 }}
      onClick={onViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onViewDetails?.()}
      aria-label={`View details for ${record.title} by ${record.artist}`}
    >
      <img
        src={record.cover_image}
        alt={`${record.artist} - ${record.title}`}
        className="aspect-square w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <h3 className="font-bold text-white text-base leading-tight drop-shadow-md">{record.title}</h3>
        <p className="text-sm text-slate-300 drop-shadow-md">{record.artist}</p>
        <p className="text-xs text-slate-400 drop-shadow-md">{record.year}</p>
      </div>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        {variant === 'inventory' && onDelete && (
          <button 
            onClick={(e) => handleActionClick(e, onDelete)} 
            className="flex items-center justify-center w-10 h-10 bg-red-600/80 text-white rounded-full backdrop-blur-sm hover:bg-red-500 transition-colors"
            aria-label="Delete record"
          >
            <DeleteIcon />
          </button>
        )}
        {variant === 'wishlist' && onMove && (
          <button 
            onClick={(e) => handleActionClick(e, onMove)} 
            className="flex items-center justify-center w-10 h-10 bg-green-600/80 text-white rounded-full backdrop-blur-sm hover:bg-green-500 transition-colors"
            aria-label="Move to collection"
          >
            <CheckIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default RecordCard;