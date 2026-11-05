import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MONTH_NAMES = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const MONTH_SHORT = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
];

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const WEEK_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const PANEL_WIDTH = 340;
const PANEL_HEIGHT_ESTIMATE = 500;
const VIEWPORT_MARGIN = 12;
const PANEL_GAP = 8;

const pad2 = (value: number) => String(value).padStart(2, '0');

const toISODate = (date: Date) =>
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const parseISODate = (value?: string | null): Date | null => {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const parsed = new Date(year, month, day);

    if (
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month ||
        parsed.getDate() !== day
    ) {
        return null;
    }

    return parsed;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

interface DatePickerProps {
    id?: string;
    value?: string | null;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    allowClear?: boolean;
    min?: string;
    max?: string;
    ariaLabel?: string;
}

export function DatePicker({
    id,
    value,
    onChange,
    placeholder = 'Pilih tanggal',
    className = '',
    disabled = false,
    allowClear = false,
    min,
    max,
    ariaLabel,
}: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<Date | null>(null);
    const [viewDate, setViewDate] = useState<Date>(() => startOfMonth(new Date()));
    const [monthOpen, setMonthOpen] = useState(false);
    const [yearOpen, setYearOpen] = useState(false);
    const [coords, setCoords] = useState({
        top: 0,
        left: 0,
        width: PANEL_WIDTH,
        ready: false,
    });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const yearListRef = useRef<HTMLDivElement>(null);

    const parsedValue = useMemo(() => parseISODate(value), [value]);

    const closeCalendar = useCallback(() => {
        setOpen(false);
        setMonthOpen(false);
        setYearOpen(false);
    }, []);

    const openCalendar = useCallback(() => {
        if (disabled) return;

        const parsed = parseISODate(value);
        const base = parsed ?? new Date();

        setDraft(parsed);
        setViewDate(startOfMonth(base));
        setMonthOpen(false);
        setYearOpen(false);
        setCoords((prev) => ({ ...prev, ready: false }));
        setOpen(true);
    }, [disabled, value]);

    const updatePosition = useCallback(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const width = Math.min(PANEL_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2);
        const height = panelRef.current?.offsetHeight ?? PANEL_HEIGHT_ESTIMATE;

        let left = rect.left;
        if (left + width > viewportWidth - VIEWPORT_MARGIN) {
            left = rect.right - width;
        }
        left = Math.max(
            VIEWPORT_MARGIN,
            Math.min(left, viewportWidth - width - VIEWPORT_MARGIN)
        );

        const spaceBelow = viewportHeight - rect.bottom - PANEL_GAP - VIEWPORT_MARGIN;
        const spaceAbove = rect.top - PANEL_GAP - VIEWPORT_MARGIN;

        let top: number;
        if (spaceBelow >= height || spaceBelow >= spaceAbove) {
            top = rect.bottom + PANEL_GAP;
        } else {
            top = rect.top - PANEL_GAP - height;
        }
        top = Math.max(
            VIEWPORT_MARGIN,
            Math.min(top, viewportHeight - height - VIEWPORT_MARGIN)
        );

        setCoords({ top, left, width, ready: true });
    }, []);

    useEffect(() => {
        if (!open) return;

        updatePosition();
        const frame = window.requestAnimationFrame(updatePosition);

        const handleResize = () => updatePosition();
        const handleScroll = () => updatePosition();

        window.addEventListener('resize', handleResize);
        document.addEventListener('scroll', handleScroll, true);

        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [open, updatePosition]);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;
            if (triggerRef.current?.contains(target)) return;
            if (panelRef.current?.contains(target)) return;
            closeCalendar();
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, [open, closeCalendar]);

    useEffect(() => {
        if (!open) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;

            event.preventDefault();
            event.stopPropagation();

            if (monthOpen || yearOpen) {
                setMonthOpen(false);
                setYearOpen(false);
                return;
            }
            closeCalendar();
        };

        window.addEventListener('keydown', handleEscape, true);
        return () => window.removeEventListener('keydown', handleEscape, true);
    }, [open, monthOpen, yearOpen, closeCalendar]);

    useEffect(() => {
        if (!yearOpen) return;

        const list = yearListRef.current;
        const selected = list?.querySelector('[data-selected="true"]') as HTMLElement | null;
        if (!list || !selected) return;

        list.scrollTop =
            selected.offsetTop - list.clientHeight / 2 + selected.offsetHeight / 2;
    }, [yearOpen]);

    const today = new Date();

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const offset = (firstDay.getDay() + 6) % 7;
        const gridStart = new Date(year, month, 1 - offset);

        return Array.from({ length: 42 }, (_, index) => {
            return new Date(
                gridStart.getFullYear(),
                gridStart.getMonth(),
                gridStart.getDate() + index
            );
        });
    }, [viewDate]);

    const years = useMemo(() => {
        const currentYear = viewDate.getFullYear();
        const startYear = currentYear - 60;
        return Array.from({ length: 121 }, (_, index) => startYear + index);
    }, [viewDate]);

    const isDateDisabled = (date: Date) => {
        const iso = toISODate(date);
        if (min && iso < min) return true;
        if (max && iso > max) return true;
        return false;
    };

    const handleSelectDay = (date: Date) => {
        if (isDateDisabled(date)) return;

        setDraft(date);
        setViewDate(startOfMonth(date));
        setMonthOpen(false);
        setYearOpen(false);
    };

    const handleToday = () => {
        const current = new Date();
        if (isDateDisabled(current)) return;

        setDraft(current);
        setViewDate(startOfMonth(current));
        setMonthOpen(false);
        setYearOpen(false);
    };

    const handlePrevMonth = () => {
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleSelectMonth = (monthIndex: number) => {
        setViewDate((prev) => new Date(prev.getFullYear(), monthIndex, 1));
        setMonthOpen(false);
        setYearOpen(false);
    };

    const handleSelectYear = (year: number) => {
        setViewDate((prev) => new Date(year, prev.getMonth(), 1));
        setYearOpen(false);
        setMonthOpen(false);
    };

    const handleDone = () => {
        if (!draft || isDateDisabled(draft)) return;

        onChange?.(toISODate(draft));
        closeCalendar();
    };

    const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onChange?.('');
    };

    const triggerLabel = parsedValue
        ? `${parsedValue.getDate()} ${MONTH_SHORT[parsedValue.getMonth()]} ${parsedValue.getFullYear()}`
        : '';

    const headerLabel = draft
        ? `${DAY_NAMES[draft.getDay()]}, ${draft.getDate()} ${MONTH_NAMES[draft.getMonth()]} ${draft.getFullYear()}`
        : 'Pilih Tanggal';

    const panel = open
        ? createPortal(
              <div
                  ref={panelRef}
                  role="dialog"
                  aria-modal="false"
                  aria-label="Pilih tanggal"
                  onPointerDown={(event) => event.stopPropagation()}
                  onFocus={(event) => event.stopPropagation()}
                  className={cn(
                      'fixed z-[1000] animate-in fade-in rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.25)] duration-150 ease-out sm:p-5',
                      !coords.ready && 'invisible'
                  )}
                  style={{
                      top: coords.top,
                      left: coords.left,
                      width: coords.width,
                      pointerEvents: 'auto',
                  }}
              >
                  <div className="flex items-center justify-between gap-3">
                      <span className="text-[15px] font-bold leading-tight text-gray-900 sm:text-[17px]">
                          {headerLabel}
                      </span>
                      <button
                          type="button"
                          onClick={handleToday}
                          className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#901418] transition-colors hover:bg-[#fbe8e8]"
                      >
                          Today
                      </button>
                  </div>

                  <div className="my-3.5 h-px bg-gray-100" />

                  <div className="flex items-center gap-1.5">
                      <button
                          type="button"
                          onClick={handlePrevMonth}
                          aria-label="Bulan sebelumnya"
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                      >
                          <ChevronLeft className="size-4" />
                      </button>

                      <div className="relative min-w-0 flex-1">
                          <button
                              type="button"
                              onClick={() => {
                                  setMonthOpen((prev) => !prev);
                                  setYearOpen(false);
                              }}
                              aria-expanded={monthOpen}
                              className={cn(
                                  'flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 text-sm font-medium text-gray-900 transition-colors',
                                  monthOpen
                                      ? 'border-[#901418] ring-2 ring-[#901418]/15'
                                      : 'border-gray-200 hover:border-gray-300'
                              )}
                          >
                              <span className="truncate">
                                  {MONTH_NAMES[viewDate.getMonth()]}
                              </span>
                              <ChevronDown
                                  className={cn(
                                      'size-4 shrink-0 text-[#901418] transition-transform duration-200',
                                      monthOpen && 'rotate-180'
                                  )}
                              />
                          </button>

                          {monthOpen && (
                              <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-[232px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                                  {MONTH_NAMES.map((monthName, index) => {
                                      const selected = index === viewDate.getMonth();
                                      return (
                                          <button
                                              key={monthName}
                                              type="button"
                                              onClick={() => handleSelectMonth(index)}
                                              className={cn(
                                                  'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                                  selected
                                                      ? 'bg-[#fbe8e8] font-semibold text-[#901418]'
                                                      : 'text-gray-700 hover:bg-gray-50'
                                              )}
                                          >
                                              {monthName}
                                          </button>
                                      );
                                  })}
                              </div>
                          )}
                      </div>

                      <div className="relative w-[92px] shrink-0">
                          <button
                              type="button"
                              onClick={() => {
                                  setYearOpen((prev) => !prev);
                                  setMonthOpen(false);
                              }}
                              aria-expanded={yearOpen}
                              className={cn(
                                  'flex h-11 w-full items-center justify-between gap-1.5 rounded-xl border bg-white px-3 text-sm font-medium text-gray-900 transition-colors',
                                  yearOpen
                                      ? 'border-[#901418] ring-2 ring-[#901418]/15'
                                      : 'border-gray-200 hover:border-gray-300'
                              )}
                          >
                              <span>{viewDate.getFullYear()}</span>
                              <ChevronDown
                                  className={cn(
                                      'size-4 shrink-0 text-[#901418] transition-transform duration-200',
                                      yearOpen && 'rotate-180'
                                  )}
                              />
                          </button>

                          {yearOpen && (
                              <div
                                  ref={yearListRef}
                                  className="absolute right-0 top-full z-30 mt-1.5 max-h-[232px] w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
                              >
                                  {years.map((year) => {
                                      const selected = year === viewDate.getFullYear();
                                      return (
                                          <button
                                              key={year}
                                              type="button"
                                              data-selected={selected}
                                              onClick={() => handleSelectYear(year)}
                                              className={cn(
                                                  'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                                  selected
                                                      ? 'bg-[#fbe8e8] font-semibold text-[#901418]'
                                                      : 'text-gray-700 hover:bg-gray-50'
                                              )}
                                          >
                                              {year}
                                          </button>
                                      );
                                  })}
                              </div>
                          )}
                      </div>

                      <button
                          type="button"
                          onClick={handleNextMonth}
                          aria-label="Bulan berikutnya"
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                      >
                          <ChevronRight className="size-4" />
                      </button>
                  </div>

                  <div className="mt-4 grid grid-cols-7">
                      {WEEK_LABELS.map((label) => (
                          <span
                              key={label}
                              className="flex h-8 items-center justify-center text-xs font-semibold text-gray-500"
                          >
                              {label}
                          </span>
                      ))}
                  </div>

                  <div className="mt-1 grid grid-cols-7 gap-y-1">
                      {calendarDays.map((date) => {
                          const isCurrentMonth =
                              date.getMonth() === viewDate.getMonth() &&
                              date.getFullYear() === viewDate.getFullYear();
                          const isSelected = draft ? isSameDay(date, draft) : false;
                          const isToday = isSameDay(date, today);
                          const isDisabled = isDateDisabled(date);

                          return (
                              <button
                                  key={toISODate(date)}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => handleSelectDay(date)}
                                  className={cn(
                                      'relative mx-auto flex size-9 items-center justify-center rounded-lg text-sm transition-colors duration-150',
                                      isCurrentMonth ? 'text-gray-800' : 'text-gray-300',
                                      isSelected
                                          ? 'bg-[#901418] font-semibold text-white hover:bg-[#901418]'
                                          : 'hover:bg-[#fbe8e8] hover:text-[#901418]',
                                      isToday && !isSelected && 'font-semibold text-[#901418]',
                                      isDisabled &&
                                          'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-gray-300'
                                  )}
                              >
                                  {date.getDate()}
                                  {isToday && (
                                      <span
                                          className={cn(
                                              'absolute bottom-1 size-1 rounded-full',
                                              isSelected ? 'bg-white' : 'bg-[#901418]'
                                          )}
                                      />
                                  )}
                              </button>
                          );
                      })}
                  </div>

                  <div className="my-3.5 h-px bg-gray-100" />

                  <div className="flex items-center gap-3">
                      <button
                          type="button"
                          onClick={closeCalendar}
                          className="h-11 flex-1 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                      >
                          Cancel
                      </button>
                      <button
                          type="button"
                          onClick={handleDone}
                          disabled={!draft || isDateDisabled(draft)}
                          className="h-11 flex-1 rounded-xl bg-[#901418] text-sm font-semibold text-white transition-colors hover:bg-[#7a1013] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                          Done
                      </button>
                  </div>
              </div>,
              document.body
          )
        : null;

    return (
        <div className="relative w-full">
            <button
                ref={triggerRef}
                id={id}
                type="button"
                disabled={disabled}
                aria-label={ariaLabel}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => (open ? closeCalendar() : openCalendar())}
                className={cn(
                    'flex h-11 w-full items-center gap-2 rounded-xl border bg-white px-3.5 text-left text-sm transition-all',
                    open
                        ? 'border-[#901418] ring-2 ring-[#901418]/15'
                        : 'border-gray-200 hover:border-gray-300',
                    disabled && 'cursor-not-allowed opacity-60',
                    allowClear && parsedValue ? 'pr-10' : '',
                    className
                )}
            >
                <CalendarDays className="size-4 shrink-0 text-[#901418]" />
                <span
                    className={cn(
                        'min-w-0 flex-1 truncate',
                        parsedValue ? 'font-medium text-gray-900' : 'text-gray-400'
                    )}
                >
                    {parsedValue ? triggerLabel : placeholder}
                </span>
            </button>

            {allowClear && parsedValue && !disabled && (
                <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Hapus tanggal"
                    className="absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                    <X className="size-3.5" />
                </button>
            )}

            {panel}
        </div>
    );
}

export default DatePicker;
