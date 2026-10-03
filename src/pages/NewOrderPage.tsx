import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { MenuItem, MenuCategory, OrderItem, Table } from '../types';
import {
  Users,
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
  Utensils,
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

export const NewOrderPage: React.FC = () => {
  const {
    tables,
    menuItems,
    activeOrders,
    selectedTableForOrder,
    setSelectedTableForOrder,
    createOrder,
    addItemsToOrder,
    setActivePage,
    settings,
    t,
    language,
  } = usePOS();

  // State
  const [selectedTableId, setSelectedTableId] = useState<string>(
    selectedTableForOrder ? selectedTableForOrder.id : ''
  );
  const [guestCount, setGuestCount] = useState<number>(
    selectedTableForOrder?.currentGuests || selectedTableForOrder?.capacity || 2
  );
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Check if selected table already has an active order (Adding more food)
  const currentTable = tables.find(t => t.id === selectedTableId);
  const existingOrder = activeOrders.find(o => o.tableId === selectedTableId);

  useEffect(() => {
    if (selectedTableForOrder) {
      setSelectedTableId(selectedTableForOrder.id);
      setGuestCount(selectedTableForOrder.currentGuests || selectedTableForOrder.capacity || 2);
    } else {
      // Default to first available table if none selected
      const firstAvailable = tables.find(t => t.status === 'AVAILABLE');
      if (firstAvailable) {
        setSelectedTableId(firstAvailable.id);
        setGuestCount(firstAvailable.capacity);
      }
    }
  }, [selectedTableForOrder, tables]);

  // Handle table switch
  const handleTableChange = (tableId: string) => {
    setSelectedTableId(tableId);
    const table = tables.find(t => t.id === tableId);
    if (table) {
      setGuestCount(table.currentGuests || table.capacity);
    }
  };

  // Filtered menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const handleAddItem = (item: MenuItem) => {
    if (!item.available) return;

    setCartItems(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i =>
          i.menuItemId === item.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                itemTotal: Math.round((i.quantity + 1) * i.price * 100) / 100,
              }
            : i
        );
      }
      const newItem: OrderItem = {
        id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuItemId: item.id,
        name: language === 'km' ? (item.nameKm || item.name) : item.name,
        price: item.price,
        quantity: 1,
        itemTotal: item.price,
      };
      return [...prev, newItem];
    });
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              itemTotal: Math.round(newQty * item.price * 100) / 100,
            };
          }
          return item;
        })
        .filter((item): item is OrderItem => item !== null)
    );
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setCartItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Calculations
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);
  const cartTax = Math.round(cartSubtotal * settings.taxRate * 100) / 100;
  const cartTotal = Math.round((cartSubtotal + cartTax) * 100) / 100;

  // Submit Order
  const handleConfirmOrder = () => {
    if (!selectedTableId) {
      alert(language === 'km' ? 'សូមជ្រើសរើសតុអាហារជាមុនសិន។' : 'Please select a dining table first.');
      return;
    }
    if (cartItems.length === 0) {
      alert(language === 'km' ? 'សូមជ្រើសរើសមុខម្ហូបយ៉ាងហោចណាស់មួយមុខ។' : 'Please select at least one menu item.');
      return;
    }

    if (existingOrder) {
      // Append to existing order
      addItemsToOrder(existingOrder.id, cartItems);
      setOrderSuccess(
        language === 'km'
          ? `បានបន្ថែម ${cartItems.length} មុខម្ហូបទៅលើ តុ ${currentTable?.number} រួចរាល់!`
          : `Added ${cartItems.length} items to Table ${currentTable?.number}'s order!`
      );
    } else {
      // Create new order with guest count
      const created = createOrder(selectedTableId, guestCount, cartItems);
      setOrderSuccess(
        language === 'km'
          ? `ការកុម្ម៉ង់ ${created.orderNumber} សម្រាប់តុ ${created.tableNumber} បានបញ្ជូនទៅផ្ទះបាយ! ស្ថានភាព៖ មិនទាន់គិតលុយ`
          : `Order ${created.orderNumber} for Table ${created.tableNumber} sent to kitchen! Status: UNPAID`
      );
    }

    setCartItems([]);
    setSelectedTableForOrder(null);

    setTimeout(() => {
      setActivePage('active-orders');
    }, 250);
  };

  const getCategoryLabel = (cat: MenuCategory) => {
    switch (cat) {
      case 'All':
        return t.catAll;
      case 'Burgers':
        return t.catBurgers;
      case 'Pizza':
        return t.catPizza;
      case 'Rice':
        return t.catRice;
      case 'Noodles':
        return t.catNoodles;
      case 'Chicken':
        return t.catChicken;
      case 'Seafood':
        return t.catSeafood;
      case 'Drinks':
        return t.catDrinks;
      case 'Desserts':
        return t.catDesserts;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner / Table & Guest Setup Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Table Selector */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              {t.selectDiningTable}
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedTableId}
                onChange={e => handleTableChange(e.target.value)}
                className="py-2 px-3 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="" disabled>
                  -- {t.selectDiningTable} --
                </option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    {language === 'km' ? 'តុ' : 'Table'} {table.number} ({table.capacity} {t.seats}) —{' '}
                    {table.status === 'AVAILABLE'
                      ? t.available
                      : table.status === 'OCCUPIED'
                      ? t.occupied
                      : table.status === 'BILLING'
                      ? t.billingStatus
                      : t.paid}
                  </option>
                ))}
              </select>

              {currentTable && (
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    currentTable.status === 'AVAILABLE'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                  }`}
                >
                  {currentTable.status === 'AVAILABLE' ? t.readyForGuests : t.occupiedTable}
                </span>
              )}
            </div>
          </div>

          {/* Number of Guests Field (Required Feature) */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              {t.numberOfGuests}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={guestCount}
                  onChange={e => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-28 pl-9 pr-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>
              <span className="text-xs text-slate-400 dark:text-neutral-500">{t.covers}</span>
            </div>
          </div>
        </div>

        {/* Existing order hint */}
        {existingOrder && (
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              {language === 'km'
                ? `សម្គាល់៖ តុ ${currentTable?.number} មានការកុម្ម៉ង់បើកស្រាប់ (${existingOrder.orderNumber}, ${settings.currencySymbol}${existingOrder.total.toFixed(2)})។ មុខម្ហូបថ្មីនឹងត្រូវបន្ថែមលើវិក្កយបត្រនេះ។`
                : `Note: Table ${currentTable?.number} already has active order ${existingOrder.orderNumber} (${settings.currencySymbol}${existingOrder.total.toFixed(2)}). New items will be added to this open bill.`}
            </span>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {orderSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{orderSuccess}</span>
        </div>
      )}

      {/* Two-Column Workspace: Menu Catalog (Left ~65%) & Order Ticket (Right ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Menu Catalog with Responsive Category Filtering */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Category Filter Tabs (Responsive) & Search */}
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchFoodDrinks}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              />
            </div>

            {/* Category Tabs: responsive scrollbar / wrap */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map(category => {
                const isSelected = selectedCategory === category;
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
                    {getCategoryLabel(category)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredMenuItems.map(item => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between group ${
                  item.available
                    ? 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md'
                    : 'bg-slate-50 dark:bg-neutral-900/50 border-slate-200 dark:border-neutral-800 opacity-60'
                }`}
              >
                <div>
                  {/* Food Image with Fallback */}
                  <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-neutral-800 relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-900">
                        <Utensils className="w-7 h-7 mb-1 opacity-40" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                    )}
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                      {item.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                    {language === 'km' ? (item.nameKm || item.name) : item.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                    {language === 'km' ? (item.descriptionKm || item.description) : item.description}
                  </p>
                </div>

                {/* Price & Add Button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800">
                  <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                    {settings.currencySymbol}{item.price.toFixed(2)}
                  </span>

                  <button
                    onClick={() => handleAddItem(item)}
                    disabled={!item.available}
                    className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'ថែម' : 'Add'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredMenuItems.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 text-slate-400 text-xs">
              {language === 'km'
                ? 'មិនមានមុខម្ហូបត្រូវគ្នានឹងការស្វែងរក ឬប្រភេទដែលបានជ្រើសរើសឡើយ។'
                : 'No menu items match your search or selected category.'}
            </div>
          )}
        </div>

        {/* Right Column: Order Ticket / Cart (sticky on desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-22">
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-lg overflow-hidden flex flex-col">
            {/* Ticket Header */}
            <div className="p-4 bg-slate-900 dark:bg-black text-white border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold block">
                  {t.dineInTicket}
                </span>
                <div className="text-base font-extrabold mt-0.5">
                  {language === 'km' ? 'តុ' : 'Table'} {currentTable?.number || '??'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-amber-300 font-semibold font-mono">
                  {guestCount} {t.covers}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  {cartItems.length} {language === 'km' ? 'មុខ' : 'items'}
                </span>
              </div>
            </div>

            {/* Ticket Notice: Customer orders -> Eats -> UNPAID */}
            <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{t.workflowNotice}</span>
            </div>

            {/* Cart Items List */}
            <div className="p-4 overflow-y-auto max-h-[380px] space-y-3 divide-y divide-slate-100 dark:divide-neutral-800">
              {cartItems.map(item => (
                <div key={item.id} className="pt-2 first:pt-0 space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-neutral-200">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {settings.currencySymbol}{item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {settings.currencySymbol}{item.itemTotal.toFixed(2)}
                    </div>
                  </div>

                  {/* Qty controls & note */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <input
                      type="text"
                      placeholder={t.specialNotes}
                      value={item.notes || ''}
                      onChange={e => handleUpdateNotes(item.id, e.target.value)}
                      className="text-[11px] py-1 px-2 flex-1 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-700 dark:text-neutral-300 placeholder-slate-400 focus:outline-none"
                    />

                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-800 rounded-lg p-0.5">
                      <button
                        onClick={() => handleUpdateQty(item.id, -1)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-neutral-700 text-slate-600 dark:text-neutral-300 text-xs font-bold cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-slate-800 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.id, 1)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-neutral-700 text-slate-600 dark:text-neutral-300 text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="w-5 h-5 flex items-center justify-center rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {cartItems.length === 0 && (
                <div className="text-center py-10 text-slate-400 dark:text-neutral-500 text-xs">
                  <Utensils className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  {language === 'km'
                    ? 'មិនទាន់មានមុខម្ហូបក្នុងសន្លឹកកុម្ម៉ង់ឡើយ។\nសូមចុចលើមុខម្ហូបនៅខាងឆ្វេងដើម្បីបន្ថែម។'
                    : 'Your dining ticket is empty.\nSelect menu items from the left to add.'}
                </div>
              )}
            </div>

            {/* Calculations & Order Status Notice */}
            <div className="p-4 bg-slate-50 dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-neutral-400">
                <span>{t.subtotal}</span>
                <span className="font-mono">{settings.currencySymbol}{cartSubtotal.toFixed(2)}</span>
              </div>
              {cartTax > 0 && (
                <div className="flex justify-between text-slate-500 dark:text-neutral-400">
                  <span>{t.tax} ({Math.round(settings.taxRate * 100)}%)</span>
                  <span className="font-mono">{settings.currencySymbol}{cartTax.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 dark:border-neutral-700 flex justify-between text-base font-extrabold text-slate-900 dark:text-white">
                <span>{t.currentTotal}</span>
                <span className="font-mono text-orange-600 dark:text-orange-400">
                  {settings.currencySymbol}{cartTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                <span>{language === 'km' ? 'ស្ថានភាព៖' : 'Payment Status:'}</span>
                <span className="font-mono font-bold text-red-600 dark:text-red-400">
                  {t.paymentStatusUnpaid}
                </span>
              </div>

              {/* Confirm / Send Order Button */}
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={cartItems.length === 0 || !selectedTableId}
                className="w-full py-3.5 px-4 mt-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-sm tracking-wide uppercase rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>
                  {existingOrder
                    ? `${t.sendAdditionalItems} (${settings.currencySymbol}${cartTotal.toFixed(2)})`
                    : `${t.confirmDineInOrder} (${settings.currencySymbol}${cartTotal.toFixed(2)})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
