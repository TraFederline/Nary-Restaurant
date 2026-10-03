import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { LanguageSwitcher } from '../Language/LanguageSwitcher';
import {
  Menu as MenuIcon,
  Sun,
  Moon,
  Plus,
  Clock,
  Receipt,
  Users,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    activePage,
    setActivePage,
    theme,
    toggleTheme,
    tables,
    activeOrders,
    setSelectedTableForOrder,
    t,
  } = usePOS();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: t.dashboard, subtitle: t.visualOverview },
    tables: { title: t.tables, subtitle: t.liveRestaurantFloorStatus },
    'new-order': { title: t.newOrder, subtitle: t.selectDiningTable },
    'active-orders': { title: t.activeOrders, subtitle: t.outstandingSubtitle },
    billing: { title: t.billing, subtitle: t.billingSubtitle },
    'order-history': { title: t.orderHistory, subtitle: t.settledSubtitle },
    menu: { title: t.menu, subtitle: t.menuSubtitle },
    reports: { title: t.reports, subtitle: t.analyticsSubtitle },
    settings: { title: t.settings, subtitle: t.settingsSubtitle },
  };

  const currentInfo = pageTitles[activePage] || { title: 'RestoPOS', subtitle: '' };

  const occupiedCount = tables.filter(t => t.status === 'OCCUPIED' || t.status === 'BILLING').length;
  const unpaidCount = activeOrders.filter(o => o.status === 'UNPAID').length;
  const billingCount = activeOrders.filter(o => o.status === 'BILL REQUESTED').length;

  return (
    <header className="h-18 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile trigger & Page Titles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800"
          aria-label="Open navigation menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Floor Stats, Language Switcher, Clock, Theme Switch & Primary Action */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick status counters */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-300 font-medium">
            <Users className="w-3.5 h-3.5 text-red-500" />
            <span>{t.activeTables}:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{occupiedCount}/{tables.length}</span>
          </div>

          <span className="text-slate-300 dark:text-neutral-700">|</span>

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>{t.unpaidOrders}:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{unpaidCount}</span>
          </div>

          {billingCount > 0 && (
            <>
              <span className="text-slate-300 dark:text-neutral-700">|</span>
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                <Receipt className="w-3.5 h-3.5" />
                <span>{t.billsRequested}:</span>
                <span className="font-mono font-bold">{billingCount}</span>
              </div>
            </>
          )}
        </div>

        {/* Language Switcher (Khmer / English) */}
        <LanguageSwitcher />

        {/* Live Clock with tabular figures */}
        <div className="hidden md:flex flex-col text-right px-3 py-1 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200/60 dark:border-neutral-700/60">
          <span className="font-mono text-xs font-semibold tracking-wider text-slate-800 dark:text-white tabular-nums">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-neutral-400 font-medium">
            {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* New Order Button */}
        {activePage !== 'new-order' && (
          <button
            onClick={() => {
              setSelectedTableForOrder(null);
              setActivePage('new-order');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs rounded-xl shadow-sm shadow-orange-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.newOrder}</span>
            <span className="sm:hidden">{t.newOrder}</span>
          </button>
        )}
      </div>
    </header>
  );
};
