import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Order, OrderStatus } from '../types';
import {
  Clock,
  Users,
  Receipt,
  Utensils,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Search,
  Filter,
} from 'lucide-react';

export const ActiveOrdersPage: React.FC = () => {
  const {
    activeOrders,
    tables,
    settings,
    requestBill,
    setPayingOrder,
    setActivePage,
    setSelectedTableForOrder,
    t,
    language,
  } = usePOS();

  const [filter, setFilter] = useState<'ALL' | 'UNPAID' | 'BILL REQUESTED'>('ALL');
  const [search, setSearch] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = activeOrders.filter(order => {
    const matchesFilter = filter === 'ALL' || order.status === filter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.tableNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getElapsedTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (mins < 60) return `${mins} ${language === 'km' ? 'នាទី' : 'minutes'}`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  };

  const totalOwed = activeOrders.reduce((sum, o) => sum + o.total, 0);

  const handleAddItems = (order: Order) => {
    const table = tables.find(t => t.id === order.tableId);
    if (table) {
      setSelectedTableForOrder(table);
      setActivePage('new-order');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              {t.outstandingDiningBills}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            {t.outstandingSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">
              {t.totalOutstanding}
            </span>
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-red-600 dark:text-red-400">
              {settings.currencySymbol}{totalOwed.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => setActivePage('billing')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>{t.goToBilling}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-neutral-400'
            }`}
          >
            {t.allActive} ({activeOrders.length})
          </button>
          <button
            onClick={() => setFilter('UNPAID')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'UNPAID'
                ? 'bg-white dark:bg-neutral-900 text-red-600 dark:text-red-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-neutral-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>{t.eatingUnpaid} ({activeOrders.filter(o => o.status === 'UNPAID').length})</span>
          </button>
          <button
            onClick={() => setFilter('BILL REQUESTED')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'BILL REQUESTED'
                ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-neutral-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{t.billsRequested} ({activeOrders.filter(o => o.status === 'BILL REQUESTED').length})</span>
          </button>
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'km' ? 'ស្វែងរកលេខកុម្ម៉ង់ តុ មុខម្ហូប...' : 'Search order #, table, item...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredOrders.map(order => {
          const isExpanded = expandedOrderId === order.id;
          const isBillReq = order.status === 'BILL REQUESTED';

          return (
            <div
              key={order.id}
              className={`p-5 rounded-2xl bg-white dark:bg-neutral-900 border transition-all duration-200 flex flex-col justify-between shadow-xs ${
                isBillReq
                  ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20'
                  : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header: Table, Order #, Status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
                  <div>
                    <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {language === 'km' ? 'តុ' : 'Table'} {order.tableNumber}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-400 dark:text-neutral-500">
                      {language === 'km' ? 'កុម្ម៉ង់' : 'Order'} {order.orderNumber}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      isBillReq
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 animate-pulse'
                        : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200'
                    }`}
                  >
                    {isBillReq ? t.billRequested : t.unpaid}
                  </span>
                </div>

                {/* Key Details (Guests, Elapsed Time, Total) */}
                <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-100 dark:border-neutral-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      {t.guests}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-neutral-200 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {order.guests} {t.covers}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      {t.diningTime}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-neutral-200 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {getElapsedTime(order.createdAt)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      {t.currentTotal}
                    </span>
                    <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white block mt-0.5">
                      {settings.currencySymbol}{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="py-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase">
                    <span>{t.orderedDishes} ({order.items.reduce((s, i) => s + i.quantity, 0)})</span>
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                    >
                      {isExpanded ? t.collapse : t.viewBreakdown}
                    </button>
                  </div>

                  <div className="space-y-1">
                    {(isExpanded ? order.items : order.items.slice(0, 3)).map(item => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-700 dark:text-neutral-300">
                          {item.name} <span className="text-slate-400">×{item.quantity}</span>
                        </span>
                        <span className="font-mono text-slate-800 dark:text-neutral-200 font-semibold">
                          {settings.currencySymbol}{item.itemTotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {!isExpanded && order.items.length > 3 && (
                      <div className="text-[11px] text-slate-400 italic">
                        +{order.items.length - 3} {language === 'km' ? 'មុខផ្សេងទៀត...' : 'more items...'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons as described in section 10: [View Order] [Request Bill] */}
              <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddItems(order)}
                    className="py-2 px-3 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addFood}</span>
                  </button>

                  {!isBillReq ? (
                    <button
                      onClick={() => requestBill(order.id)}
                      className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{t.requestBill}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setPayingOrder(order)}
                      className="py-2 px-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{t.processPay}</span>
                    </button>
                  )}
                </div>

                {/* Quick Payment Shortcut */}
                {!isBillReq && (
                  <button
                    onClick={() => setPayingOrder(order)}
                    className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{t.instantCheckout}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 text-slate-400 space-y-2">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {t.noActiveOrders}
          </h3>
          <p className="text-xs max-w-sm mx-auto">
            {t.allTablesSettled}
          </p>
        </div>
      )}
    </div>
  );
};
