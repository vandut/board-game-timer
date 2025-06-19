import React, { useState, useRef, useEffect, useCallback } from 'react';

interface RoundsInputProps {
  id: string;
  initialValue: number;
  onValueChange: (value: number, error: string | null) => void;
}

const RoundsInput: React.FC<RoundsInputProps> = ({
  id,
  initialValue,
  onValueChange,
}) => {
  const min = 1;
  const max = 99;
  const label = "Number of Rounds (1-99)";
  const placeholder = "1-99";
  const maxLength = 2;

  const [displayValue, setDisplayValue] = useState<string>(String(initialValue));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastReportedNumericValueRef = useRef<number>(initialValue);

  const validateAndCallback = useCallback((currentDisplayValue: string, isInputCurrentlyFocused: boolean) => {
    let actualValidationErrorForParent: string | null = null;
    let visualErrorToSetForUser: string | null = null;
    let numericValueForParentCallback: number;

    if (currentDisplayValue === '') {
      actualValidationErrorForParent = `Number of rounds must be at least ${min}.`;
      numericValueForParentCallback = lastReportedNumericValueRef.current;
      visualErrorToSetForUser = isInputCurrentlyFocused ? null : actualValidationErrorForParent;
    } else {
      const parsed = parseInt(currentDisplayValue, 10);
      if (isNaN(parsed)) {
        actualValidationErrorForParent = "Invalid number format for rounds.";
        numericValueForParentCallback = lastReportedNumericValueRef.current;
      } else if (parsed < min) {
        actualValidationErrorForParent = `Number of rounds must be at least ${min}.`;
        numericValueForParentCallback = parsed;
      } else if (parsed > max) {
        actualValidationErrorForParent = `Number of rounds cannot exceed ${max}.`;
        numericValueForParentCallback = parsed;
      } else {
        actualValidationErrorForParent = null;
        numericValueForParentCallback = parsed;
        lastReportedNumericValueRef.current = parsed;
      }
      visualErrorToSetForUser = actualValidationErrorForParent;
    }

    onValueChange(numericValueForParentCallback, actualValidationErrorForParent);
    return visualErrorToSetForUser;
  }, [min, max, onValueChange]);

  useEffect(() => {
    const isFocused = document.activeElement === inputRef.current;
    const isFocusedAndCurrentlyEmpty = isFocused && displayValue === '';

    if (isFocusedAndCurrentlyEmpty) {
      const numInitialProp = parseInt(String(initialValue), 10);
      if (!isNaN(numInitialProp) && numInitialProp >= min && numInitialProp <= max) {
        lastReportedNumericValueRef.current = numInitialProp;
      }
      validateAndCallback('', true);
      setError(null); 
      return;
    }

    let valueToValidate: string;
    if (String(initialValue) !== displayValue) {
      setDisplayValue(String(initialValue));
      valueToValidate = String(initialValue);
    } else {
      valueToValidate = displayValue;
    }
    
    const visualError = validateAndCallback(valueToValidate, isFocused);
    setError(visualError);

    const numInitialProp = parseInt(String(initialValue), 10);
    if (!isNaN(numInitialProp) && numInitialProp >= min && numInitialProp <= max) {
      lastReportedNumericValueRef.current = numInitialProp;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const filteredValue = inputValue.replace(/[^0-9]/g, '');
    setDisplayValue(filteredValue);
    const visualError = validateAndCallback(filteredValue, true);
    setError(visualError);
  };

  const handleBlur = () => {
    const currentDisplayVal = displayValue.trim();
    const visualError = validateAndCallback(currentDisplayVal, false);
    setError(visualError);

    if (currentDisplayVal !== '') {
        const parsed = parseInt(currentDisplayVal, 10);
        if (!isNaN(parsed) && parsed >= min && parsed <= max) {
            if (String(parsed) !== currentDisplayVal) {
                setDisplayValue(String(parsed));
            }
        }
    } else { 
        setDisplayValue('');
    }
  };

  const handleClearInput = () => {
    setDisplayValue('');
    const emptyInputErrorForParent = `Number of rounds must be at least ${min}.`;
    onValueChange(lastReportedNumericValueRef.current, emptyInputErrorForParent);
    setError(null); 
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
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          id={id}
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
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

export default RoundsInput;