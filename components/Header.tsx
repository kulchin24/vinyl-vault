import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 px-4 md:px-8 border-b border-slate-700/50 animate-slide-in-down">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-amber-200 font-serif">
          Vinyl Vault
        </h1>
      </div>
    </header>
  );
};

export default Header;
