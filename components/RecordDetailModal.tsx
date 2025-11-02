import React, { useState, useEffect } from 'react';
import { RecordDetail, RecordItem } from '../types';
import { getRecordDetails } from '../services/discogsService';

interface RecordDetailModalProps {
  recordId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToWishlist?: (record: RecordItem) => void;
  onDelete?: (recordId: number) => void;
  recordItem?: RecordItem | null;
}

const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>);
const DeleteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);

const RecordDetailModal: React.FC<RecordDetailModalProps> = ({ recordId, isOpen, onClose, onAddToWishlist, onDelete, recordItem }) => {
  const [details, setDetails] = useState<RecordDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (isOpen && recordId) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError(null);
        setDetails(null);
        try {
          const data = await getRecordDetails(recordId);
          setDetails(data);
        } catch (err) {
          setError('Could not load record details. Please try again later.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, recordId]);

  if (!isRendered) return null;

  const handleAction = (action?: (item: any) => void, item?: any) => {
    if (action && item) {
      action(item);
      onClose();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div><p className="mt-4 text-slate-400">Loading details...</p></div>;
    }
    if (error) {
      return <div className="text-center p-8 text-red-400">{error}</div>;
    }
    if (details) {
      const formatString = details.formats.map(f => `${f.name}${f.descriptions ? `, ${f.descriptions.join(', ')}` : ''}`).join(' | ');
      
      let audioChannel = '';
      for (const format of details.formats) {
        if (format.descriptions) {
            if (format.descriptions.includes('Stereo')) audioChannel = 'Stereo';
            if (format.descriptions.includes('Mono')) audioChannel = 'Mono';
            if (audioChannel) break;
        }
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <img src={details.cover_image} alt={details.title} className="w-full h-auto object-cover rounded-lg shadow-lg" />
            <div className="mt-4 space-y-4">
              <div className="space-y-2 text-sm border-t border-slate-700 pt-4">
                  <div className="flex justify-between"><span className="font-semibold text-slate-400 uppercase tracking-wider text-xs">Year</span> <span className="text-slate-200">{details.year}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-slate-400 uppercase tracking-wider text-xs">Country</span> <span className="text-slate-200">{details.country}</span></div>
                  {audioChannel && <div className="flex justify-between"><span className="font-semibold text-slate-400 uppercase tracking-wider text-xs">Audio</span> <span className="text-slate-200">{audioChannel}</span></div>}
              </div>
               <div className="bg-slate-700/50 p-3 rounded-md text-center">
                  <p className="font-semibold text-slate-300 uppercase tracking-wider text-xs">Lowest Available Price</p>
                  {details.priceSuggestion ? (
                      <p className="text-3xl font-bold text-gold-500 mt-1">
                          {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: details.priceSuggestion.currency }).format(details.priceSuggestion.value)}
                      </p>
                  ) : (
                      <p className="text-sm text-slate-400 italic mt-1">Not for sale on Discogs market.</p>
                  )}
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-slate-200 mb-3">Tracklist</h3>
            <ul className="space-y-2 text-sm max-h-80 overflow-y-auto pr-2">
              {details.tracklist.map((track, index) => (
                <li key={index} className="flex justify-between items-baseline border-b border-slate-700/50 pb-2">
                  <span className="text-slate-300"><span className="font-mono text-slate-500 mr-3">{track.position}</span>{track.title}</span>
                  <span className="text-slate-500 font-mono">{track.duration}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    return null;
  };

  const backdropAnimation = isOpen ? 'animate-fade-in' : 'animate-fade-out';
  const modalAnimation = isOpen ? 'animate-scale-in' : 'animate-scale-out';

  return (
    <div className={`fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex justify-center items-center z-40 p-4 ${backdropAnimation}`} onClick={onClose}>
      <div 
        className={`bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl border border-slate-700 relative max-h-[90vh] flex flex-col ${modalAnimation}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-slate-700 flex justify-between items-start flex-shrink-0">
            <div>
                <h2 className="text-3xl font-serif text-white">{details?.title || recordItem?.title || 'Loading...'}</h2>
                <p className="text-md text-slate-400">{details?.artist || recordItem?.artist || ''}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close modal"><CloseIcon /></button>
        </header>
        <main className="p-6 overflow-y-auto">
            {renderContent()}
        </main>
        {(onAddToWishlist || onDelete) && (
            <footer className="p-4 border-t border-slate-700 flex justify-end flex-shrink-0">
                {onAddToWishlist && recordItem && <button onClick={() => handleAction(onAddToWishlist, recordItem)} className="flex items-center justify-center px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"><PlusIcon /> Add to Wishlist</button>}
                {onDelete && recordId && <button onClick={() => handleAction(onDelete, recordId)} className="flex items-center justify-center px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"><DeleteIcon /> Delete from Collection</button>}
            </footer>
        )}
      </div>
    </div>
  );
};

export default RecordDetailModal;