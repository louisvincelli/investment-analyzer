import React, { useState, useEffect, useRef } from 'react';
import { validateTicker, TickerValidationResult } from '@/lib/api/stocks';
import { Search, X, Check, AlertCircle } from 'lucide-react';

interface TickerInputProps {
  onSelect: (ticker: string) => void;
  initialValue?: string;
}

const TickerInput: React.FC<TickerInputProps> = ({ onSelect, initialValue = '' }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [validationResult, setValidationResult] = useState<TickerValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Validation debounce timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Validate on initial value if provided
    if (initialValue) {
      validateTickerInput(initialValue);
    }
    
    // Add event listener to close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [initialValue]);

  const validateTickerInput = async (value: string) => {
    if (!value.trim()) {
      setValidationResult(null);
      setShowDropdown(false);
      return;
    }
    
    setIsValidating(true);
    
    try {
      const result = await validateTicker(value);
      setValidationResult(result);
      setShowDropdown(Boolean(result && !result.isValid && result.suggestions && result.suggestions.length > 0));
    } catch (error) {
      console.error('Error validating ticker:', error);
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInputValue(value);
    
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set new timer to validate
    timerRef.current = setTimeout(() => {
      validateTickerInput(value);
    }, 500);
  };

  const handleSuggestionClick = (ticker: string) => {
    setInputValue(ticker);
    validateTickerInput(ticker);
    setShowDropdown(false);
    onSelect(ticker);
  };

  const handleSelectTicker = () => {
    if (validationResult?.isValid) {
      onSelect(validationResult.ticker as string);
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setValidationResult(null);
    setShowDropdown(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && validationResult?.isValid) {
      handleSelectTicker();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-500 bg-white">
          <Search className="h-4 w-4 ml-3 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (validationResult && !validationResult.isValid && validationResult.suggestions?.length) {
                setShowDropdown(true);
              }
            }}
            className="flex-1 py-2 px-2 outline-none bg-transparent"
            placeholder="Enter ticker symbol"
          />
          {isValidating && (
            <div className="animate-spin mr-2">
              <div className="h-4 w-4 border-2 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full" />
            </div>
          )}
          {inputValue && !isValidating && (
            <button onClick={handleClear} className="p-1 mr-1 rounded-full hover:bg-gray-100">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          {validationResult?.isValid && (
            <div className="mr-2 text-green-500">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
        
        {validationResult?.isValid && validationResult.companyName && (
          <div className="mt-1 text-xs text-gray-500 flex items-center">
            <span className="mr-1">{validationResult.companyName}</span>
            <span className="bg-gray-200 text-gray-600 px-1 rounded text-xs">{validationResult.exchange}</span>
          </div>
        )}
        
        {!isValidating && validationResult && !validationResult.isValid && !showDropdown && (
          <div className="mt-1 text-xs text-red-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>Invalid ticker symbol</span>
          </div>
        )}
      </div>
      
      {showDropdown && validationResult?.suggestions && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 mt-1 bg-white shadow-lg rounded-md border border-gray-200 w-full max-h-60 overflow-auto"
        >
          <div className="p-2 text-xs text-gray-500 border-b">
            Did you mean:
          </div>
          <div>
            {validationResult.suggestions.map((suggestion) => (
              <div
                key={suggestion.ticker}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                onClick={() => handleSuggestionClick(suggestion.ticker)}
              >
                <div>
                  <div className="font-medium">{suggestion.ticker}</div>
                  <div className="text-xs text-gray-500">{suggestion.companyName}</div>
                </div>
                <div className="text-xs bg-gray-200 text-gray-600 px-1 rounded">
                  {suggestion.exchange}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TickerInput;