import React, { useState, useMemo } from 'react';
import { RecordItem } from '../types';
import RecordCard from './RecordCard';
import ConfirmationModal from './ConfirmationModal';
import RecordDetailModal from './RecordDetailModal';

interface InventoryProps {
  records: RecordItem[];
  onDelete: (id: number) => void;
  onExport: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ records, onDelete, onExport }) => {
  const [recordToDelete, setRecordToDelete] = useState<RecordItem | null>(null);
  const [recordToView, setRecordToView] = useState<RecordItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = 
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.artist.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [records, searchQuery]);


  const handleDeleteClick = (record: RecordItem) => {
    setRecordToDelete(record);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete.id);
      setRecordToDelete(null);
      if (recordToView?.id === recordToDelete.id) {
        setRecordToView(null);
      }
    }
  };
  
  const handleViewDetails = (record: RecordItem) => {
    setRecordToView(record);
  };

  return (
    <>
      <section className="bg-slate-800/30 p-6 rounded-lg border border-slate-700/50">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h2 className="text-3xl font-serif tracking-tight text-slate-200">Our Collection</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onExport}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 focus:ring-offset-slate-900 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search our collection..."
            className="flex-grow bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>

        {records.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredRecords.map((record, index) => (
              <RecordCard
                key={record.id}
                record={record}
                variant="inventory"
                onDelete={() => handleDeleteClick(record)}
                onViewDetails={() => handleViewDetails(record)}
                animationDelay={index * 50}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-lg animate-scale-in">
            <p className="text-slate-400">Our collection is empty.</p>
            <p className="text-sm text-slate-500">Add records from the wishlist to get started.</p>
          </div>
        )}
      </section>

      <ConfirmationModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Record"
      >
        Are you sure you want to delete <span className="font-bold text-white">{recordToDelete?.title}</span> from the collection? This action cannot be undone.
      </ConfirmationModal>

      <RecordDetailModal
        isOpen={!!recordToView}
        onClose={() => setRecordToView(null)}
        recordId={recordToView?.id || null}
        recordItem={recordToView}
        onDelete={() => recordToView && handleDeleteClick(recordToView)}
      />
    </>
  );
};

export default Inventory;