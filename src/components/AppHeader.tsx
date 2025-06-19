import React from 'react';

const AppHeader: React.FC = () => {
  return (
    <header className="bg-sky-700 text-white p-4 shadow-md w-full sticky top-0 z-50">
      <h1 className="text-xl sm:text-2xl font-bold text-center">
        Board Game Timer
      </h1>
    </header>
  );
};

export default AppHeader;