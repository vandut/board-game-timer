import React from 'react';

interface SetupScreenHeaderProps {
  mainText: string;
  subText?: string;
}

const SetupScreenHeader: React.FC<SetupScreenHeaderProps> = ({ mainText, subText }) => {
  return (
    <header className="text-center mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-sky-700">
        {mainText}
      </h1>
      {subText && (
        <p 
          className="text-md text-slate-600 mt-1" 
          style={{ whiteSpace: 'pre-line' }} // Handles \n characters for multi-line subtext
        >
          {subText}
        </p>
      )}
    </header>
  );
};

export default SetupScreenHeader;
