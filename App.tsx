import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Inventory from './components/Inventory';
import Wishlist from './components/Wishlist';
import { RecordItem } from './types';
import { generateCsvContent, downloadCsv } from './services/csvService';
import { getInventory, getWishlist, postData } from './services/googleSheetsService';

const App: React.FC = () => {
  const [inventoryRecords, setInventoryRecords] = useState<RecordItem[]>([]);
  const [wishlistRecords, setWishlistRecords] = useState<RecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [inventoryData, wishlistData] = await Promise.all([
        getInventory(),
        getWishlist(),
      ]);
      setInventoryRecords(inventoryData.sort((a, b) => a.artist.localeCompare(b.artist)));
      setWishlistRecords(wishlistData.sort((a, b) => a.artist.localeCompare(b.artist)));
    } catch (err) {
      console.error("Failed to fetch data from Google Sheets:", err);
      setError("Could not connect to the Vinyl Vault database. Please check the Google Sheet setup and refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteFromInventory = async (id: number) => {
    const originalInventory = [...inventoryRecords];
    const recordToDelete = originalInventory.find(r => r.id === id);
    if (!recordToDelete) return;

    // Optimistic update
    setInventoryRecords(prev => prev.filter(record => record.id !== id));

    try {
      await postData({ action: 'DELETE_FROM_INVENTORY', payload: { id } });
    } catch (err) {
      console.error("Failed to delete from inventory:", err);
      // Revert on failure
      setInventoryRecords(originalInventory);
      alert("Failed to delete record. Please try again.");
    }
  };

  const handleAddToWishlist = async (record: RecordItem) => {
    if (wishlistRecords.some(r => r.id === record.id) || inventoryRecords.some(r => r.id === record.id)) {
      return;
    }
    const originalWishlist = [...wishlistRecords];
    // Optimistic update
    setWishlistRecords(prev => [record, ...prev].sort((a, b) => a.artist.localeCompare(b.artist)));

    try {
      await postData({ action: 'ADD_TO_WISHLIST', payload: record });
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
      setWishlistRecords(originalWishlist);
      alert("Failed to add record to wishlist. Please try again.");
    }
  };
  
  const handleMoveToInventory = async (record: RecordItem) => {
    const originalWishlist = [...wishlistRecords];
    const originalInventory = [...inventoryRecords];

    // Optimistic update
    setWishlistRecords(prev => prev.filter(r => r.id !== record.id));
    setInventoryRecords(prev => [record, ...prev].sort((a, b) => a.artist.localeCompare(b.artist)));

    try {
        await postData({ action: 'MOVE_TO_INVENTORY', payload: record });
    } catch (err) {
        console.error("Failed to move to inventory:", err);
        // Revert on failure
        setWishlistRecords(originalWishlist);
        setInventoryRecords(originalInventory);
        alert("Failed to move record to inventory. Please try again.");
    }
  };

  const handleExportInventory = () => {
    const csvContent = generateCsvContent(inventoryRecords);
    downloadCsv(csvContent, 'vinyl-inventory.csv');
  };

  const handleExportWishlist = () => {
    const csvContent = generateCsvContent(wishlistRecords);
    downloadCsv(csvContent, 'vinyl-wishlist.csv');
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-square bg-slate-800 rounded-lg animate-pulse"></div>
        ))}
    </div>
  );

  return (
    <div className="bg-slate-900 min-h-screen text-white animate-fade-in">
      <Header />
      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 animate-slide-in-down" style={{ animationDelay: '100ms' }}>
          {isLoading ? (
            <section className="bg-slate-800/30 p-6 rounded-lg border border-slate-700/50">
              <div className="h-9 w-48 bg-slate-700 rounded-md mb-6 animate-pulse"></div>
              {renderSkeleton()}
            </section>
          ) : error ? (
            <div className="text-center py-10 border-2 border-dashed border-red-500/50 bg-red-500/10 rounded-lg animate-scale-in">
                <p className="text-red-400 font-semibold">Error</p>
                <p className="text-slate-400 mt-2">{error}</p>
            </div>
          ) : (
            <Inventory 
                records={inventoryRecords} 
                onDelete={handleDeleteFromInventory}
                onExport={handleExportInventory}
            />
          )}
        </div>
        <div className="animate-slide-in-down" style={{ animationDelay: '200ms' }}>
          {isLoading ? (
             <section className="bg-slate-800/30 p-6 rounded-lg border border-slate-700/50">
              <div className="h-9 w-48 bg-slate-700 rounded-md mb-6 animate-pulse"></div>
              <div className="h-10 w-full bg-slate-700 rounded-md mb-6 animate-pulse"></div>
              <div className="aspect-square bg-slate-800 rounded-lg animate-pulse"></div>
            </section>
          ) : error ? null : (
            <Wishlist 
                records={wishlistRecords}
                inventoryRecords={inventoryRecords}
                onMove={handleMoveToInventory}
                onAddToWishlist={handleAddToWishlist}
                onExport={handleExportWishlist}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;