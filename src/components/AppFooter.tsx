import React from 'react';

const AppFooter: React.FC = () => {
  return (
    <footer className="w-full text-center py-4 text-sm text-slate-500">
      <p>&copy; {new Date().getFullYear()} Konrad Bielak</p>
    </footer>
  );
};

export default AppFooter;
