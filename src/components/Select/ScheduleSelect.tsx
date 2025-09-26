import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Search, Loader2, X } from 'lucide-react';

interface VirtualSelectProps {
  value: any | any[];
  onChange: (value: any | any[], meta: { name: string }) => void;
  name: string;
  options?: any[];
  labelKey?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  searchPlaceholder?: string;
  error?: boolean;
  dropdownDirection?: 'top' | 'bottom';
  onOpen?: () => void;
  isLoading?: boolean;
  multiple?: boolean;
  excludeValues?: any[]; // Yeni prop - digər yerlərdə seçilmiş dəyərləri exclude etmək üçün
}

const VirtualSelect: React.FC<VirtualSelectProps> = ({
  value,
  onChange,
  name,
  options = [],
  labelKey = 'name',
  placeholder = 'Seçin',
  required = false,
  disabled = false,
  searchPlaceholder = 'Axtarış...',
  error = false,
  dropdownDirection = 'bottom',
  onOpen,
  isLoading = false,
  multiple = false,
  excludeValues = [], // Yeni prop
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize value to an array for easier handling, even for single select
  const currentValues = multiple
    ? (Array.isArray(value) ? value : [])
    : (value !== undefined && value !== null ? [value] : []);

  // Filtered options based on search input
  const filtered = options.filter((opt) =>
    (opt[labelKey] || opt.name || opt.label || '')
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // When multiple, hide options that are already selected OR excluded from other selections
  const filteredAvailable = multiple
    ? filtered.filter((opt) => {
        const optionId = (opt.id || opt.value)?.toString();
        const isCurrentlySelected = currentValues.some((val) => val?.toString() === optionId);
        const isExcluded = excludeValues.some((val) => val?.toString() === optionId);
        return !isCurrentlySelected && !isExcluded;
      })
    : filtered;

  // Get selected option(s) for display
  const selectedOptions = options.filter((opt) =>
    currentValues.some(val => (opt.id || opt.value)?.toString() === val?.toString())
  );

  // Callback to handle clicks outside the component
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
      setSearch('');
    }
  }, []);

  // Effect for click outside detection
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClickOutside]);

  // Effect for Escape key handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;

    if (!isOpen) {
      if (onOpen) {
        onOpen();
      }
      setIsOpen(true);
      setSearch('');
    } else {
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleSelect = (option: any) => {
    const optionId = option.id || option.value;

    if (multiple) {
      const isSelected = currentValues.some(val => val?.toString() === optionId?.toString());
      let newValues;
      if (isSelected) {
        newValues = currentValues.filter(val => val?.toString() !== optionId?.toString());
      } else {
        newValues = [...currentValues, optionId];
      }
      onChange(newValues, { name });
    } else {
      onChange(optionId, { name });
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleRemoveTag = (optionId: any, event: React.MouseEvent) => {
    event.stopPropagation();
    if (disabled) return;
    
    const newValues = currentValues.filter(val => val?.toString() !== optionId?.toString());
    onChange(newValues, { name });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={`
          w-full px-3 py-2.5 border rounded-lg text-left bg-white flex items-center justify-between
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
          ${disabled
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'hover:border-gray-400'
          }
          ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
          ${isOpen ? 'border-blue-500 ring-2 ring-500' : ''}
          ${multiple && selectedOptions.length > 0 ? 'h-auto min-h-[42px] py-2' : ''}
        `}
        onClick={handleToggle}
        disabled={disabled}
      >
        <div className="flex flex-wrap gap-1 items-center flex-1 pr-6">
          {multiple && selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span
                key={(opt.id || opt.value)?.toString()}
                className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
              >
                {opt[labelKey] || opt.name || opt.label}
                <button
                  type="button"
                  onClick={(e) => handleRemoveTag((opt.id || opt.value), e)}
                  className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <span className={`text-sm ${selectedOptions.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
              {selectedOptions.length > 0
                ? selectedOptions[0][labelKey] || selectedOptions[0].name || selectedOptions[0].label
                : placeholder}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {isLoading && <Loader2 size={14} className="animate-spin text-gray-400" />}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
              }`}
          />
        </div>
      </button>

      {isOpen && !disabled && (
        <div
          className={`
            absolute z-50 bg-white border border-gray-200 rounded-lg w-full shadow-xl overflow-hidden
            ${dropdownDirection === 'top' ? 'bottom-full mb-2' : 'top-full mt-1'}
          `}
        >
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader2 size={20} className="animate-spin text-blue-600 mx-auto mb-2" />
                <span className="text-gray-500 text-sm">Yüklənir...</span>
              </div>
            ) : filteredAvailable.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm text-center">
                Heç nə tapılmadı
              </div>
            ) : (
              filteredAvailable.map((opt) => (
                <div
                  key={(opt.id || opt.value)?.toString()}
                  className={`
                    px-3 py-2.5 cursor-pointer transition-colors duration-150
                    hover:bg-blue-50 hover:text-blue-900
                    ${currentValues.some(val => val?.toString() === (opt.id || opt.value)?.toString())
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'text-gray-700'
                    }
                  `}
                  onClick={() => handleSelect(opt)}
                >
                  {opt.displayPrefix || opt.statusText ? (
                    <span className='text-sm'>
                      {opt.displayPrefix}{' '}
                      <span className={opt.isFull ? 'text-red-600 font-medium' : 'text-green-600'}>
                        {opt.statusText}
                      </span>
                    </span>
                  ) : (
                    <span className='text-sm'>{opt[labelKey] || opt.name || opt.label}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualSelect;