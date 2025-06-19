import React from 'react';

const AppFooter: React.FC = () => {
  return (
    <footer className="w-full text-center py-4 text-sm text-slate-500">
      <p>&copy; {new Date().getFullYear()} Board Game Timer App</p>
    </footer>
  );
};

export default AppFooter;
