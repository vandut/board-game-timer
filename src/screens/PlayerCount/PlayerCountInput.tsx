import React, { useState, useRef, useEffect, useCallback } from 'react';

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
  const lastReportedNumericValueRef = useRef<number>(initialValue);

  const validateAndCallback = useCallback((currentDisplayValue: string, isInputCurrentlyFocused: boolean) => {
    let actualValidationErrorForParent: string | null = null;
    let visualErrorToSetForUser: string | null = null;
    let numericValueForParentCallback: number;

    if (currentDisplayValue === '') {
      actualValidationErrorForParent = `Number of players must be at least ${min}.`;
      numericValueForParentCallback = lastReportedNumericValueRef.current; 

      // If input is empty AND focused (e.g., user just cleared it), suppress visual error.
      // Error still shown if empty AND blurred.
      visualErrorToSetForUser = isInputCurrentlyFocused ? null : actualValidationErrorForParent;

    } else {
      const parsed = parseInt(currentDisplayValue, 10);
      if (isNaN(parsed)) {
        actualValidationErrorForParent = "Invalid number format.";
        numericValueForParentCallback = lastReportedNumericValueRef.current; 
      } else if (parsed < min) {
        actualValidationErrorForParent = `Number of players must be at least ${min}.`;
        numericValueForParentCallback = parsed; 
      } else if (parsed > max) {
        actualValidationErrorForParent = `Number of players cannot exceed ${max}.`;
        numericValueForParentCallback = parsed; 
      } else {
        // Valid number
        actualValidationErrorForParent = null;
        numericValueForParentCallback = parsed;
        lastReportedNumericValueRef.current = parsed; 
      }
      // For non-empty inputs (e.g., "abc", "0", or valid "5"), the visual error is the same as the actual error,
      // regardless of focus. The request was specific to *cleared* (empty) input remaining focused.
      visualErrorToSetForUser = actualValidationErrorForParent;
    }

    onValueChange(numericValueForParentCallback, actualValidationErrorForParent);
    return visualErrorToSetForUser;
  }, [min, max, onValueChange]);


  useEffect(() => {
    const isFocused = document.activeElement === inputRef.current;
    const isFocusedAndCurrentlyEmpty = isFocused && displayValue === '';

    if (isFocusedAndCurrentlyEmpty) {
      // User has focused and cleared the input. `displayValue` is "" and visual `error` is (or should be) null.
      // This effect should not override that by changing `displayValue` from `initialValue`
      // or by setting a visual error if `initialValue` itself is valid.
      // Parent component was already notified about the empty (error) state by user action handlers.
      // Update ref if initialValue (the prop) changes to a valid number.
      const numInitialProp = parseInt(String(initialValue), 10);
      if (!isNaN(numInitialProp) && numInitialProp >= min && numInitialProp <= max) {
        lastReportedNumericValueRef.current = numInitialProp;
      }
      return; 
    }

    // Standard prop synchronization if not (focused AND empty).
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
  }, [initialValue, validateAndCallback]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const filteredValue = inputValue.replace(/[^0-9]/g, '');
    setDisplayValue(filteredValue);
    const visualError = validateAndCallback(filteredValue, true); // true because input is focused
    setError(visualError);
  };

  const handleBlur = () => {
    const currentDisplayVal = displayValue.trim();
    const visualError = validateAndCallback(currentDisplayVal, false); // false because input is losing focus
    setError(visualError);

    // Normalize display for valid numbers if it's different (e.g. "01" -> "1")
    if (currentDisplayVal !== '') {
        const parsed = parseInt(currentDisplayVal, 10);
        if (!isNaN(parsed) && parsed >= min && parsed <= max) {
            if (String(parsed) !== currentDisplayVal) { 
                setDisplayValue(String(parsed));
            }
        }
    }
  };

  const handleClearInput = () => {
    setDisplayValue('');
    const emptyInputErrorForParent = `Number of players must be at least ${min}.`;
    onValueChange(lastReportedNumericValueRef.current, emptyInputErrorForParent);
    setError(null); // Visual error is null because input is cleared and will be focused.
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
          inputMode="numeric" // Suggests numeric keyboard on mobile
          pattern="[0-9]*"   // Enforces digit-only input, also helps with keyboard
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
