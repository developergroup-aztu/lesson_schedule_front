import React, { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  options: any[];
  labelKey: string;
  placeholder: string;
  isLoading?: boolean;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  excludeValues?: any[];
  onOpen?: () => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  name,
  value,
  onChange,
  options,
  labelKey,
  placeholder,
  isLoading = false,
  required = false,
  disabled = false,
  multiple = false,
  excludeValues = [],
  onOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    
    if (!isOpen && onOpen) {
      onOpen();
    }
    
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  const handleSelect = (option: any) => {
    const optionValue = option.id || option.lecture_id || option.lesson_type_id || option.group_id || option.value;
    
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.includes(optionValue);
      
      if (isSelected) {
        onChange(currentValues.filter(v => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      const selectedOptions = options.filter(option => {
        const optionValue = option.id || option.lecture_id || option.lesson_type_id || option.group_id || option.value;
        return Array.isArray(value) && value.includes(optionValue);
      });
      return selectedOptions.map(option => option[labelKey]).join(', ');
    } else {
      const selectedOption = options.find(option => {
        const optionValue = option.id || option.lecture_id || option.lesson_type_id || option.group_id || option.value;
        return value === optionValue;
      });
      return selectedOption ? selectedOption[labelKey] : '';
    }
  };

  const filteredOptions = options.filter(option => {
    const optionValue = option.id || option.lecture_id || option.lesson_type_id || option.group_id || option.value;
    const matchesSearch = option[labelKey]?.toLowerCase().includes(searchTerm.toLowerCase());
    const notExcluded = !excludeValues.includes(optionValue);
    return matchesSearch && notExcluded;
  });

  const isSelected = (option: any) => {
    const optionValue = option.id || option.lecture_id || option.lesson_type_id || option.group_id || option.value;
    
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    } else {
      return value === optionValue;
    }
  };

  return (
    <div className="relative" ref={selectRef}>
      <div
        className={`
          w-full px-3 py-2 border rounded-lg cursor-pointer
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
          ${isOpen ? 'border-blue-500' : 'border-gray-300'}
          ${required && !value ? 'border-red-500' : ''}
        `}
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <span className={getDisplayValue() ? 'text-gray-900' : 'text-gray-500'}>
            {getDisplayValue() || placeholder}
          </span>
          <div className="flex items-center">
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                {isLoading ? 'Yüklənir...' : 'Nəticə tapılmadı'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`
                    px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center
                    ${isSelected(option) ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}
                  `}
                  onClick={() => handleSelect(option)}
                >
                  {multiple && (
                    <input
                      type="checkbox"
                      checked={isSelected(option)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                  )}
                  <span>{option[labelKey]}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
