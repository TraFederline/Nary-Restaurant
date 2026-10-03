import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Table, TableStatus } from '../types';
import {
  Plus,
  Users,
  Clock,
  DollarSign,
  Receipt,
  RotateCcw,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export const TablesPage: React.FC = () => {
  const {
    tables,
    activeOrders,
    settings,
    setActivePage,
    setSelectedTableForOrder,
    setPayingOrder,
    requestBill,
    resetTable,
    addTable,
    updateTable,
    deleteTable,
    t,
    language,
  } = usePOS();

  const [statusFilter, setStatusFilter] = useState<'ALL' | TableStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  // Form state for add/edit table
  const [formNumber, setFormNumber] = useState('');
  const [formCapacity, setFormCapacity] = useState('4');
  const [formZone, setFormZone] = useState('Main Dining');

  const filteredTables = tables.filter(table => {
    const matchesStatus = statusFilter === 'ALL' || table.status === statusFilter;
    const matchesSearch =
      table.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (table.zone && table.zone.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getElapsedTime = (isoString?: string) => {
    if (!isoString) return null;
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (mins < 60) return `${mins} ${language === 'km' ? 'នាទី' : 'mins'}`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  };

  const handleOpenAdd = () => {
    const nextNum = String(tables.length + 1).padStart(2, '0');
    setFormNumber(nextNum);
    setFormCapacity('4');
    setFormZone('Main Dining');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber) return;
    addTable({
      number: formNumber,
      capacity: Number(formCapacity) || 2,
      zone: formZone,
    });
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (table: Table) => {
    setEditingTable(table);
    setFormNumber(table.number);
    setFormCapacity(table.capacity.toString());
    setFormZone(table.zone || 'Main Dining');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;
    updateTable(editingTable.id, {
      number: formNumber,
      capacity: Number(formCapacity) || 2,
      zone: formZone,
    });
    setEditingTable(null);
  };

  // Counts for status tabs
  const availableCount = tables.filter(t => t.status === 'AVAILABLE').length;
  const occupiedCount = tables.filter(t => t.status === 'OCCUPIED').length;
  const billingCount = tables.filter(t => t.status === 'BILLING').length;
  const paidCount = tables.filter(t => t.status === 'PAID').length;

  return (
    <div className="space-y-6">
      {/* Top Controls: Status Tabs, Search & Add Table */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
        {/* Interactive Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-neutral-800/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.allTables} ({tables.length})
          </button>
          <button
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'AVAILABLE'
                ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{t.available} ({availableCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('OCCUPIED')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'OCCUPIED'
                ? 'bg-white dark:bg-neutral-900 text-red-700 dark:text-red-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>{t.occupied} ({occupiedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('BILLING')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'BILLING'
                ? 'bg-white dark:bg-neutral-900 text-amber-700 dark:text-amber-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{t.billingStatus} ({billingCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'PAID'
                ? 'bg-white dark:bg-neutral-900 text-blue-700 dark:text-blue-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{t.paid} ({paidCount})</span>
          </button>
        </div>

        {/* Right side: Search & Add */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchTableOrZone}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-slate-900 font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addTable}</span>
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map(table => {
          const activeOrder = activeOrders.find(o => o.tableId === table.id);
          const elapsedTime = getElapsedTime(table.orderStartedAt);

          return (
            <div
              key={table.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative group ${
                table.status === 'AVAILABLE'
                  ? 'bg-white dark:bg-neutral-900 border-emerald-200/80 dark:border-emerald-950 hover:border-emerald-400'
                  : table.status === 'OCCUPIED'
                  ? 'bg-white dark:bg-neutral-900 border-red-200/80 dark:border-red-950 hover:border-red-400'
                  : table.status === 'BILLING'
                  ? 'bg-white dark:bg-neutral-900 border-amber-300 dark:border-amber-900 ring-2 ring-amber-400/30'
                  : 'bg-white dark:bg-neutral-900 border-blue-200/80 dark:border-blue-950'
              }`}
            >
              {/* Card Top: Table Number & Status Badge */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {language === 'km' ? 'តុ' : 'Table'} {table.number}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-medium">
                      ({table.zone || 'Dining'})
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {table.status === 'AVAILABLE' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {t.available}
                      </span>
                    )}
                    {table.status === 'OCCUPIED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        {t.occupied}
                      </span>
                    )}
                    {table.status === 'BILLING' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {t.billingStatus}
                      </span>
                    )}
                    {table.status === 'PAID' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        {t.paid}
                      </span>
                    )}
                  </div>
                </div>

                {/* Table Details: Capacity, Guests, Order #, Total */}
                <div className="space-y-2 py-3 border-y border-slate-100 dark:border-neutral-800/80 text-xs">
                  {/* Capacity & Current Guests */}
                  <div className="flex items-center justify-between text-slate-600 dark:text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.capacity}:</span>
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-neutral-200">
                      {table.capacity} {t.seats}
                    </span>
                  </div>

                  {/* Active Guests Count */}
                  {table.status !== 'AVAILABLE' && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-neutral-400">
                      <span>{t.numberOfGuests}:</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400 font-mono">
                        {table.currentGuests || activeOrder?.guests || 2} {t.covers}
                      </span>
                    </div>
                  )}

                  {/* Order Number & Total */}
                  {activeOrder && (
                    <>
                      <div className="flex items-center justify-between text-slate-600 dark:text-neutral-400">
                        <span>{t.currentOrder}:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {activeOrder.orderNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-neutral-400">
                        <span>{t.currentTotal}:</span>
                        <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                          {settings.currencySymbol}{activeOrder.total.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Elapsed Dining Time */}
                  {elapsedTime && (
                    <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{t.diningTime}:</span>
                      </span>
                      <span className="font-mono text-[11px] font-medium">{elapsedTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons based on Workflow */}
              <div className="pt-4 flex flex-col gap-2">
                {table.status === 'AVAILABLE' && (
                  <button
                    onClick={() => {
                      setSelectedTableForOrder(table);
                      setActivePage('new-order');
                    }}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.startOrder}</span>
                  </button>
                )}

                {table.status === 'OCCUPIED' && activeOrder && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedTableForOrder(table);
                        setActivePage('new-order');
                      }}
                      className="py-2 px-2 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 font-semibold text-xs rounded-xl text-center cursor-pointer truncate"
                    >
                      {t.addItems}
                    </button>
                    <button
                      onClick={() => requestBill(activeOrder.id)}
                      className="py-2 px-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl text-center shadow-xs cursor-pointer truncate"
                    >
                      {t.requestBill}
                    </button>
                  </div>
                )}

                {table.status === 'BILLING' && activeOrder && (
                  <button
                    onClick={() => setPayingOrder(activeOrder)}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>{t.processPayment}</span>
                  </button>
                )}

                {table.status === 'PAID' && (
                  <button
                    onClick={() => resetTable(table.id)}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.resetTableToAvailable}</span>
                  </button>
                )}

                {/* Edit & Delete Quick Controls */}
                <div className="flex items-center justify-end gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(table)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 text-xs rounded cursor-pointer"
                    title={t.editTable}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {table.status === 'AVAILABLE' && (
                    <button
                      onClick={() => deleteTable(table.id)}
                      className="p-1 text-slate-400 hover:text-red-600 text-xs rounded cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.addNewTable}</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  {t.tableNumber}
                </label>
                <input
                  type="text"
                  value={formNumber}
                  onChange={e => setFormNumber(e.target.value)}
                  placeholder="09"
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  {t.capacityGuests}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formCapacity}
                  onChange={e => setFormCapacity(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  {t.zoneDiningArea}
                </label>
                <select
                  value={formZone}
                  onChange={e => setFormZone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  <option value="Main Dining">{language === 'km' ? 'សាលធំ (Main Dining)' : 'Main Dining'}</option>
                  <option value="Window Side">{language === 'km' ? 'ក្បែរបង្អួច (Window Side)' : 'Window Side'}</option>
                  <option value="Patio">{language === 'km' ? 'ខាងក្រៅ (Patio)' : 'Patio'}</option>
                  <option value="VIP Lounge">{language === 'km' ? 'បន្ទប់ VIP (VIP Lounge)' : 'VIP Lounge'}</option>
                  <option value="Bar Counter">{language === 'km' ? 'បារ (Bar Counter)' : 'Bar Counter'}</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl cursor-pointer"
                >
                  {t.saveTable}
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

      {/* Edit Table Modal */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.editTable} {editingTable.number}
              </h3>
              <button
                onClick={() => setEditingTable(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  {t.tableNumber}
                </label>
                <input
                  type="text"
                  value={formNumber}
                  onChange={e => setFormNumber(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  {t.capacityGuests}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formCapacity}
                  onChange={e => setFormCapacity(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  {t.zoneDiningArea}
                </label>
                <select
                  value={formZone}
                  onChange={e => setFormZone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  <option value="Main Dining">{language === 'km' ? 'សាលធំ (Main Dining)' : 'Main Dining'}</option>
                  <option value="Window Side">{language === 'km' ? 'ក្បែរបង្អួច (Window Side)' : 'Window Side'}</option>
                  <option value="Patio">{language === 'km' ? 'ខាងក្រៅ (Patio)' : 'Patio'}</option>
                  <option value="VIP Lounge">{language === 'km' ? 'បន្ទប់ VIP (VIP Lounge)' : 'VIP Lounge'}</option>
                  <option value="Bar Counter">{language === 'km' ? 'បារ (Bar Counter)' : 'Bar Counter'}</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl cursor-pointer"
                >
                  {t.updateTable}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTable(null)}
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
