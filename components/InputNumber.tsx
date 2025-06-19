import React from 'react';

interface InputNumberProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const InputNumber: React.FC<InputNumberProps> = ({ label, id, className, ...props }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-1 text-sm font-medium text-slate-600">
        {label}
      </label>
      <input
        type="number"
        id={id}
        className={`p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors bg-white text-slate-900 placeholder-slate-400 ${className}`}
        style={{ colorScheme: 'light' }}
        {...props}
      />
    </div>
  );
};

export default InputNumber;