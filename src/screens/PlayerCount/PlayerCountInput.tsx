import React, { useState, useRef, useEffect } from 'react';

interface PlayerCountInputProps {
  id: string;
  label: string;
  initialValue: number;
  onValueChange: (value: number, error: string | null) => void;
  min: number;
  max: number;
  maxLength?: number;
  placeholder?: string;
}

const PlayerCountInput: React.FC<PlayerCountInputProps> = ({
  id,
  label,
  initialValue,
  onValueChange,
  min,
  max,
  maxLength,
  placeholder,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(String(initialValue));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Sync if initialValue prop changes externally
    setDisplayValue(String(initialValue));
    validateAndCallback(String(initialValue));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);


  const validateAndCallback = (currentDisplayValue: string) => {
    let newError: string | null = null;
    let numericValue = parseInt(currentDisplayValue, 10);

    if (currentDisplayValue === '') {
      // Allow empty during typing, but treat as min for validation or specific error
      numericValue = min; // Or handle as an error: "Input cannot be empty"
      newError = `Number of players must be at least ${min}.`;
    } else if (isNaN(numericValue)) {
      numericValue = min; // Default to min if NaN
      newError = "Invalid number format.";
    } else if (numericValue < min) {
      newError = `Number of players must be at least ${min}.`;
      // We don't clamp numericValue here as the error is primary feedback.
      // Parent can decide how to handle the numericValue if it's out of bounds but still numeric.
    } else if (numericValue > max) {
      newError = `Number of players cannot exceed ${max}.`;
    }
    
    setError(newError);
    onValueChange(numericValue, newError); // Callback with potentially out-of-bounds numericValue if error exists
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const filteredValue = inputValue.replace(/[^0-9]/g, ''); // Allow only digits
    setDisplayValue(filteredValue);
    
    // Validate on each change to give immediate feedback
    if (filteredValue === '') {
        setError(`Number of players must be at least ${min}.`);
        onValueChange(min, `Number of players must be at least ${min}.`); // Pass min as value when empty
    } else {
        const parsed = parseInt(filteredValue, 10);
        if (!isNaN(parsed)) {
            let currentError: string | null = null;
            if (parsed < min) {
                currentError = `Number of players must be at least ${min}.`;
            } else if (parsed > max) {
                currentError = `Number of players cannot exceed ${max}.`;
            }
            setError(currentError);
            onValueChange(parsed, currentError);
        } else {
             // This case should be rare due to regex, but handle defensively
            setError("Invalid number format.");
            onValueChange(min, "Invalid number format."); // Pass min on invalid format
        }
    }
  };

  const handleBlur = () => {
    let val = parseInt(displayValue, 10);
    let finalError: string | null = null;

    if (isNaN(val) || displayValue.trim() === '') { // Treat empty as invalid on blur
        val = min; // Default to min
        finalError = `Number of players must be at least ${min}.`;
    } else if (val < min) {
        // val = min; // Option: Clamp value on blur
        finalError = `Number of players must be at least ${min}.`;
    } else if (val > max) {
        // val = max; // Option: Clamp value on blur
        finalError = `Number of players cannot exceed ${max}.`;
    }
    
    setDisplayValue(String(val)); // Update display to clamped/defaulted value if needed, or original valid value
    setError(finalError);
    onValueChange(val, finalError);
  };

  const handleClearInput = () => {
    setDisplayValue('');
    setError(`Number of players must be at least ${min}.`); // Set error as it's now empty
    onValueChange(min, `Number of players must be at least ${min}.`); // Communicate change
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block mb-1 text-sm font-medium text-slate-600">
        {label}
      </label>
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text" // Using text to allow regex filtering and custom validation messages
          inputMode="numeric" // Hint for mobile keyboards
          pattern="[0-9]*"    // For mobile keyboards, not strict validation
          id={id}
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder || `${min}-${max}`}
          className={`p-3 pr-10 border rounded-lg shadow-sm focus:ring-2 focus:border-sky-500 outline-none transition-colors w-full bg-white text-slate-900 placeholder-slate-400 ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-sky-500'
          }`}
          style={{ colorScheme: 'light' }}
          required
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          maxLength={maxLength}
        />
        {displayValue && (
          <button
            type="button"
            onClick={handleClearInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl font-sans"
            aria-label={`Clear ${label}`}
            tabIndex={-1}
          >
            &#x2715;
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default PlayerCountInput;