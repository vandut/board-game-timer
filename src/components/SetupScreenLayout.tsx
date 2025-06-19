import React from 'react';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

interface SetupScreenLayoutProps {
  children: React.ReactNode;
}

const SetupScreenLayout: React.FC<SetupScreenLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 to-sky-100">
      <AppHeader />
      <main className="flex-grow flex flex-col items-center justify-start pt-6 sm:pt-10 pb-8 px-4 w-full">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg space-y-6">
          {children}
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default SetupScreenLayout;
