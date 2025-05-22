import { useState, useEffect, useMemo, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { get } from '../../api/service';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Universal Virtual Select Component
const VirtualSelect = ({
  value,
  onChange,
  name,
  placeholder = "Seçin",
  apiEndpoint,
  optionKey = 'id',
  labelKey = 'name',
  labelFormatter,
  searchKeys = ['name'],
  isMulti = false,
  disabled = false,
  required = false,
  error = null,
  height = 240,
  itemHeight = 48,
  maxVisibleItems = 5,
  noDataText = "Məlumat tapılmadı",
  searchPlaceholder = "Axtarış...",
  options: staticOptions = null, // For static options (like days)
  ...props
}) => {
  const [options, setOptions] = useState(staticOptions || []);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error_, setError_] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch data from API (only if not using static options)
  useEffect(() => {
    if (isOpen && !staticOptions && options.length === 0) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    if (!apiEndpoint || staticOptions) return;
    
    try {
      setLoading(true);
      setError_(null);
      const response = await get(apiEndpoint);
      setOptions(response.data || response);
    } catch (err) {
      setError_(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return options;
    const query = debouncedSearchQuery.toLowerCase().trim();
    
    return options.filter(option => {
      return searchKeys.some(key => {
        const fieldValue = option[key]?.toString().toLowerCase() || '';
        return fieldValue.includes(query);
      });
    });
  }, [options, debouncedSearchQuery, searchKeys]);

  // Get display label for option
  const getOptionLabel = (option) => {
    if (labelFormatter) return labelFormatter(option);
    if (typeof labelKey === 'function') return labelKey(option);
    return option[labelKey] || option.name || option.label || '';
  };

  // Get option value
  const getOptionValue = (option) => {
    return option[optionKey] || option.id || option.value;
  };

  // Get selected option(s)
  const selectedOptions = useMemo(() => {
    if (!value) return isMulti ? [] : null;
    
    if (isMulti) {
      const selectedIds = Array.isArray(value) ? value : [value];
      return options.filter(option => selectedIds.includes(getOptionValue(option)));
    } else {
      return options.find(option => getOptionValue(option).toString() === value.toString()) || null;
    }
  }, [value, options, isMulti]);

  // Handle option selection
  const handleSelectOption = (option) => {
    const optionValue = getOptionValue(option);
    
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      
      onChange(newValues, { name });
    } else {
      onChange(optionValue, { name });
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Handle remove option (for multi-select)
  const handleRemoveOption = (optionValue, e) => {
    e.stopPropagation();
    if (isMulti && Array.isArray(value)) {
      const newValues = value.filter(v => v !== optionValue);
      onChange(newValues, { name });
    }
  };

  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation();
    onChange(isMulti ? [] : '', { name });
    setSearchQuery('');
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;
    
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };

  // Scroll to highlighted item
  useEffect(() => {
    if (listRef.current && isOpen) {
      listRef.current.scrollToItem(highlightedIndex, 'smart');
    }
  }, [highlightedIndex, isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [debouncedSearchQuery]);

  // Render selected values for display
  const renderSelectedValue = () => {
    if (isMulti) {
      if (!selectedOptions || selectedOptions.length === 0) {
        return <span className="text-gray-500">{placeholder}</span>;
      }
      
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.slice(0, 2).map((option) => (
            <span
              key={getOptionValue(option)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {getOptionLabel(option)}
              <button
                type="button"
                onClick={(e) => handleRemoveOption(getOptionValue(option), e)}
                className="hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            </span>
          ))}
          {selectedOptions.length > 2 && (
            <span className="text-xs text-gray-500 px-2 py-1">
              +{selectedOptions.length - 2} digər
            </span>
          )}
        </div>
      );
    } else {
      return selectedOptions ? (
        <span className="text-gray-900">{getOptionLabel(selectedOptions)}</span>
      ) : (
        <span className="text-gray-500">{placeholder}</span>
      );
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Main Select Button */}
      <button
        type="button"
        className={`
          w-full px-3 py-2.5 text-left bg-white border rounded-lg shadow-sm transition-all duration-200
          ${disabled 
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200' 
            : 'hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          }
          ${error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
          }
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {renderSelectedValue()}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Clear button */}
            {!disabled && (selectedOptions || (isMulti && value?.length > 0)) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Dropdown arrow */}
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-60 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Yüklənir...</span>
                </div>
              </div>
            ) : error_ ? (
              <div className="p-4 text-center text-red-500">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Xəta: {error_}
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.441.935-5.982 2.46M16 21V9a5 5 0 00-10 0v12" />
                </svg>
                {noDataText}
              </div>
            ) : (
              <List
                ref={listRef}
                height={Math.min(filteredOptions.length * itemHeight, height)}
                itemCount={filteredOptions.length}
                itemSize={itemHeight}
                width="100%"
              >
                {({ index, style }) => {
                  const option = filteredOptions[index];
                  const isSelected = isMulti 
                    ? value?.includes(getOptionValue(option))
                    : getOptionValue(option).toString() === value?.toString();
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <div
                      style={style}
                      className={`
                        px-3 py-2 cursor-pointer transition-colors duration-150 flex items-center justify-between
                        ${isHighlighted ? 'bg-blue-50' : ''}
                        ${isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-50'}
                      `}
                      onClick={() => handleSelectOption(option)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {getOptionLabel(option)}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  );
                }}
              </List>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ProfessorSelect üçün xüsusi axtarış funksiyası
const ProfessorSelect = ({ value, onChange, name, ...props }) => {
  // Xüsusi axtarış funksiyası
  const customFilter = (option, query) => {
    const searchTerm = query.toLowerCase().trim();
    const fullName = `${option.name} ${option.surname}`.toLowerCase();
    const reverseName = `${option.surname} ${option.name}`.toLowerCase();
    const chairName = option.chair_name?.toLowerCase() || '';
    
    // Müxtəlif kombinasiyaları yoxla
    return (
      fullName.includes(searchTerm) ||
      reverseName.includes(searchTerm) ||
      option.name.toLowerCase().includes(searchTerm) ||
      option.surname.toLowerCase().includes(searchTerm) ||
      chairName.includes(searchTerm)
    );
  };

  return (
    <VirtualSelect
      value={value}
      onChange={onChange}
      name={name}
      apiEndpoint="/api/professors"
      optionKey="user_id"
      labelFormatter={(prof) => `${prof.name} ${prof.surname}`}
      searchKeys={['name', 'surname', 'chair_name']}
      customFilter={customFilter} // Xüsusi axtarış funksiyası
      placeholder="Müəllim seçin"
      searchPlaceholder="Müəllim axtarın..."
      noDataText="Müəllim tapılmadı"
      
      {...props}
    />
  );
};
// Group Select (Multi-select)
const GroupSelect = ({ value, onChange, name, ...props }) => (
  <VirtualSelect
    value={value}
    onChange={onChange}
    name={name}
    apiEndpoint="/api/groups"
    labelKey="name"
    searchKeys={['name']}
    placeholder="Qrup seçin"
    searchPlaceholder="Qrup axtarın..."
    noDataText="Qrup tapılmadı"
    
    isMulti={true}
    {...props}
  />
);

// Room Select
const RoomSelect = ({ value, onChange, name, ...props }) => (
  <VirtualSelect
    value={value}
    onChange={onChange}
    name={name}
    apiEndpoint="/api/rooms"
    labelFormatter={(room) => `${room.name} - ${room.room_type?.name || ''}`}
    searchKeys={['name', 'room_type.name']}
    placeholder="Otaq seçin"
    searchPlaceholder="Otaq axtarın..."
    noDataText="Otaq tapılmadı"
    {...props}
  />
);

// Discipline Select
const DisciplineSelect = ({ value, onChange, name, ...props }) => (
  <VirtualSelect
    value={value}
    onChange={onChange}
    name={name}
    apiEndpoint="/api/disciplines"
    labelKey="name"
    searchKeys={['name']}
    placeholder="Fənn seçin"
    searchPlaceholder="Fənn axtarın..."
    noDataText="Fənn tapılmadı"
    {...props}
  />
);

// Day Select (Using enum instead of API)
const DaySelect = ({ value, onChange, name, ...props }) => {
  const dayOptions = [
    { id: 1, name: 'Bazar ertəsi' },
    { id: 2, name: 'Çərşənbə axşamı' },
    { id: 3, name: 'Çərşənbə' },
    { id: 4, name: 'Cümə axşamı' },
    { id: 5, name: 'Cümə' }
  ];

  return (
    <VirtualSelect
      value={value}
      onChange={onChange}
      name={name}
      options={dayOptions}
      labelKey="name"
      searchKeys={['name']}
      placeholder="Gün seçin"
      searchPlaceholder="Gün axtarın..."
      noDataText="Gün tapılmadı"
      {...props}
    />
  );
};

export { 
  VirtualSelect,
  ProfessorSelect, 
  GroupSelect, 
  RoomSelect, 
  DisciplineSelect, 
  DaySelect 
};