import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { MenuItem, MenuCategory } from '../types';
import { ImageUploader } from '../components/Menu/ImageUploader';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Utensils,
  DollarSign,
  X,
  Sparkles,
} from 'lucide-react';

const CATEGORIES: MenuCategory[] = [
  'All',
  'Burgers',
  'Pizza',
  'Rice',
  'Noodles',
  'Chicken',
  'Seafood',
  'Drinks',
  'Desserts',
];

export const MenuManagementPage: React.FC = () => {
  const {
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    settings,
    t,
    language,
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formNameKm, setFormNameKm] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDescKm, setFormDescKm] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState<Exclude<MenuCategory, 'All'>>('Burgers');
  const [formImage, setFormImage] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);

  const filteredItems = menuItems.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nameKm && item.nameKm.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryLabel = (cat: MenuCategory) => {
    switch (cat) {
      case 'All': return t.catAll;
      case 'Burgers': return t.catBurgers;
      case 'Pizza': return t.catPizza;
      case 'Rice': return t.catRice;
      case 'Noodles': return t.catNoodles;
      case 'Chicken': return t.catChicken;
      case 'Seafood': return t.catSeafood;
      case 'Drinks': return t.catDrinks;
      case 'Desserts': return t.catDesserts;
    }
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormNameKm('');
    setFormDesc('');
    setFormDescKm('');
    setFormPrice('5.00');
    setFormCategory('Burgers');
    setFormImage('');
    setFormAvailable(true);
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) return;
    addMenuItem({
      name: formName,
      nameKm: formNameKm || undefined,
      description: formDesc,
      descriptionKm: formDescKm || undefined,
      price: parseFloat(formPrice) || 0,
      category: formCategory,
      image: formImage || undefined,
      available: formAvailable,
    });
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormNameKm(item.nameKm || '');
    setFormDesc(item.description);
    setFormDescKm(item.descriptionKm || '');
    setFormPrice(item.price.toString());
    setFormCategory(item.category);
    setFormImage(item.image || '');
    setFormAvailable(item.available);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !formName || !formPrice) return;
    updateMenuItem(editingItem.id, {
      name: formName,
      nameKm: formNameKm || undefined,
      description: formDesc,
      descriptionKm: formDescKm || undefined,
      price: parseFloat(formPrice) || 0,
      category: formCategory,
      image: formImage || undefined,
      available: formAvailable,
    });
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Add Item Trigger */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wide">
            {t.menuCatalog}
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            {t.menuSubtitle}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNewMenuItem}</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar (Responsive Category Filtering) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
            {CATEGORIES.map(category => {
              const isSelected = selectedCategory === category;
              const count =
                category === 'All'
                  ? menuItems.length
                  : menuItems.filter(i => i.category === category).length;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-xs font-bold'
                      : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {getCategoryLabel(category)} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchMenuPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl bg-white dark:bg-neutral-900 border transition-all duration-200 flex flex-col justify-between group shadow-xs ${
              item.available
                ? 'border-slate-200 dark:border-neutral-800 hover:border-orange-400'
                : 'border-slate-200 dark:border-neutral-800 opacity-60'
            }`}
          >
            <div>
              {/* Image preview with fallback */}
              <div className="w-full h-40 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-neutral-800 relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-neutral-800">
                    <Utensils className="w-8 h-8 opacity-40 mb-1" />
                    <span className="text-[10px] font-semibold uppercase">{getCategoryLabel(item.category)}</span>
                  </div>
                )}

                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                  {getCategoryLabel(item.category)}
                </span>

                <button
                  onClick={() => toggleMenuItemAvailability(item.id)}
                  className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors backdrop-blur-xs cursor-pointer ${
                    item.available
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-red-500/90 text-white'
                  }`}
                  title="Toggle Availability"
                >
                  {item.available ? `● ${t.available}` : `○ ${language === 'km' ? 'អស់ពីស្តុក' : 'Sold Out'}`}
                </button>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                {language === 'km' ? (item.nameKm || item.name) : item.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                {language === 'km' ? (item.descriptionKm || item.description) : item.description}
              </p>
            </div>

            {/* Price & Action Controls */}
            <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                  {settings.currencySymbol}{item.price.toFixed(2)}
                </span>
                <div className="text-[10px] text-slate-400">
                  {item.available ? t.activeInPos : t.hiddenFromOrders}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'កែប្រែ' : 'Edit'}</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(t.confirmDelete)) {
                      deleteMenuItem(item.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 text-slate-400 text-xs">
          {t.noMenuItems}
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.addNewMenuItem}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  {t.itemName} (English)
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Garlic Butter Lobster"
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  {t.itemName} ({language === 'km' ? 'ភាសាខ្មែរ' : 'Khmer'})
                </label>
                <input
                  type="text"
                  value={formNameKm}
                  onChange={e => setFormNameKm(e.target.value)}
                  placeholder="ឧ. បង្កងឆាប៊័រខ្ទឹមស"
                  className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white font-khmer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    {t.category}
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>
                        {getCategoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    {t.price} ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  {t.description}
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Brief culinary description..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Image Uploader with local file picker, drag & drop, and preview */}
              <ImageUploader value={formImage} onChange={setFormImage} />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="add-avail"
                  checked={formAvailable}
                  onChange={e => setFormAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 cursor-pointer"
                />
                <label htmlFor="add-avail" className="font-semibold text-slate-700 dark:text-neutral-300 cursor-pointer">
                  {t.itemAvailableForOrdering}
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl cursor-pointer"
                >
                  {t.saveItem}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 rounded-xl cursor-pointer"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.editMenuItem}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  {t.itemName} (English)
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  {t.itemName} ({language === 'km' ? 'ភាសាខ្មែរ' : 'Khmer'})
                </label>
                <input
                  type="text"
                  value={formNameKm}
                  onChange={e => setFormNameKm(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white font-khmer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    {t.category}
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>
                        {getCategoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    {t.price} ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  {t.description}
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Image Uploader with local file picker, drag & drop, and preview */}
              <ImageUploader value={formImage} onChange={setFormImage} />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-avail"
                  checked={formAvailable}
                  onChange={e => setFormAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 cursor-pointer"
                />
                <label htmlFor="edit-avail" className="font-semibold text-slate-700 dark:text-neutral-300 cursor-pointer">
                  {t.itemAvailableForOrdering}
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl cursor-pointer"
                >
                  {t.updateItem}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="py-2.5 px-4 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 rounded-xl cursor-pointer"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
