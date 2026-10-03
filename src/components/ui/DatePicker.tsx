import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface DatePickerProps {
  value: string; // ISO date format YYYY-MM-DD
  onChange: (date: string) => void;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, className }) => {
  const [open, setOpen] = useState(false);

  // Parse input date YYYY-MM-DD
  const selectedDate = new Date(value || '2026-09-24');
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar days logic
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleSelectDay = (dayNum: number) => {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = dayNum.toString().padStart(2, '0');
    const formatted = `${year}-${monthStr}-${dayStr}`;
    onChange(formatted);
    setOpen(false);
  };

  const formattedDisplay = selectedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 h-8 px-3 rounded-lg border border-[var(--input)] bg-[var(--background)] text-xs font-semibold text-[var(--foreground)] hover:border-[var(--ring)] hover:bg-[var(--muted)] transition-all cursor-pointer shadow-sm select-none',
            className
          )}
        >
          {/* Calendar Icon - High contrast in both light & dark modes using primary token */}
          <CalendarIcon className="w-4 h-4 text-[var(--primary)] shrink-0" />
          <span>{formattedDisplay}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-64 p-3 bg-[var(--popover)] text-[var(--popover-foreground)] border border-[var(--border)] shadow-2xl">
        {/* Calendar Month Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[var(--foreground)]">
            {monthNames[month]} {year}
          </span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-6 w-6 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-6 w-6 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[var(--muted-foreground)] mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {/* Empty padding cells */}
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <span key={`empty-${i}`} />
          ))}

          {/* Day number cells */}
          {[...Array(daysInMonth)].map((_, i) => {
            const dayNum = i + 1;
            const isSelected =
              selectedDate.getFullYear() === year &&
              selectedDate.getMonth() === month &&
              selectedDate.getDate() === dayNum;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => handleSelectDay(dayNum)}
                className={cn(
                  'h-7 w-7 rounded-md font-medium text-xs flex items-center justify-center transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-[var(--primary)] text-white font-bold shadow-sm'
                    : 'hover:bg-[var(--muted)] text-[var(--foreground)]'
                )}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
