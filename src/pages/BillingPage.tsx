import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import {
  Receipt,
  Users,
  Clock,
  DollarSign,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Order } from '../types';

export const BillingPage: React.FC = () => {
  const { activeOrders, setPayingOrder, settings, requestBill, t, language } = usePOS();
  const [filter, setFilter] = useState<'ALL' | 'BILL REQUESTED' | 'UNPAID'>('ALL');
  const [search, setSearch] = useState('');

  const filteredBills = activeOrders.filter(order => {
    const matchesFilter = filter === 'ALL' || order.status === filter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.tableNumber.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getElapsedTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (mins < 60) return `${mins} ${language === 'km' ? 'នាទី' : 'mins'}`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  };

  const billRequestedCount = activeOrders.filter(o => o.status === 'BILL REQUESTED').length;
  const totalBillsAmount = activeOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              {t.billingRegisterDesk}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            {t.billingSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {t.billsRequested}
            </span>
            <span className="font-mono text-xl font-extrabold text-amber-600 dark:text-amber-400">
              {billRequestedCount} {t.tables}
            </span>
          </div>

          <div className="text-right border-l border-slate-200 dark:border-neutral-700 pl-6">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {t.pendingVolume}
            </span>
            <span className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
              {settings.currencySymbol}{totalBillsAmount.toFixed(2)}
            </span>
          </div>
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
            {t.allPending} ({activeOrders.length})
          </button>
          <button
            onClick={() => setFilter('BILL REQUESTED')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'BILL REQUESTED'
                ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-neutral-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{t.billsRequested} ({billRequestedCount})</span>
          </button>
          <button
            onClick={() => setFilter('UNPAID')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'UNPAID'
                ? 'bg-white dark:bg-neutral-900 text-red-600 dark:text-red-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-neutral-400'
            }`}
          >
            <span>{t.eatingUnpaid} ({activeOrders.filter(o => o.status === 'UNPAID').length})</span>
          </button>
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'km' ? 'ស្វែងរកលេខកុម្ម៉ង់ ឬតុ...' : 'Search table or order...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Bills Table & Cards */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50/75 dark:bg-neutral-800/50 text-slate-500 dark:text-neutral-400 uppercase font-semibold tracking-wider">
                <th className="py-3.5 pl-6">{language === 'km' ? 'កុម្ម៉ង់' : 'Order'}</th>
                <th className="py-3.5 px-4">{t.tables}</th>
                <th className="py-3.5 px-4">{t.guests}</th>
                <th className="py-3.5 px-4">{t.orderTime}</th>
                <th className="py-3.5 px-4">{t.itemsSummary}</th>
                <th className="py-3.5 px-4 text-right">{t.totalAmount}</th>
                <th className="py-3.5 px-4 text-center">{language === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                <th className="py-3.5 pr-6 text-right">{t.processAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 font-medium">
              {filteredBills.map(order => {
                const isRequested = order.status === 'BILL REQUESTED';

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                      isRequested ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="py-4 pl-6 font-mono font-bold text-slate-900 dark:text-white">
                      {order.orderNumber}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-neutral-200">
                      {language === 'km' ? 'តុ' : 'Table'} {order.tableNumber}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-neutral-300">
                      <span className="flex items-center gap-1 font-mono">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {order.guests} {t.covers}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {getElapsedTime(order.createdAt)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-neutral-300 max-w-xs truncate">
                      {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                      {settings.currencySymbol}{order.total.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          isRequested
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 animate-pulse'
                            : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200'
                        }`}
                      >
                        {isRequested ? t.billRequested : t.unpaid}
                      </span>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isRequested && (
                          <button
                            onClick={() => requestBill(order.id)}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 font-semibold text-xs rounded-xl cursor-pointer"
                          >
                            {t.markBillReq}
                          </button>
                        )}
                        <button
                          onClick={() => setPayingOrder(order)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>{t.processPayment}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredBills.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-neutral-500 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            {t.noOpenBills}
          </div>
        )}
      </div>
    </div>
  );
};
