import React from 'react';
import { usePOS } from '../context/POSContext';
import {
  DollarSign,
  Users,
  Clock,
  Receipt,
  ShoppingBag,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Eye,
  Plus,
  Flame,
} from 'lucide-react';
import { Table, Order } from '../types';

export const Dashboard: React.FC = () => {
  const {
    tables,
    activeOrders,
    orderHistory,
    menuItems,
    settings,
    setActivePage,
    setSelectedTableForOrder,
    setPayingOrder,
    setViewReceiptOrder,
    requestBill,
    t,
    language,
  } = usePOS();

  // Metric Calculations
  const todayPaidOrders = orderHistory.filter(o => o.status === 'PAID');
  const todaySales = todayPaidOrders.reduce((sum, o) => sum + o.total, 0);

  const activeTablesCount = tables.filter(
    t => t.status === 'OCCUPIED' || t.status === 'BILLING'
  ).length;

  const unpaidOrdersCount = activeOrders.filter(o => o.status === 'UNPAID').length;
  const billsRequestedCount = activeOrders.filter(o => o.status === 'BILL REQUESTED').length;

  const todayTotalOrdersCount = activeOrders.length + todayPaidOrders.length;
  const paidOrdersCount = todayPaidOrders.length;

  // Outstanding bills (orders with BILL REQUESTED)
  const outstandingBills = activeOrders.filter(o => o.status === 'BILL REQUESTED');

  // Recent 5 orders
  const recentOrders = [...activeOrders, ...orderHistory]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Popular items calculation
  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  [...activeOrders, ...orderHistory].forEach(order => {
    order.items.forEach(item => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 };
      }
      itemCounts[item.name].count += item.quantity;
      itemCounts[item.name].revenue += item.itemTotal;
    });
  });

  const popularItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 6 Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.todaysSales}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {settings.currencySymbol}{todaySales.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> {language === 'km' ? 'ប្រាក់សុទ្ធប្រមូលបាន' : 'Settled Cash'}
          </span>
        </div>

        {/* Active Tables */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.activeTables}</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {activeTablesCount}
            <span className="text-xs text-slate-400 font-normal"> / {tables.length}</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium block mt-1">
            {tables.length - activeTablesCount} {t.available}
          </span>
        </div>

        {/* Unpaid Orders */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-amber-200/80 dark:border-amber-900/50 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 dark:text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              {t.unpaidOrders}
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {unpaidOrdersCount}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium block mt-1">
            {t.diningInProgress}
          </span>
        </div>

        {/* Bills Requested */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-orange-200/80 dark:border-orange-900/50 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
              {t.billsRequested}
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-orange-600 dark:text-orange-400 tabular-nums">
            {billsRequestedCount}
          </div>
          <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold block mt-1">
            {t.readyForCheckout}
          </span>
        </div>

        {/* Today's Orders */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.todaysOrders}</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {todayTotalOrdersCount}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium block mt-1">
            {t.totalCoversToday}
          </span>
        </div>

        {/* Paid Orders */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.paidOrders}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {paidOrdersCount}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
            {t.completedAndClosed}
          </span>
        </div>
      </div>

      {/* Outstanding Bills Callout */}
      {outstandingBills.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {outstandingBills.length} {t.tablesRequestedBill}
              </h3>
              <p className="text-xs text-slate-600 dark:text-neutral-300">
                {t.customersReadyToPay}: {outstandingBills.map(b => `${language === 'km' ? 'តុ' : 'Table'} ${b.tableNumber} (${settings.currencySymbol}${b.total.toFixed(2)})`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage('billing')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm shadow-amber-600/20 whitespace-nowrap cursor-pointer"
          >
            <span>{t.openBillingCounter}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Live Table Floor Grid Preview */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.liveRestaurantFloorStatus}
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              {t.visualOverview}
            </p>
          </div>
          <button
            onClick={() => setActivePage('tables')}
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t.viewAllTables}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {tables.map(table => {
            const activeOrder = activeOrders.find(o => o.tableId === table.id);

            return (
              <div
                key={table.id}
                onClick={() => {
                  if (table.status === 'AVAILABLE') {
                    setSelectedTableForOrder(table);
                    setActivePage('new-order');
                  } else if (table.status === 'BILLING' && activeOrder) {
                    setPayingOrder(activeOrder);
                  } else {
                    setActivePage('active-orders');
                  }
                }}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer hover:shadow-md flex flex-col justify-between min-h-[110px] ${
                  table.status === 'AVAILABLE'
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-400'
                    : table.status === 'OCCUPIED'
                    ? 'border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20 hover:border-red-400'
                    : table.status === 'BILLING'
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-400/40'
                    : 'border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 font-semibold">
                    T-{table.number}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      table.status === 'AVAILABLE'
                        ? 'bg-emerald-500'
                        : table.status === 'OCCUPIED'
                        ? 'bg-red-500'
                        : table.status === 'BILLING'
                        ? 'bg-amber-500 animate-ping'
                        : 'bg-blue-500'
                    }`}
                  />
                </div>

                <div className="my-1">
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">
                    {language === 'km' ? 'តុ' : 'Table'} {table.number}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
                    {table.status === 'AVAILABLE' ? (
                      `${t.tableCap}: ${table.capacity}`
                    ) : (
                      <span className="font-semibold text-slate-800 dark:text-neutral-200">
                        {table.currentGuests || table.capacity} {t.covers}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {activeOrder ? (
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white block">
                      {settings.currencySymbol}{activeOrder.total.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                      {t.available}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.recentDiningOrders}
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {t.latestOrders}
              </p>
            </div>
            <button
              onClick={() => setActivePage('order-history')}
              className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
            >
              {t.fullHistory}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-neutral-800 text-slate-400 dark:text-neutral-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">{language === 'km' ? 'កុម្ម៉ង់' : 'Order'}</th>
                  <th className="pb-3">{t.tables}</th>
                  <th className="pb-3">{t.guests}</th>
                  <th className="pb-3">{t.orderedDishes}</th>
                  <th className="pb-3 text-right">{t.totalAmount}</th>
                  <th className="pb-3 text-center">{language === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                  <th className="pb-3 text-right pr-2">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 font-medium">
                {recentOrders.map(order => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3 pl-2 font-mono font-bold text-slate-900 dark:text-white">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 font-semibold text-slate-800 dark:text-neutral-200">
                      {language === 'km' ? 'តុ' : 'Table'} {order.tableNumber}
                    </td>
                    <td className="py-3 text-slate-500 dark:text-neutral-400">
                      {order.guests} {t.covers}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-neutral-300 max-w-[180px] truncate">
                      {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {settings.currencySymbol}{order.total.toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'PAID'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : order.status === 'BILL REQUESTED'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        }`}
                      >
                        {order.status === 'PAID'
                          ? t.paid
                          : order.status === 'BILL REQUESTED'
                          ? t.billRequested
                          : t.unpaid}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      {order.status === 'PAID' ? (
                        <button
                          onClick={() => setViewReceiptOrder(order)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700 cursor-pointer"
                        >
                          {t.receipt}
                        </button>
                      ) : order.status === 'BILL REQUESTED' ? (
                        <button
                          onClick={() => setPayingOrder(order)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-500 cursor-pointer"
                        >
                          {t.checkout}
                        </button>
                      ) : (
                        <button
                          onClick={() => requestBill(order.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-200 cursor-pointer"
                        >
                          {t.bill}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Items (1 Col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.popularDishes}
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  {t.mostOrderedFavorites}
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {popularItems.map((item, index) => (
                <div
                  key={item.name}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-700/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-neutral-500 font-medium">
                        {item.count} {t.ordersServed}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {settings.currencySymbol}{item.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800">
            <button
              onClick={() => setActivePage('menu')}
              className="w-full py-2.5 px-3 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{t.manageMenu}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
