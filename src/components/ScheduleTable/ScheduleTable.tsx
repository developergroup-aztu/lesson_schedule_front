import React, { useEffect, useState, forwardRef, useCallback, useMemo, useRef, useImperativeHandle } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import TableHeader from './TableHeader';
import ScheduleCell from './ScheduleCell';
import ContextMenu from '../ContextMenu';
import { get } from '../../api/service';
import { Clock, Users, X, Maximize2, Search, Filter, ChevronDown, Minimize2 } from 'lucide-react';
import type { Hour as HourType } from '../../types';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { createPortal } from 'react-dom';


// Key for localStorage
const LOCAL_STORAGE_STATS_KEY = 'scheduleStatsPanelVisible';

export type ScheduleTableHandle = {
  getScrollPosition: () => { left: number; top: number };
  setScrollPosition: (pos: { left?: number; top?: number }) => void;
};

const ScheduleTable = forwardRef<ScheduleTableHandle, {
  onAddLesson: (...args: any[]) => void;
  onEditLesson: (...args: any[]) => void;
  onOpenContextMenu: (...args: any[]) => void;
}>(({
  onAddLesson,
  onEditLesson,
  onOpenContextMenu,
}, ref) => {
  const { scheduleData, refreshSchedule } = useSchedule();
  const { user } = useAuth();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const groups: any[] = (scheduleData as any).groups || [];
  const facultyId = params.id || (user as any)?.faculty_id || (scheduleData as any)?.faculty?.faculty_id;

  const parseIdsFromParam = (value: string | null): number[] => {
    if (!value) return [];
    return value
      .split(',')
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v));
  };

  const [hours, setHours] = useState<HourType[]>([]);
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    groupId: null,
    dayId: null,
    hourId: null,
    lessonIndex: null,
    weekTypeId: null,
  });

  // Enhanced Filter state
  const [selectedGroups, setSelectedGroups] = useState<number[]>(() => parseIdsFromParam(searchParams.get('groups')));
  const [selectedHours, setSelectedHours] = useState<number[]>(() => parseIdsFromParam(searchParams.get('hours')));
  const [groupSearch, setGroupSearch] = useState<string>('');
  const [hourSearch, setHourSearch] = useState<string>('');
  const [showGroupDropdown, setShowGroupDropdown] = useState<boolean>(false);
  const [showHourDropdown, setShowHourDropdown] = useState<boolean>(false);
  const [tableMaximized, setTableMaximized] = useState(false);
  const filterInitializedRef = useRef(false); // Filtreleme ilk tetiklenmeyi kontrol et

  // Stats panel
  const [showStatsPanel, setShowStatsPanel] = useState<boolean>(() => {
    try {
      const storedValue = localStorage.getItem(LOCAL_STORAGE_STATS_KEY);
      return storedValue ? JSON.parse(storedValue) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const response = await get('/api/hours');
        setHours(response.data || []);
      } catch {
        setHours([]);
      }
    };
    fetchHours();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_STATS_KEY, JSON.stringify(showStatsPanel));
    } catch { }
  }, [showStatsPanel]);

  // Sync selected filters to URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (selectedGroups.length > 0) {
      next.set('groups', selectedGroups.join(','));
    } else {
      next.delete('groups');
    }
    if (selectedHours.length > 0) {
      next.set('hours', selectedHours.join(','));
    } else {
      next.delete('hours');
    }
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [selectedGroups, selectedHours]);

  // Filtrlər dəyişdikdə backend-ə parametr göndərm
  useEffect(() => {
    // İlk mount'da tetiklenmə - ScheduleContext-dən gələn data istifadə edin
    if (!filterInitializedRef.current) {
      filterInitializedRef.current = true;
      return;
    }
    
    // Sadəcə filter değiştiğinde API çağrısı yap
    refreshSchedule(selectedGroups.length > 0 ? selectedGroups : undefined, 
                   selectedHours.length > 0 ? selectedHours : undefined);
  }, [selectedGroups, selectedHours]);

  // Backend-dən gələn məlumatlar birbaşa istifadə olun (frontend filtrləmə yoxdur)
  // Backend response-da artıq filtrlənmiş məlumatlar olacaq

  // Quick-select hour sets: first 3 as morning, next 3 as afternoon
  const morningHourIds = hours.slice(0, 3).map((h) => h.id);
  const afternoonHourIds = hours.slice(3, 6).map((h) => h.id);

  // Memoized search filtered options - Bu performans problemini çözüyor
  const searchFilteredGroups = useMemo(() =>
    groups.filter(g =>
      g.group_name.toLowerCase().includes(groupSearch.toLowerCase())
    ), [groups, groupSearch]
  );

  const searchFilteredHours = useMemo(() =>
    hours.filter(h =>
      h.time.toLowerCase().includes(hourSearch.toLowerCase())
    ), [hours, hourSearch]
  );

  // Find lessons helper
  const findLessons = useCallback((groupId: number, dayId: number, hourId: number) => {
    const group = groups.find((g: any) => g.group_id === groupId);
    if (!group) return undefined;
    const day = group.days[dayId];
    if (!day) return undefined;
    const hour = day.hours.find((h: any) => h.hour_id === hourId);
    return hour?.lessons;
  }, [groups]);

  // Group selection handlers
  const handleGroupToggle = (groupId: number) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSelectAllGroups = () => {
    if (selectedGroups.length === searchFilteredGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(searchFilteredGroups.map(g => g.group_id));
    }
  };

  // Hour selection handlers
  const handleHourToggle = (hourId: number) => {
    setSelectedHours(prev =>
      prev.includes(hourId)
        ? prev.filter(id => id !== hourId)
        : [...prev, hourId]
    );
  };

  const handleSelectAllHours = () => {
    if (selectedHours.length === searchFilteredHours.length) {
      setSelectedHours([]);
    } else {
      setSelectedHours(searchFilteredHours.map(h => h.id));
    }
  };

  // Custom Multi-Select Component
  const MultiSelectDropdown = ({
    label,
    items,
    selectedItems,
    onToggle,
    onSelectAll,
    searchValue,
    onSearchChange,
    isOpen,
    onToggleOpen,
    getItemId,
    getItemLabel,
    placeholder,
    quickSelectOptions,
    onQuickSelect
  }: any) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);

    useEffect(() => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom,
          left: rect.left,
          width: rect.width
        });
      } else if (!isOpen) {
        setPosition(null);
      }
    }, [isOpen]);

    const dropdownContent = position && isOpen ? (
      <div
        className="bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] max-h-64 overflow-auto"
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
          width: position.width
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`${label} axtar...`}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-300"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div className="p-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectAll();
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
          >
            {selectedItems.length ===
              items.filter((item: any) =>
                getItemLabel(item).toLowerCase().includes(searchValue.toLowerCase())
              ).length
              ? "Hamısını ləğv et"
              : "Hamısını seç"}
          </button>
          {Array.isArray(quickSelectOptions) && quickSelectOptions.length > 0 && (
            <div className="flex gap-2 px-2 pt-1">
              {quickSelectOptions.map((opt: any) => (
                <button
                  key={opt.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickSelect && onQuickSelect(opt.ids);
                  }}
                  className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-150"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="max-h-40 overflow-y-auto">
          {items
            .filter((item: any) =>
              getItemLabel(item).toLowerCase().includes(searchValue.toLowerCase())
            )
            .map((item: any) => (
              <label
                key={getItemId(item)}
                className="flex items-center px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(getItemId(item))}
                  onChange={() => onToggle(getItemId(item))}
                  className="mr-3 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{getItemLabel(item)}</span>
              </label>
            ))}
        </div>
      </div>
    ) : null;

    return (
      <div className="relative">
        <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
        <div className="relative">
          <div
            ref={buttonRef}
            className="flex items-center justify-between bg-white border-2 border-slate-200 rounded-xl px-4 py-3 min-w-[200px] hover:border-blue-300 transition-colors duration-200 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onToggleOpen();
            }}
          >
            <div className="flex-1">
              {selectedItems.length === 0 ? (
                <span className="text-slate-500 text-sm">{placeholder}</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedItems.slice(0, 3).map((itemId: number) => {
                    const item = items.find((i: any) => getItemId(i) === itemId);
                    return item ? (
                      <span
                        key={itemId}
                        className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium"
                      >
                        {getItemLabel(item)}
                      </span>
                    ) : null;
                  })}
                  {selectedItems.length > 3 && (
                    <span className="inline-flex items-center bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-medium">
                      +{selectedItems.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                }`}
            />
          </div>
        </div>
        {dropdownContent && createPortal(dropdownContent, document.body)}
      </div>
    );
  };

  // Enhanced Filter UI
  const renderFilterBar = () => (
    <div className={`bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg p-6 mb-6 ${tableMaximized ? 'hidden' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-800">Filterlər</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MultiSelectDropdown
          label="Qruplar"
          items={searchFilteredGroups}
          selectedItems={selectedGroups}
          onToggle={handleGroupToggle}
          onSelectAll={handleSelectAllGroups}
          searchValue={groupSearch}
          onSearchChange={setGroupSearch}
          isOpen={showGroupDropdown}
          onToggleOpen={() => {
            setShowGroupDropdown(!showGroupDropdown);
            setShowHourDropdown(false);
          }}
          getItemId={(item: any) => item.group_id}
          getItemLabel={(item: any) => item.group_name}
          placeholder="Qrup seçin..."
        />

        <MultiSelectDropdown
          label="Saatlar"
          items={searchFilteredHours}
          selectedItems={selectedHours}
          onToggle={handleHourToggle}
          onSelectAll={handleSelectAllHours}
          searchValue={hourSearch}
          onSearchChange={setHourSearch}
          isOpen={showHourDropdown}
          onToggleOpen={() => {
            setShowHourDropdown(!showHourDropdown);
            setShowGroupDropdown(false);
          }}
          getItemId={(item: any) => item.id}
          getItemLabel={(item: any) => item.time}
          placeholder="Saat seçin..."
          quickSelectOptions={[
            { label: 'Səhər', ids: morningHourIds },
            { label: 'Günorta', ids: afternoonHourIds },
          ]}
          onQuickSelect={(ids: number[]) => setSelectedHours(ids)}
        />
      </div>

      {(selectedGroups.length > 0 || selectedHours.length > 0) && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Aktiv filterlər:</span>
              {selectedGroups.length > 0 && (
                <span className="ml-2 inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium mr-2">
                  {selectedGroups.length} qrup
                </span>
              )}
              {selectedHours.length > 0 && (
                <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                  {selectedHours.length} saat
                </span>
              )}
            </div>
            <button
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
              onClick={() => {
                setSelectedGroups([]);
                setSelectedHours([]);
                setGroupSearch('');
                setHourSearch('');
                const next = new URLSearchParams(searchParams);
                next.delete('groups');
                next.delete('hours');
                setSearchParams(next, { replace: true });
              }}
            >
              Hamısını sıfırla
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowGroupDropdown(false);
      setShowHourDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // New toggle maximize function
  const handleToggleMaximize = () => {
    setTableMaximized(prev => !prev);
  };

  // Ref to inner scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Expose imperative API for parent to control scroll
  useImperativeHandle(ref, () => ({
    getScrollPosition: () => {
      const el = scrollContainerRef.current;
      return {
        left: el ? el.scrollLeft : 0,
        top: el ? el.scrollTop : 0,
      };
    },
    setScrollPosition: (pos: { left?: number; top?: number }) => {
      const el = scrollContainerRef.current;
      if (!el) return;
      if (typeof pos.left === 'number') el.scrollLeft = pos.left;
      if (typeof pos.top === 'number') el.scrollTop = pos.top;
    },
  }), []);

  // Unified table
  const renderUnifiedTable = () => (
    <div className={`schedule-table-container relative overflow-x-auto transition-all duration-300 ${tableMaximized ? 'fixed inset-0 z-[9999] bg-white' : ''
      }`}>
      <div className={`flex justify-end items-center mb-4 pr-4 ${tableMaximized ? 'absolute  top-1  right-1 z-50' : 'relative'}`}>
        <button
          onClick={handleToggleMaximize}
          className="flex items-center text-sm gap-2 p-2 rounded-lg text-slate-500 border bg-[#ffffffd8] hover:bg-slate-100 transition-colors duration-200"
        >
          {tableMaximized ? (
            <>
              <Minimize2 size={16} />
            </>
          ) : (
            <>
              <Maximize2 size={16} />
              <span>Tam ekran</span>
            </>
          )}
        </button>
      </div>

      <div ref={scrollContainerRef} className={`schedule-table-scroll overflow-auto ${tableMaximized ? 'h-[98vh]' : 'max-h-[80vh]'
        }`}>
        <table className="border-collapse w-full">
          <TableHeader hours={hours} />
          <tbody className="divide-y divide-slate-200/50">
            {groups.map((group: any) => (
              <tr key={group.group_id} className="transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 group">
                <td className="group-name sticky left-0 z-1 bg-gradient-to-r from-slate-50/95 to-white/95 backdrop-blur-sm border-r border-slate-200/60 p-4 min-w-[150px]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 shadow-lg" />
                    <span className="font-bold text-slate-700 text-sm tracking-wide whitespace-nowrap">
                      {group.group_name}
                    </span>
                  </div>
                </td>
                {Array.from({ length: 5 }).map((_, dayIndex: number) => {
                  const dayId = dayIndex + 1;
                  return hours.map((hour: HourType) => {
                    const hourLessons = findLessons(group.group_id, dayId, hour.id);
                    return (
                      <ScheduleCell
                        key={`${group.group_id}-${dayId}-${hour.id}`}
                        groupId={group.group_id}
                        dayId={dayId}
                        hourId={hour.id}
                        lessons={hourLessons}
                        onAddLesson={onAddLesson}
                        onOpenContextMenu={onOpenContextMenu}
                        onEditLesson={onEditLesson}
                      />
                    );
                  });
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ContextMenu handler
  const handleEditFromContextMenu = useCallback(() => {
    if (
      contextMenu.groupId !== null &&
      contextMenu.dayId !== null &&
      contextMenu.hourId !== null &&
      contextMenu.lessonIndex !== null
    ) {
      onEditLesson(
        contextMenu.groupId,
        contextMenu.dayId,
        contextMenu.hourId,
        contextMenu.lessonIndex,
        contextMenu.weekTypeId,
      );
    }
    setContextMenu((c) => ({ ...c, isOpen: false }));
  }, [contextMenu, onEditLesson]);

  const handleToggleStatsPanel = useCallback(() => {
    setShowStatsPanel(prev => !prev);
  }, []);

  return (
    <div
      className={`schedule-area min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 ${tableMaximized ? 'fixed inset-0 overflow-hidden z-[9999]' : ''}`}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-200/10 to-emerald-200/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative">
        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          onClose={() => setContextMenu((c) => ({ ...c, isOpen: false }))}
          groupId={contextMenu.groupId}
          dayId={contextMenu.dayId}
          hourId={contextMenu.hourId}
          lessonIndex={contextMenu.lessonIndex}
          weekTypeId={contextMenu.weekTypeId}
          onEdit={handleEditFromContextMenu}
        />
        {/* Enhanced Filter Bar */}
        {renderFilterBar()}

        {/* Unified Table */}
        {renderUnifiedTable()}
      </div>

      {/* Floating Stats Panel */}
      {showStatsPanel ? (
        <div className={`fixed bottom-8 right-8 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-2xl p-6 z-20 ${tableMaximized ? 'hidden' : ''}`}>
          <button
            onClick={handleToggleStatsPanel}
            className="absolute top-2 right-2 p-1 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200"
            aria-label="Close stats panel"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Toplam Saat</p>
                <p className="text-lg font-bold text-slate-700">{hours.length}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Aktiv Qrup</p>
                <p className="text-lg font-bold text-slate-700">
                  {groups.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleToggleStatsPanel}
          className={`fixed bottom-8 right-8 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/70 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all duration-300 z-20 flex items-center justify-center gap-2 text-sm font-medium ${tableMaximized ? 'hidden' : ''}`}
          aria-label="Open stats panel"
          title="Open Stats Panel"
        >
          <Maximize2 size={20} />
          <span>Statistika</span>
        </button>
      )}
    </div>
  );
});

export default ScheduleTable;