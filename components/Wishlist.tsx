import React, { useState, useMemo } from 'react';
import { RecordItem, Priority } from '../types';
import RecordCard from './RecordCard';
import { searchRecords } from '../services/discogsService';
import RecordDetailModal from './RecordDetailModal';
import PrioritySelectionModal from './PrioritySelectionModal';

interface WishlistProps {
  records: RecordItem[];
  inventoryRecords: RecordItem[];
  onMove: (record: RecordItem) => void;
  onAddToWishlist: (record: RecordItem, priority: Priority) => void;
  onUpdatePriority: (id: number, priority: Priority) => void;
  onDeleteFromWishlist: (id: number) => void;
  onExport: () => void;
}

const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>);
const AddedIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>);
const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>);


const Wishlist: React.FC<WishlistProps> = ({ records, inventoryRecords, onMove, onAddToWishlist, onUpdatePriority, onDeleteFromWishlist, onExport }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RecordItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recordToView, setRecordToView] = useState<RecordItem | null>(null);
  const [recordToAdd, setRecordToAdd] = useState<RecordItem | null>(null);
  const [recordToUpdatePriority, setRecordToUpdatePriority] = useState<RecordItem | null>(null);

  const [openSections, setOpenSections] = useState({ High: true, Medium: true, Low: true });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const results = await searchRecords(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRecordToAdd = (record: RecordItem) => {
    setRecordToAdd(record);
  };

  const handleConfirmAddToWishlist = (priority: Priority) => {
    if (recordToAdd) {
      onAddToWishlist(recordToAdd, priority);
      setRecordToAdd(null);
    }
  };

  const handleConfirmUpdatePriority = (priority: Priority) => {
    if (recordToUpdatePriority) {
        onUpdatePriority(recordToUpdatePriority.id, priority);
        setRecordToUpdatePriority(null);
    }
  };

  const handleOpenPriorityEditor = (record: RecordItem) => {
    setRecordToUpdatePriority(record);
  };

  const groupedRecords = useMemo(() => {
    const groups: { [key in Priority]: RecordItem[] } = { High: [], Medium: [], Low: [] };
    records.forEach(record => {
      const priority = record.priority || 'Medium';
      groups[priority].push(record);
    });
    return groups;
  }, [records]);

  const toggleSection = (section: Priority) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderPrioritySection = (priority: Priority, sectionRecords: RecordItem[]) => {
    if (sectionRecords.length === 0) return null;
    const isOpen = openSections[priority];

    const priorityClasses = {
      High: { border: 'border-red-500/50', text: 'text-red-400' },
      Medium: { border: 'border-yellow-500/50', text: 'text-yellow-400' },
      Low: { border: 'border-sky-500/50', text: 'text-sky-400' },
    };
    
    return (
      <div key={priority} className="mb-6">
        <button 
          onClick={() => toggleSection(priority)}
          className={`w-full flex justify-between items-center p-3 rounded-md bg-slate-700/50 border-l-4 ${priorityClasses[priority].border} transition-colors hover:bg-slate-700`}
          aria-expanded={isOpen}
        >
          <h3 className={`text-xl font-semibold tracking-wide ${priorityClasses[priority].text}`}>{priority} Priority</h3>
          <ChevronDownIcon isOpen={isOpen} />
        </button>
        {isOpen && (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4 animate-fade-in">
            {sectionRecords.map((record, index) => (
              <RecordCard
                key={record.id}
                record={record}
                variant="wishlist"
                onMove={() => onMove(record)}
                onViewDetails={() => setRecordToView(record)}
                onDelete={() => onDeleteFromWishlist(record.id)}
                onEditPriority={() => handleOpenPriorityEditor(record)}
                animationDelay={index * 50}
              />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <>
      <section className="bg-slate-800/30 p-6 rounded-lg border border-slate-700/50">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-3xl font-serif tracking-tight text-slate-200">Wishlist</h2>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Discogs to add to your wishlist..."
            className="flex-grow bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
          <button type="submit" className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-slate-900 bg-gold-500 rounded-md hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 focus:ring-offset-slate-900 transition-colors" disabled={isSearching}>
            <SearchIcon />
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {isSearching && <div className="text-center py-4">Searching Discogs...</div>}

        {searchResults.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-slate-300">Search Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {searchResults.map(record => {
                const isInWishlist = records.some(r => r.id === record.id);
                const isInInventory = inventoryRecords.some(r => r.id === record.id);
                const isAdded = isInWishlist || isInInventory;
                return (
                  <div 
                    key={record.id} 
                    className="relative group animate-scale-in cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500 rounded-lg"
                    onClick={() => setRecordToView(record)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setRecordToView(record)}
                    aria-label={`View details for ${record.title} by ${record.artist}`}
                  >
                    <img src={record.cover_image} alt={`${record.artist} - ${record.title}`} className="aspect-square w-full object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 text-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                       <h4 className="font-bold text-white text-base leading-tight drop-shadow-md">{record.title}</h4>
                       <p className="text-sm text-slate-300 drop-shadow-md mb-3">{record.artist}</p>
                       <button
                         onClick={(e) => {
                           e.stopPropagation(); // Stop the click from opening the details modal
                           if (!isAdded) {
                             handleSelectRecordToAdd(record);
                           }
                         }}
                         className={`flex items-center justify-center h-10 px-4 rounded-full text-sm font-semibold transition-colors w-full ${isAdded ? 'bg-slate-600 text-slate-300 cursor-not-allowed' : 'bg-gold-500 text-slate-900 hover:bg-gold-600'}`}
                         disabled={isAdded}
                         aria-label={isAdded ? (isInInventory ? 'In your collection' : 'On your wishlist') : `Add ${record.title} to wishlist`}
                       >
                         {isInInventory ? <><AddedIcon/> In Collection</> : isInWishlist ? <><AddedIcon/> On Wishlist</> : <><PlusIcon/> Add</>}
                       </button>
                     </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {records.length > 0 ? (
          <div>
            {renderPrioritySection('High', groupedRecords.High)}
            {renderPrioritySection('Medium', groupedRecords.Medium)}
            {renderPrioritySection('Low', groupedRecords.Low)}
          </div>
        ) : !isSearching && searchResults.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-lg animate-scale-in">
            <p className="text-slate-400">Your wishlist is empty.</p>
            <p className="text-sm text-slate-500">Use the search bar above to find records.</p>
          </div>
        ) : null}
      </section>

      <RecordDetailModal
        isOpen={!!recordToView}
        onClose={() => setRecordToView(null)}
        recordId={recordToView?.id || null}
        recordItem={recordToView}
        onMove={onMove}
        isInWishlist={records.some(r => r.id === recordToView?.id)}
        onUpdatePriority={onUpdatePriority}
        onAddToWishlist={() => recordToView && handleSelectRecordToAdd(recordToView)}
      />
      
      <PrioritySelectionModal
        isOpen={!!recordToAdd}
        onClose={() => setRecordToAdd(null)}
        onConfirm={handleConfirmAddToWishlist}
        record={recordToAdd}
      />
      <PrioritySelectionModal
        isOpen={!!recordToUpdatePriority}
        onClose={() => setRecordToUpdatePriority(null)}
        onConfirm={handleConfirmUpdatePriority}
        record={recordToUpdatePriority}
      />
    </>
  );
};

export default Wishlist;
