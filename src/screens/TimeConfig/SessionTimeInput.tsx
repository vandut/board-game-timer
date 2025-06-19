import React, { useState, useRef, useEffect, useCallback } from 'react';

// Helper to parse time string.
// Ensures hours/minutes are padded for the finalFormatted string.
const parseTime = (
  timeValue: string,
  _forFinalFormat_not_currently_used: boolean = false // Parameter kept for signature consistency but its specific logic path removed
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
      // Single digit minutes (e.g., "1:2") are parsed as their value (e.g., 2 minutes).
      // The final formatting (e.g., "01:02") is handled by padStart below.
      m = parseInt(minutesStr, 10);
      if (isNaN(m)) m = 0; // e.g., "1:" while typing -> 1 hour 0 minutes
    } else { // No colon or no minute digits after colon (e.g., "1" or "1:")
      m = 0; // e.g., "1" -> 1 hour 0 minutes
    }
  } else {
    const formatHint = "HH:MM or H (e.g., 01:30 or 2 for hours)";
    return { hours: 0, minutes: 0, isValid: false, error: `Invalid format. Use ${formatHint}.` };
  }
  
  if (isNaN(h)) { 
      return { hours: 0, minutes: 0, isValid: false, error: "Invalid hour value." };
  }

  // Validate ranges
  if (h < 0 || h > 99) {
    return { hours: h, minutes: m, isValid: false, error: 'Hours must be between 0 and 99.' };
  }
  if (m < 0 || m > 59) {
    return { hours: h, minutes: m, isValid: false, error: 'Minutes must be between 0 and 59.' };
  }

  if (h === 0 && m === 0) {
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
    // Sync internal refs for "last known good values from parent" or "context for parent error reporting"
    lastReportedHoursRef.current = initialHours;
    lastReportedMinutesRef.current = initialMinutes;
  
    if (isInputFocused) {
      // If focused, user input takes precedence. `handleInputChange`, `handleClearInput`, and `handleBlur` manage displayValue and error.
      // This effect should not overwrite `displayValue` or `error` while user is typing or the input is focused.
      return;
    }
  
    // --- Input is NOT focused ---
  
    const propsSuggestNonEmptyTime = initialHours !== 0 || initialMinutes !== 0;
    if (displayValue === "" && propsSuggestNonEmptyTime) {
      const emptyCheckResult = parseTime("", true); 
      if (error !== emptyCheckResult.error) {
        setError(emptyCheckResult.error); 
      }
      return; 
    }
  
    const newDisplayValueFromProps = formatPropValuesToHHMM(initialHours, initialMinutes);
    const currentPropsValidation = parseTime(newDisplayValueFromProps, true);
    const needsUiUpdate = 
      newDisplayValueFromProps !== displayValue || 
      (currentPropsValidation.isValid && error !== null) ||
      (!currentPropsValidation.isValid && error !== currentPropsValidation.error);
  
    if (needsUiUpdate) {
      setDisplayValue(newDisplayValueFromProps); 
  
      if (currentPropsValidation.isValid) {
        setError(null);
        if (currentPropsValidation.hours !== initialHours || currentPropsValidation.minutes !== initialMinutes || error !== null) {
          onTimeChange(currentPropsValidation.hours, currentPropsValidation.minutes, null);
          lastReportedHoursRef.current = currentPropsValidation.hours; 
          lastReportedMinutesRef.current = currentPropsValidation.minutes;
        }
      } else {
        setError(currentPropsValidation.error);
        if (error !== currentPropsValidation.error) { 
            onTimeChange(initialHours, initialMinutes, currentPropsValidation.error);
        }
      }
    }
  }, [initialHours, initialMinutes, isInputFocused, onTimeChange, formatPropValuesToHHMM, error, displayValue]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Filter characters: allow digits, at most one colon.
    value = value.replace(/[^0-9:]/g, '');
    const colonCount = (value.match(/:/g) || []).length;
    if (colonCount > 1) {
      const firstColonIndex = value.indexOf(':');
      value = value.substring(0, firstColonIndex + 1) + value.substring(firstColonIndex + 1).replace(/:/g, '');
    }
    // Max length for HH:MM is 5. Max 2 for H.
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
      // Show visual error, unless input is empty AND focused (user is actively clearing it)
      if (value.trim() === '' && isInputFocused) {
        setError(null); // Visual error hidden while user is clearing a focused input
      } else {
        setError(parsedResult.error || "Invalid time.");
      }
    }
  };

  const handleFocus = () => {
    setIsInputFocused(true);
    // When input is focused, the parent should be updated with the current validity.
    // The visual error state (`error`) is primarily managed by:
    // - `handleInputChange` or `handleClearInput` (clears visual error if focused and made empty)
    // - `handleBlur` (sets visual error if invalid, e.g., empty)
    // - `useEffect` (bails out if focused, preserving the error state set by blur/active edits)
    // This `handleFocus` method itself does not change `setError`.
    // It ensures `onTimeChange` is called so the parent knows the input's state upon focus.

    const parsedResult = parseTime(displayValue, false);
    if (parsedResult.isValid) {
      // If content is valid, ensure parent knows (e.g. if state was out of sync, or became valid)
      onTimeChange(parsedResult.hours, parsedResult.minutes, null);
    } else {
      // If content is invalid (empty or malformed), ensure parent knows.
      // Use lastReportedH/M for context if parsing fails to yield new H/M.
      onTimeChange(lastReportedHoursRef.current, lastReportedMinutesRef.current, parsedResult.error);
    }
  };

  const handleBlur = () => {
    setIsInputFocused(false);
    const currentVal = displayValue.trim();
    const parsedResult = parseTime(currentVal, true); // Parse for final formatting

    if (parsedResult.isValid && parsedResult.finalFormatted) {
      setDisplayValue(parsedResult.finalFormatted); 
      onTimeChange(parsedResult.hours, parsedResult.minutes, null);
      lastReportedHoursRef.current = parsedResult.hours;
      lastReportedMinutesRef.current = parsedResult.minutes;
      setError(null);
    } else {
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
    setError(null); // Visually hide error as input will be focused.
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
          inputMode="text" 
          id={id}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || "HH:MM or H"}
          className={`p-3 pr-10 border rounded-lg shadow-sm focus:ring-2 focus:border-sky-500 outline-none transition-colors w-full bg-white text-slate-900 placeholder-slate-400 ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-sky-500'
          }`}
          style={{ colorScheme: 'light' }}
          required
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          maxLength={5} 
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

export default SessionTimeInput;