import React, { useState, useRef, useEffect, useCallback } from 'react';
import BaseInput from '../../components/BaseInput'; // Import BaseInput

// Helper to parse time string.
const parseTime = (
  timeValue: string,
  forFinalFormat: boolean = false 
): { hours: number; minutes: number; isValid: boolean; error?: string; finalFormatted?: string } => {
  const trimmedTimeValue = timeValue.trim();

  if (trimmedTimeValue === "") {
    return { hours: 0, minutes: 0, isValid: false, error: "Time cannot be empty." };
  }

  const flexibleTimeRegex = /^(\d{1,2})(?::(\d{0,2}))?$/;
  let match = trimmedTimeValue.match(flexibleTimeRegex);

  let h: number, m: number;

  if (match) {
    h = parseInt(match[1], 10);
    const minutesStr = match[2];

    if (minutesStr !== undefined && minutesStr !== '') {
      m = parseInt(minutesStr, 10);
      if (isNaN(m)) m = 0; 
    } else { 
      m = 0; 
    }
  } else {
    const formatHint = "HH:MM or H (e.g., 01:30 or 2 for hours)";
    return { hours: 0, minutes: 0, isValid: false, error: `Invalid format. Use ${formatHint}.` };
  }
  
  if (isNaN(h)) { 
      return { hours: 0, minutes: 0, isValid: false, error: "Invalid hour value." };
  }

  if (h < 0 || h > 99) {
    return { hours: h, minutes: m, isValid: false, error: 'Hours must be between 0 and 99.' };
  }
  if (m < 0 || m > 59) {
    return { hours: h, minutes: m, isValid: false, error: 'Minutes must be between 0 and 59.' };
  }

  if (h === 0 && m === 0 && forFinalFormat) { // Stricter check for final submission/blur
     return { hours: h, minutes: m, isValid: false, error: "Smallest time is 1 minute (e.g., 00:01)." };
  }
   if (h === 0 && m === 0 && !forFinalFormat && trimmedTimeValue !== "0" && trimmedTimeValue !== "0:") { // Allow typing "0" or "0:"
     // Do not immediately flag "0" or "0:" as error during typing, wait for blur or more input
   } else if (h === 0 && m === 0) {
      return { hours: h, minutes: m, isValid: false, error: "Smallest time is 1 minute (e.g., 00:01)." };
   }
  
  const finalFormattedHours = String(h).padStart(2, '0');
  const finalFormattedMinutes = String(m).padStart(2, '0');

  return {
    hours: h,
    minutes: m,
    isValid: true,
    finalFormatted: `${finalFormattedHours}:${finalFormattedMinutes}`,
  };
};


interface SessionTimeInputProps {
  id: string;
  label: string;
  initialHours: number;
  initialMinutes: number;
  onTimeChange: (hours: number, minutes: number, error: string | null) => void;
  placeholder?: string;
}

const SessionTimeInput: React.FC<SessionTimeInputProps> = ({
  id,
  label,
  initialHours,
  initialMinutes,
  onTimeChange,
  placeholder,
}) => {
  const formatPropValuesToHHMM = useCallback((h: number, m: number): string => {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  },[]);

  const [displayValue, setDisplayValue] = useState<string>(() => formatPropValuesToHHMM(initialHours, initialMinutes));
  const [error, setError] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const lastReportedHoursRef = useRef<number>(initialHours);
  const lastReportedMinutesRef = useRef<number>(initialMinutes);

  useEffect(() => {
    lastReportedHoursRef.current = initialHours;
    lastReportedMinutesRef.current = initialMinutes;
  
    if (isInputFocused) {
      return;
    }
  
    const propsSuggestNonEmptyTime = initialHours !== 0 || initialMinutes !== 0;
    if (displayValue === "" && propsSuggestNonEmptyTime && !isInputFocused) { // Added !isInputFocused here
      const emptyCheckResult = parseTime("", true); 
      if (error !== emptyCheckResult.error) {
        setError(emptyCheckResult.error); 
        onTimeChange(lastReportedHoursRef.current, lastReportedMinutesRef.current, emptyCheckResult.error);
      }
      return; 
    }
  
    const newDisplayValueFromProps = formatPropValuesToHHMM(initialHours, initialMinutes);
    const currentPropsValidation = parseTime(newDisplayValueFromProps, true); // Validate as final format
    
    // Only update if props change and input is not focused,
    // or if the current display value from props is different from current display value.
    if (newDisplayValueFromProps !== displayValue || error !== currentPropsValidation.error) {
        setDisplayValue(newDisplayValueFromProps);
        if (currentPropsValidation.isValid) {
            setError(null);
            // Ensure parent is also updated if props caused a change to valid state
            if (initialHours !== lastReportedHoursRef.current || initialMinutes !== lastReportedMinutesRef.current || error !== null) {
                 onTimeChange(currentPropsValidation.hours, currentPropsValidation.minutes, null);
            }
        } else {
            setError(currentPropsValidation.error);
            onTimeChange(initialHours, initialMinutes, currentPropsValidation.error);
        }
    }
  }, [initialHours, initialMinutes, isInputFocused, onTimeChange, formatPropValuesToHHMM, error, displayValue]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^0-9:]/g, '');
    const colonCount = (value.match(/:/g) || []).length;
    if (colonCount > 1) {
      const firstColonIndex = value.indexOf(':');
      value = value.substring(0, firstColonIndex + 1) + value.substring(firstColonIndex + 1).replace(/:/g, '');
    }
    const parts = value.split(':');
    if (parts[0].length > 2) parts[0] = parts[0].substring(0,2);
    if (parts.length > 1 && parts[1] && parts[1].length > 2) parts[1] = parts[1].substring(0,2);
    value = parts.join(':');
    if (value.length > 5) value = value.substring(0,5);

    setDisplayValue(value); 
    
    const parsedResult = parseTime(value, false); 

    if (parsedResult.isValid) {
      onTimeChange(parsedResult.hours, parsedResult.minutes, null);
      lastReportedHoursRef.current = parsedResult.hours;
      lastReportedMinutesRef.current = parsedResult.minutes;
      setError(null);
    } else {
      onTimeChange(lastReportedHoursRef.current, lastReportedMinutesRef.current, parsedResult.error || "Invalid time.");
      if (value.trim() === '' && isInputFocused) {
        setError(null); 
      } else {
        setError(parsedResult.error || "Invalid time.");
      }
    }
  };

  const handleFocus = () => {
    setIsInputFocused(true);
    const parsedResult = parseTime(displayValue, false);
    if (parsedResult.isValid) {
      onTimeChange(parsedResult.hours, parsedResult.minutes, null);
      // Don't clear error if it was set on blur and is valid (e.g. empty)
      // setError(null) - Let blur or input change handle error state.
    } else {
      onTimeChange(lastReportedHoursRef.current, lastReportedMinutesRef.current, parsedResult.error);
      // If displayValue is empty and focused, error should not show (it's handled by input change or blur)
      // but if it's invalid for other reasons, the error state is already set by inputChange
      // or will be set by blur.
    }
  };

  const handleBlur = () => {
    setIsInputFocused(false);
    const currentVal = displayValue.trim();
    const parsedResult = parseTime(currentVal, true); 

    if (parsedResult.isValid && parsedResult.finalFormatted) {
      setDisplayValue(parsedResult.finalFormatted); 
      onTimeChange(parsedResult.hours, parsedResult.minutes, null);
      lastReportedHoursRef.current = parsedResult.hours;
      lastReportedMinutesRef.current = parsedResult.minutes;
      setError(null);
    } else {
      // If currentVal is empty, error is "Time cannot be empty." This should be shown.
      setError(parsedResult.error || "Invalid time.");
      onTimeChange(
        lastReportedHoursRef.current,
        lastReportedMinutesRef.current,
        parsedResult.error || "Invalid time."
      );
    }
  };

  const handleClearInput = () => {
    setDisplayValue('');
    const emptyError = parseTime('', false).error;
    onTimeChange(
        lastReportedHoursRef.current, 
        lastReportedMinutesRef.current, 
        emptyError || "Time cannot be empty."
    );
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
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClear={handleClearInput}
      error={error}
      placeholder={placeholder || "HH:MM or H"}
      maxLength={5}
      inputMode="text" // Using "text" to allow ":"
      inputRef={inputRef}
      required
      type="text"
    />
  );
};

export default SessionTimeInput;