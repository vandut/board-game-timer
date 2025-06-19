import React, { useState, useRef, useEffect, useCallback } from 'react';
import BaseInput from '../../components/BaseInput'; // Import BaseInput

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

  return (
    <BaseInput
      id={id}
      label={label}
      value={displayValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onClear={handleClearInput}
      error={error}
      placeholder={placeholder}
      maxLength={maxLength}
      inputMode="numeric"
      pattern="[0-9]*"
      required
      inputRef={inputRef}
      type="text" 
    />
  );
};

export default RoundsInput;