import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader2, Search, X } from 'lucide-react';

interface OtherGroupSelectProps {
  value: any[];
  onChange: (value: any[]) => void;
  options: any[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onOpen?: () => void;
  excludeIds?: any[]; // ids that should not be selectable (e.g., main group)
}

const OtherGroupSelect: React.FC<OtherGroupSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seçin',
  searchPlaceholder = 'Axtarış...',
  disabled = false,
  isLoading = false,
  onOpen,
  excludeIds = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedSelectedIds = Array.isArray(value) ? value.map(v => v?.toString()) : [];
  const normalizedExcludeIds = Array.isArray(excludeIds) ? excludeIds.map(v => v?.toString()) : [];

  const filtered = options.filter((opt) => (
    (opt.group_name || opt.name || opt.label || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  ));

  const available = filtered.filter((opt) => {
    const id = (opt.id || opt.value || opt.group_id)?.toString();
    const alreadySelected = normalizedSelectedIds.includes(id);
    const excluded = normalizedExcludeIds.includes(id);
    return !alreadySelected && !excluded;
  });

  const selectedOptions = options.filter((opt) =>
    normalizedSelectedIds.includes((opt.id || opt.value || opt.group_id)?.toString())
  );

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      if (onOpen) onOpen();
      setIsOpen(true);
      setSearch('');
    } else {
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleSelect = (opt: any) => {
    const id = opt.id || opt.value || opt.group_id;
    const idStr = id?.toString();
    if (!idStr) return;
    if (normalizedSelectedIds.includes(idStr)) return;
    onChange([...(value || []), id]);
  };

  const handleRemoveTag = (id: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const idStr = id?.toString();
    onChange((value || []).filter((v) => v?.toString() !== idStr));
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearch('');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClickOutside]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={`
          w-full px-3 py-2.5 border rounded-lg text-left bg-white flex items-center justify-between
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:border-gray-400'}
          border-gray-300 ${isOpen ? 'border-blue-500 ring-2 ring-500' : ''}
          ${selectedOptions.length > 0 ? 'h-auto min-h-[42px] py-2' : ''}
        `}
        onClick={handleToggle}
        disabled={disabled}
      >
        <div className="flex flex-wrap gap-1 items-center flex-1 pr-6">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span
                key={(opt.id || opt.value || opt.group_id)?.toString()}
                className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
              >
                {(opt.group_name || opt.name || opt.label)}
                <button
                  type="button"
                  onClick={(e) => handleRemoveTag((opt.id || opt.value || opt.group_id), e)}
                  className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {isLoading && <Loader2 size={14} className="animate-spin text-gray-400" />}
          <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 bg-white border border-gray-200 rounded-lg w-full shadow-xl overflow-hidden top-full mt-1">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
            ) : available.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm text-center">Heç nə tapılmadı</div>
            ) : (
              available.map((opt) => (
                <div
                  key={(opt.id || opt.value || opt.group_id)?.toString()}
                  className="px-3 py-2.5 cursor-pointer transition-colors duration-150 hover:bg-blue-50 hover:text-blue-900 text-gray-700"
                  onClick={() => handleSelect(opt)}
                >
                  <span className="text-sm">{opt.group_name || opt.name || opt.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherGroupSelect;












