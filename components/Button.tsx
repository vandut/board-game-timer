import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = "px-6 py-3 rounded-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantStyle = '';
  switch (variant) {
    case 'primary':
      variantStyle = 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500';
      break;
    case 'secondary':
      variantStyle = 'bg-slate-200 hover:bg-slate-300 text-slate-700 focus:ring-slate-400';
      break;
    case 'danger':
      variantStyle = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
      break;
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;