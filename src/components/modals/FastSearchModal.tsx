import React, { useState, useEffect, useRef } from 'react';
import { Search, Phone, ArrowRight, X } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { useHotel } from '../../context/HotelContext';
import { Dialog, DialogContent } from '../ui/Dialog';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

export const FastSearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch, openFolio } = useModal();
  const { reservations } = useHotel();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'IN_HOUSE' | 'ARRIVALS' | 'DEPARTURES'>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Filter reservations
  const filteredReservations = reservations.filter(res => {
    // Filter by tab
    if (activeFilter === 'IN_HOUSE' && res.status !== 'CHECKED_IN') return false;
    if (activeFilter === 'ARRIVALS' && res.status !== 'RESERVED') return false;
    if (activeFilter === 'DEPARTURES' && res.status !== 'CHECKED_OUT') return false;

    // Filter by query
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      res.guestName.toLowerCase().includes(q) ||
      res.phone.includes(q) ||
      res.roomNumber.toLowerCase().includes(q) ||
      res.id.toLowerCase().includes(q) ||
      (res.email && res.email.toLowerCase().includes(q)) ||
      res.roomType.toLowerCase().includes(q)
    );
  });

  // Keyboard navigation inside search results (Up, Down, Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredReservations.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredReservations.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredReservations[selectedIndex];
      if (target) {
        closeSearch();
        openFolio(target);
      }
    }
  };

  return (
    <Dialog open={isSearchOpen} onOpenChange={(open) => !open && closeSearch()}>
      {/* Positioned at true screen center (top-[50%] translate-y-[-50%]) */}
      <DialogContent className="max-w-xl w-[92vw] sm:w-full bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)] p-0 overflow-hidden shadow-2xl rounded-2xl top-[50%] translate-y-[-50%] my-0">
        
        {/* SEARCH INPUT BAR */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--background)] space-y-3">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-[var(--primary)] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search Guest Name, Phone, Room #, or Booking ID..."
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-0 text-sm font-semibold focus:outline-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]">
              ESC
            </kbd>
          </div>

          {/* QUICK FILTER PILLS */}
          <div className="flex items-center gap-1.5 text-xs pt-1">
            {[
              { id: 'ALL', label: 'All Results' },
              { id: 'IN_HOUSE', label: 'In-House' },
              { id: 'ARRIVALS', label: 'Arrivals' },
              { id: 'DEPARTURES', label: 'Departures' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveFilter(tab.id as any);
                  setSelectedIndex(0);
                }}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer',
                  activeFilter === tab.id
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS LIST */}
        <div className="p-2 max-h-[55vh] overflow-y-auto space-y-1 text-left">
          {filteredReservations.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Search className="w-8 h-8 text-[var(--muted-foreground)] mx-auto opacity-40" />
              <p className="text-xs font-bold text-[var(--foreground)]">No matching bookings found</p>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Try searching for a room number like "101", guest name, or phone number.
              </p>
            </div>
          ) : (
            filteredReservations.map((res, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={res.id}
                  onClick={() => {
                    closeSearch();
                    openFolio(res);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group select-none',
                    isSelected
                      ? 'bg-[var(--primary)]/10 border-[var(--primary)] ring-1 ring-[var(--primary)]/30 shadow-xs'
                      : 'bg-transparent border-transparent hover:bg-[var(--muted)]/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 flex items-center justify-center font-extrabold text-xs shrink-0 font-mono shadow-xs">
                      #{res.roomNumber}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                          {res.guestName}
                        </p>
                        <span className="text-[10px] font-mono text-[var(--muted-foreground)] font-semibold">
                          ({res.id})
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[var(--primary)]" />
                          {res.phone}
                        </span>
                        <span>•</span>
                        <span>{res.roomType}</span>
                        <span>•</span>
                        <span className="font-mono">{res.checkIn} to {res.checkOut}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={res.status === 'CHECKED_IN' ? 'clean' : res.status === 'RESERVED' ? 'progress' : 'dirty'} className="text-[10px] uppercase font-bold">
                      {res.status === 'CHECKED_IN' ? 'In-House' : res.status === 'RESERVED' ? 'Arrival' : res.status}
                    </Badge>
                    <ArrowRight className={cn("w-4 h-4 transition-transform", isSelected ? "text-[var(--primary)] translate-x-1" : "text-[var(--muted-foreground)]")} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER KEYBOARD NAVIGATION HINT */}
        <div className="px-4 py-2.5 bg-[var(--muted)]/60 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] font-bold text-[10px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] font-bold text-[10px]">↵</kbd> Open Folio
            </span>
          </div>

          <span className="font-semibold text-[10px] text-[var(--foreground)]">
            {filteredReservations.length} result{filteredReservations.length !== 1 ? 's' : ''}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
