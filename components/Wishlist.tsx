import React, { useState } from 'react';
import { RecordItem } from '../types';
import RecordCard from './RecordCard';
import { searchRecords } from '../services/discogsService';
import RecordDetailModal from './RecordDetailModal';

interface WishlistProps {
  records: RecordItem[];
  inventoryRecords: RecordItem[];
  onMove: (record: RecordItem) => void;
  onAddToWishlist: (record: RecordItem) => void;
  onExport: () => void;
}

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const AddedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


const Wishlist: React.FC<WishlistProps> = ({ records, inventoryRecords, onMove, onAddToWishlist, onExport }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordToView, setRecordToView] = useState<RecordItem | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const data = await searchRecords(query);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const isInCollection = (recordId: number) => {
    return records.some(item => item.id === recordId) || inventoryRecords.some(item => item.id === recordId);
  }

  const handleViewDetails = (record: RecordItem) => {
    setRecordToView(record);
  };

  const handleAddToWishlistAndClearSearch = (record: RecordItem) => {
    if (isInCollection(record.id)) {
      return; // Do nothing if already in collection or wishlist
    }
    onAddToWishlist(record);
    setResults([]);
    setQuery('');
  };

  return (
    <>
      <section className="bg-slate-800/30 p-6 rounded-lg border border-slate-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-serif tracking-tight text-slate-200">Our Wishlist</h2>
          <button
            onClick={onExport}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 focus:ring-offset-slate-900 transition-colors"
          >
            Export CSV
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a record..."
            className="flex-grow bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
          <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 w-28 px-4 py-2 font-medium text-slate-900 bg-gold-500 rounded-md hover:bg-gold-600 disabled:bg-gold-700/50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 focus:ring-offset-slate-900 transition-colors">
            {isLoading ? '...' : <><SearchIcon/> Search</>}
          </button>
        </form>
        
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        
        {results.length > 0 && (
          <div className="mb-6 animate-fade-in">
              <h3 className="text-lg font-medium text-slate-300 mb-3">Search Results</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {results.map((res, index) => {
                      const isAdded = isInCollection(res.id);
                      return (
                          <div 
                              key={res.id} 
                              className="flex items-center justify-between bg-slate-700/50 p-3 rounded-md cursor-pointer hover:bg-slate-700 transition-colors animate-slide-in-down"
                              style={{ animationDelay: `${index * 50}ms` }}
                              onClick={() => handleViewDetails(res)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleViewDetails(res)}
                          >
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <img src={res.cover_image} alt={`${res.artist} - ${res.title}`} className="w-12 h-12 object-cover rounded flex-shrink-0" />
                                  <div className="truncate">
                                      <p className="font-semibold text-white truncate">{res.title}</p>
                                      <p className="text-sm text-slate-400 truncate">{res.artist}</p>
                                  </div>
                              </div>
                              <button 
                                  onClick={(e) => { e.stopPropagation(); handleAddToWishlistAndClearSearch(res); }}
                                  disabled={isAdded}
                                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 w-24 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed flex-shrink-0"
                                  aria-label={`Add ${res.title} to wishlist`}
                              >
                                  {isAdded ? <><AddedIcon /> Added</> : <><PlusIcon /> Add</>}
                              </button>
                          </div>
                      );
                  })}
              </div>
          </div>
        )}

        {results.length > 0 && <hr className="border-slate-700 my-6"/>}

        {records.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {records.map((record, index) => (
              <RecordCard
                key={record.id}
                record={record}
                variant="wishlist"
                onMove={() => onMove(record)}
                onViewDetails={() => handleViewDetails(record)}
                animationDelay={index * 50}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-lg animate-scale-in">
            <p className="text-slate-400">Our wishlist is empty.</p>
            <p className="text-sm text-slate-500">Use the search bar above to add records.</p>
          </div>
        )}
      </section>

      <RecordDetailModal
        isOpen={!!recordToView}
        onClose={() => setRecordToView(null)}
        recordId={recordToView?.id || null}
        recordItem={recordToView}
        onAddToWishlist={handleAddToWishlistAndClearSearch}
      />
    </>
  );
};

export default Wishlist;