import React, { useState, useRef, useEffect, useCallback } from 'react';

// Helper function to parse and validate HH:MM time string or H input
const parseTimeValue = (timeValue: string): { majorUnit: number; minorUnit: number; isValid: boolean; error?: string; formatted?: string } => {
  const trimmedTimeValue = timeValue.trim();
  if (trimmedTimeValue === "") {
    return { majorUnit: 0, minorUnit: 0, isValid: false, error: "Time cannot be empty." };
  }

  const timeRegex = /^(\d{1,2}):(\d{1,2})$/; // HH:MM
  let match = trimmedTimeValue.match(timeRegex);
  let majorUnit: number; // Hours
  let minorUnit: number; // Minutes

  if (match) {
    majorUnit = parseInt(match[1], 10);
    minorUnit = parseInt(match[2], 10);
  } else if (/^\d{1,2}$/.test(trimmedTimeValue)) { // Single number as Hours (max 2 digits for H)
    majorUnit = parseInt(trimmedTimeValue, 10);
    minorUnit = 0;
  } else {
    const formatHint = "HH:MM or H (e.g., 01:30 or 2 for hours)";
    return { majorUnit: 0, minorUnit: 0, isValid: false, error: `Invalid format. Use ${formatHint}.` };
  }

  if (isNaN(majorUnit) || isNaN(minorUnit)) {
    return { majorUnit: 0, minorUnit: 0, isValid: false, error: "Invalid number conversion." };
  }

  if (majorUnit < 0 || majorUnit > 99) {
    return { majorUnit, minorUnit, isValid: false, error: 'Hours must be between 0 and 99.' };
  }
  if (minorUnit < 0 || minorUnit > 59) {
    return { majorUnit, minorUnit, isValid: false, error: 'Minutes must be between 0 and 59.' };
  }

  if (majorUnit === 0 && minorUnit === 0) {
    return { majorUnit, minorUnit, isValid: false, error: "Smallest time is 1 minute (e.g., 00:01 or 1 for 1 hour)." };
  }

  const formattedMajor = String(majorUnit).padStart(2, '0');
  const formattedMinor = String(minorUnit).padStart(2, '0');

  // For display, if it was single H input, show H, else HH:MM
  const displayFormatted = (match || trimmedTimeValue.includes(':')) ? `${formattedMajor}:${formattedMinor}` : String(majorUnit);


  return { majorUnit, minorUnit, isValid: true, formatted: displayFormatted };
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
  const formatInitialDisplayValue = (h: number, m: number) => {
    // If initial is e.g. 2 hours 0 minutes, display as "2", not "02:00"
    // unless it was explicitly set with minutes initially.
    // For simplicity now, always format to HH:MM if minutes are involved or hours > 0
    // This could be refined if strict H vs HH:MM display based on input type is desired
    if (h === 0 && m === 0) return "00:01"; // Default to a valid small time if initial is 0
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const [displayValue, setDisplayValue] = useState<string>(formatInitialDisplayValue(initialHours, initialMinutes));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Store last valid reported values to prevent callback with stale data if input is temporarily invalid
  const lastReportedHoursRef = useRef<number>(initialHours);
  const lastReportedMinutesRef = useRef<number>(initialMinutes);

  const validateAndCallback = useCallback((currentDisplayValue: string, isFocused: boolean) => {
    const validationResult = parseTimeValue(currentDisplayValue);
    let visualErrorToSet: string | null = null;

    if (validationResult.isValid) {
      onTimeChange(validationResult.majorUnit, validationResult.minorUnit, null);
      lastReportedHoursRef.current = validationResult.majorUnit;
      lastReportedMinutesRef.current = validationResult.minorUnit;
      visualErrorToSet = null;
    } else {
      onTimeChange(lastReportedHoursRef.current, lastReportedMinutesRef.current, validationResult.error || "Invalid time.");
      visualErrorToSet = validationResult.error || "Invalid time.";
      if (currentDisplayValue === '' && isFocused) {
        visualErrorToSet = null; // Suppress visual error if empty and focused
      }
    }
    return visualErrorToSet;
  }, [onTimeChange]);

  useEffect(() => {
    // Sync with props if they change
    const newInitialDisplay = formatInitialDisplayValue(initialHours, initialMinutes);
    const isFocused = document.activeElement === inputRef.current;
    
    // Avoid resetting user's active input if prop changes but value is same
    // Or if user just cleared the input and it's focused
    if (newInitialDisplay === displayValue && !error && !isFocused && parseTimeValue(displayValue).isValid) { // if same, valid, and not focused, no need to re-validate
        return;
    }
    if (isFocused && displayValue === '') { // User cleared it
        const validationError = parseTimeValue('').error;
        onTimeChange(lastReportedHoursRef.current, lastReportedMinutesRef.current, validationError || "Time cannot be empty.");
        setError(null); // No visual error if focused and empty
        return;
    }

    setDisplayValue(newInitialDisplay);
    const validationError = validateAndCallback(newInitialDisplay, isFocused);
    setError(validationError);
    
    // Update refs for last reported values from props
    const parsedInitial = parseTimeValue(newInitialDisplay);
    if(parsedInitial.isValid) {
        lastReportedHoursRef.current = parsedInitial.majorUnit;
        lastReportedMinutesRef.current = parsedInitial.minorUnit;
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHours, initialMinutes]); // validateAndCallback dependency not needed here as it's stable


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Allow digits, colon. Max 5 chars (HH:MM).
    value = value.replace(/[^0-9:]/g, '');
    const colonCount = (value.match(/:/g) || []).length;
    if (colonCount > 1) {
      const firstColonIndex = value.indexOf(':');
      value = value.substring(0, firstColonIndex + 1) + value.substring(firstColonIndex + 1).replace(/:/g, '');
    }
    if (value.length > 5) {
      value = value.substring(0, 5);
    }
    
    setDisplayValue(value);
    const visualError = validateAndCallback(value, true); // true as input is focused
    setError(visualError);
  };

  const handleBlur = () => {
    const validationResult = parseTimeValue(displayValue);
    if (validationResult.isValid && validationResult.formatted) {
      // Normalize format on blur if valid
      // For instance, if user types "1", on blur it might become "01:00" or stay "1"
      // Let's use the formatted value from parser which handles H vs HH:MM
      setDisplayValue(validationResult.formatted); 
      setError(null);
      onTimeChange(validationResult.majorUnit, validationResult.minorUnit, null);
      lastReportedHoursRef.current = validationResult.majorUnit;
      lastReportedMinutesRef.current = validationResult.minorUnit;
    } else {
      setError(validationResult.error || "Invalid time.");
      // onTimeChange already called by validateAndCallback via handleInputChange or useEffect
    }
  };

  const handleClearInput = () => {
    setDisplayValue('');
    const validationError = parseTimeValue('').error; // Get error for empty
    onTimeChange(lastReportedHoursRef.current, lastReportedMinutesRef.current, validationError || "Time cannot be empty.");
    setError(null); // No visual error as it will be focused
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
          type="text" // Using text to allow HH:MM format
          inputMode="text" // No specific numeric mode is perfect for HH:MM
          id={id}
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder || "HH:MM or H"}
          className={`p-3 pr-10 border rounded-lg shadow-sm focus:ring-2 focus:border-sky-500 outline-none transition-colors w-full bg-white text-slate-900 placeholder-slate-400 ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-sky-500'
          }`}
          style={{ colorScheme: 'light' }}
          required
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          maxLength={5} // For HH:MM
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