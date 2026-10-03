import React, { useState } from 'react';
import { Search, Phone, ArrowRight } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { useHotel } from '../../context/HotelContext';
import { Dialog, DialogContent } from '../ui/Dialog';
import { Badge } from '../ui/Badge';

export const FastSearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch, openFolio } = useModal();
  const { reservations } = useHotel();
  const [query, setQuery] = useState('');

  const filteredReservations = query.trim()
    ? reservations.filter(
        res =>
          res.guestName.toLowerCase().includes(query.toLowerCase()) ||
          res.phone.includes(query) ||
          res.roomNumber.includes(query) ||
          res.id.toLowerCase().includes(query.toLowerCase())
      )
    : reservations;

  return (
    <Dialog open={isSearchOpen} onOpenChange={(open) => !open && closeSearch()}>
      <DialogContent className="max-w-xl bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)] p-0 overflow-hidden shadow-2xl top-[30%]">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--background)]">
          <Search className="w-5 h-5 text-[var(--primary)] shrink-0" />
          <input
            type="text"
            placeholder="Type Guest Name, Phone, Room #, or Booking ID..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent border-0 text-sm focus:outline-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            autoFocus
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]">
            ESC
          </kbd>
        </div>

        <div className="p-2 max-h-[60vh] overflow-y-auto space-y-1">
          {filteredReservations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
              No matching guests or bookings found for "{query}".
            </div>
          ) : (
            filteredReservations.map(res => (
              <div
                key={res.id}
                onClick={() => {
                  closeSearch();
                  openFolio(res);
                }}
                className="p-3 rounded-lg hover:bg-[var(--muted)] border border-transparent hover:border-[var(--border)] transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-xs">
                    {res.roomNumber}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                      {res.guestName} <span className="text-[10px] font-mono text-[var(--muted-foreground)]">({res.id})</span>
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-2">
                      <span><Phone className="w-2.5 h-2.5 inline mr-0.5" />{res.phone}</span>
                      <span>•</span>
                      <span>{res.roomType}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={res.status === 'CHECKED_IN' ? 'clean' : 'dirty'} className="text-[10px]">
                    {res.status}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
