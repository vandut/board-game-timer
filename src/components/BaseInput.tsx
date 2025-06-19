import React from 'react';

interface BaseInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onClear: () => void;
  error?: string | null;
  placeholder?: string;
  maxLength?: number;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  pattern?: string;
  required?: boolean;
  type?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  autoComplete?: string;
  className?: string; // For the outer div
  inputClassName?: string; // For the input element itself
  labelClassName?: string; // For the label element
  errorClassName?: string; // For the error p element
  clearButtonClassName?: string; // For the clear button
}

const BaseInput: React.FC<BaseInputProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  onClear,
  error,
  placeholder,
  maxLength,
  inputMode,
  pattern,
  required,
  type = 'text',
  inputRef,
  disabled,
  readOnly,
  name,
  autoComplete,
  className = '',
  inputClassName = '',
  labelClassName = 'block mb-1 text-sm font-medium text-slate-600',
  errorClassName = 'mt-1 text-xs text-red-600',
  clearButtonClassName = 'absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl font-sans',
}) => {
  const errorId = error ? `${id}-error-message` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="relative w-full">
        <input
          ref={inputRef}
          type={type}
          inputMode={inputMode}
          pattern={pattern}
          id={id}
          name={name || id}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`p-3 pr-10 border rounded-lg shadow-sm focus:ring-2 outline-none transition-colors w-full bg-white text-slate-900 placeholder-slate-400 ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:ring-sky-500'
          } ${inputClassName}`}
          style={{ colorScheme: 'light' }}
          required={required}
          aria-describedby={errorId}
          aria-invalid={!!error}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
        />
        {value && !disabled && !readOnly && (
          <button
            type="button"
            onClick={onClear}
            className={clearButtonClassName}
            aria-label={`Clear ${label}`}
            tabIndex={-1}
          >
            &#x2715;
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className={errorClassName}>
          {error}
        </p>
      )}
    </div>
  );
};

export default BaseInput;