import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  X,
} from 'lucide-react';
import { usePos } from '../../hooks/usePos';
import { DietaryDot } from './PosTerminalPage';
import type { PosMenuItem, DietaryType, KitchenStation } from '../../types/pos';

export const MenuManagementPage: React.FC = () => {
  const { categories, menuItems, toggleItemAvailability } = usePos();

  const [activeCategoryId, setActiveCategoryId] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Add Dish
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('290');
  const [newCategory, setNewCategory] = useState<number>(1);
  const [newItemType, setNewItemType] = useState<DietaryType>('VEG');
  const [newStation, setNewStation] = useState<KitchenStation>('KITCHEN');
  const [newPrepTime, setNewPrepTime] = useState('15');

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (activeCategoryId !== 'ALL' && item.categoryId !== activeCategoryId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [menuItems, activeCategoryId, searchQuery]);

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem: PosMenuItem = {
      id: Date.now(),
      categoryId: newCategory,
      categoryName: categories.find(c => c.id === newCategory)?.name,
      name: newName.trim(),
      description: newDesc.trim() || 'Chef freshly prepared recipe.',
      price: parseFloat(newPrice) || 250,
      taxRate: 5.0,
      itemType: newItemType,
      station: newStation,
      prepTimeMinutes: parseInt(newPrepTime) || 15,
      isAvailable: true,
      displayOrder: menuItems.length + 1,
    };

    menuItems.push(newItem);
    localStorage.setItem('deskfloow_pos_menu_items', JSON.stringify(menuItems));

    setIsAddModalOpen(false);
    setNewName('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* ─── PAGE HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Menu &amp; Pricing
            </h1>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Menu engineering, pricing, dietary indicators &amp; live 86 (Out of Stock) toggles
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white shadow-md hover:opacity-90 transition-opacity cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* ─── FILTERS STRIP ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategoryId('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategoryId === 'ALL'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            All Categories ({menuItems.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategoryId === cat.id
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-xs sm:w-72">
          <Search className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search dish by name..."
            className="w-full bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none"
          />
        </div>
      </div>

      {/* ─── DISHES TABLE ────────────────────────────────────────────────────── */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--muted)]/50 border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Tax (GST)</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Prep Time</th>
                <th className="py-3 px-4 text-center">86 / In Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                  {/* Name & Type */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        <DietaryDot type={item.itemType} />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--foreground)] text-xs leading-snug">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1 max-w-sm mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 font-semibold text-[var(--muted-foreground)]">
                    {item.categoryName || 'General'}
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 font-black text-[var(--foreground)] text-sm">
                    ₹{item.price.toFixed(2)}
                  </td>

                  {/* Tax */}
                  <td className="py-3.5 px-4 font-mono text-[var(--muted-foreground)]">
                    {item.taxRate}%
                  </td>

                  {/* Station */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]">
                      {item.station}
                    </span>
                  </td>

                  {/* Prep Time */}
                  <td className="py-3.5 px-4 font-semibold text-[var(--foreground)]">
                    {item.prepTimeMinutes} mins
                  </td>

                  {/* 86 Out of Stock Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleItemAvailability(item.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                        item.isAvailable
                          ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-rose-500/15 text-rose-600 border-rose-500/30 hover:bg-rose-500/25'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock' : '86 Out of Stock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── ADD NEW DISH MODAL ──────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/40">
              <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--primary)]" />
                Add New Menu Dish
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tandoori Soya Chaap"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, marinade, preparation style..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--foreground)] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--foreground)] shadow-xs outline-none focus:border-[var(--primary)] cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--foreground)] mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--foreground)] shadow-xs outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-[var(--foreground)] mb-1">Type</label>
                  <select
                    value={newItemType}
                    onChange={e => setNewItemType(e.target.value as DietaryType)}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--foreground)] shadow-xs outline-none focus:border-[var(--primary)] cursor-pointer"
                  >
                    <option value="VEG">Veg</option>
                    <option value="NON_VEG">Non-Veg</option>
                    <option value="EGG">Egg</option>
                    <option value="BEVERAGE">Beverage</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--foreground)] mb-1">Station</label>
                  <select
                    value={newStation}
                    onChange={e => setNewStation(e.target.value as KitchenStation)}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--foreground)] shadow-xs outline-none focus:border-[var(--primary)] cursor-pointer"
                  >
                    <option value="KITCHEN">Kitchen</option>
                    <option value="BAR">Bar</option>
                    <option value="PANTRY">Pantry</option>
                    <option value="BAKERY">Bakery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--foreground)] mb-1">Prep (min)</label>
                  <input
                    type="number"
                    value={newPrepTime}
                    onChange={e => setNewPrepTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[var(--primary)] text-white shadow-md hover:opacity-90"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
