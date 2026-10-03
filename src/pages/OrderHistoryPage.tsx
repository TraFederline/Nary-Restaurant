import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Order } from '../types';
import {
  Search,
  Filter,
  Printer,
  Eye,
  Calendar,
  Users,
  DollarSign,
  Download,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export const OrderHistoryPage: React.FC = () => {
  const { orderHistory, setViewReceiptOrder, settings, t, language } = usePOS();
  const [search, setSearch] = useState('');
  const [selectedTable, setSelectedTable] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);

  // Unique tables list for filtering
  const tableNumbers = Array.from(new Set(orderHistory.map(o => o.tableNumber))).sort();

  const filteredHistory = orderHistory.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.tableNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()));

    const matchesTable = selectedTable === 'ALL' || order.tableNumber === selectedTable;

    // Date filtering (today, this week, all)
    let matchesDate = true;
    if (dateFilter === 'TODAY') {
      const orderDate = new Date(order.createdAt).toDateString();
      const todayDate = new Date().toDateString();
      matchesDate = orderDate === todayDate;
    }

    return matchesSearch && matchesTable && matchesDate;
  });

  const totalSettledRevenue = filteredHistory.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wide">
            {t.settledLedger}
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            {t.settledSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {t.totalSettledOrders}
            </span>
            <span className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
              {filteredHistory.length} {t.bills}
            </span>
          </div>

          <div className="text-right border-l border-slate-200 dark:border-neutral-700 pl-6">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {t.collectedRevenue}
            </span>
            <span className="font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {settings.currencySymbol}{totalSettledRevenue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Table Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{t.filterByTable}:</span>
            <select
              value={selectedTable}
              onChange={e => setSelectedTable(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-slate-800 dark:text-neutral-200"
            >
              <option value="ALL">{t.allTables}</option>
              {tableNumbers.map(num => (
                <option key={num} value={num}>
                  {language === 'km' ? 'តុ' : 'Table'} {num}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{t.filterByDate}:</span>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-slate-800 dark:text-neutral-200"
            >
              <option value="ALL">{t.allDates}</option>
              <option value="TODAY">{t.todayOnly}</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchOrderHistory}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50/75 dark:bg-neutral-800/50 text-slate-500 dark:text-neutral-400 uppercase font-semibold tracking-wider">
                <th className="py-3.5 pl-6">{t.orderNumberLabel}</th>
                <th className="py-3.5 px-4">{t.filterByTable}</th>
                <th className="py-3.5 px-4">{t.dateAndTime}</th>
                <th className="py-3.5 px-4">{t.guests}</th>
                <th className="py-3.5 px-4">{t.orderedDishes}</th>
                <th className="py-3.5 px-4 text-right">{t.totalSettled}</th>
                <th className="py-3.5 px-4 text-right">{t.cashReceived}</th>
                <th className="py-3.5 px-4 text-right">{t.changeGiven}</th>
                <th className="py-3.5 px-4">{t.staff}</th>
                <th className="py-3.5 px-4 text-center">{t.itemStatus}</th>
                <th className="py-3.5 pr-6 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 font-medium">
              {filteredHistory.map(order => {
                const dateObj = new Date(order.paymentDetails?.paidAt || order.createdAt);
                const dateStr = dateObj.toLocaleDateString(language === 'km' ? 'km-KH' : 'en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-4 pl-6 font-mono font-bold text-slate-900 dark:text-white">
                      {order.orderNumber}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-neutral-200">
                      {language === 'km' ? 'តុ' : 'Table'} {order.tableNumber}
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-neutral-400">
                      <div>{dateStr}</div>
                      <div className="text-[10px] text-slate-400">{timeStr}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-700 dark:text-neutral-300 font-mono">
                      {order.guests} {language === 'km' ? 'នាក់' : 'pers.'}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-neutral-300 max-w-[160px] truncate">
                      {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                      {settings.currencySymbol}{order.total.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {settings.currencySymbol}{order.paymentDetails?.cashReceived.toFixed(2) || order.total.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-600 dark:text-neutral-400">
                      {settings.currencySymbol}{order.paymentDetails?.changeGiven.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-neutral-400">
                      {order.paymentDetails?.processedBy || t.admin}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {order.status === 'PAID' ? t.paid : order.status}
                      </span>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectOrder(order)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
                          title={t.inspect}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewReceiptOrder(order)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-neutral-800 hover:bg-orange-600 hover:text-white text-slate-700 dark:text-neutral-300 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{t.receipt}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-neutral-500 text-xs">
            {t.noSettledOrders}
          </div>
        )}
      </div>

      {/* Inspect Order Details Modal */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.orderBreakdown} {inspectOrder.orderNumber}
                </h3>
                <span className="text-xs text-slate-400">
                  {language === 'km' ? 'តុ' : 'Table'} {inspectOrder.tableNumber} · {inspectOrder.guests} {language === 'km' ? 'នាក់' : t.guests}
                </span>
              </div>
              <button
                onClick={() => setInspectOrder(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto text-xs divide-y divide-slate-100 dark:divide-neutral-800">
              {inspectOrder.items.map(i => (
                <div key={i.id} className="pt-2 first:pt-0 flex justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-neutral-200">
                      {i.name}
                    </div>
                    {i.notes && <div className="text-[10px] text-amber-600">Note: {i.notes}</div>}
                    <div className="text-slate-400 text-[11px]">
                      {i.quantity} × {settings.currencySymbol}{i.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    {settings.currencySymbol}{i.itemTotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-500">
                <span>{t.subtotal}:</span>
                <span>{settings.currencySymbol}{inspectOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm pt-1 border-t border-slate-200 dark:border-neutral-700">
                <span>{t.totalSettled}:</span>
                <span>{settings.currencySymbol}{inspectOrder.total.toFixed(2)}</span>
              </div>
              {inspectOrder.paymentDetails && (
                <>
                  <div className="flex justify-between text-emerald-600 pt-1">
                    <span>{t.cashReceived}:</span>
                    <span>{settings.currencySymbol}{inspectOrder.paymentDetails.cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                    <span>{t.changeGiven}:</span>
                    <span>{settings.currencySymbol}{inspectOrder.paymentDetails.changeGiven.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setViewReceiptOrder(inspectOrder);
                  setInspectOrder(null);
                }}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printReceipt}</span>
              </button>
              <button
                onClick={() => setInspectOrder(null)}
                className="py-2.5 px-4 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-semibold text-xs rounded-xl cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
