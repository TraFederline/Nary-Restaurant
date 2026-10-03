import React from 'react';
import { usePOS } from '../../context/POSContext';
import { ActivePage } from '../../types';
import {
  LayoutDashboard,
  UtensilsCrossed,
  PlusCircle,
  Clock,
  Receipt,
  History,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  Grid,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const {
    activePage,
    setActivePage,
    logout,
    adminUser,
    activeOrders,
    theme,
    toggleTheme,
    settings,
    t,
  } = usePOS();

  const unpaidCount = activeOrders.filter(o => o.status === 'UNPAID').length;
  const billingCount = activeOrders.filter(o => o.status === 'BILL REQUESTED').length;

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'tables', label: t.tables, icon: <Grid className="w-5 h-5" /> },
    { id: 'new-order', label: t.newOrder, icon: <PlusCircle className="w-5 h-5" /> },
    {
      id: 'active-orders',
      label: t.activeOrders,
      icon: <Clock className="w-5 h-5" />,
      badge: unpaidCount,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'billing',
      label: t.billing,
      icon: <Receipt className="w-5 h-5" />,
      badge: billingCount,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'order-history', label: t.orderHistory, icon: <History className="w-5 h-5" /> },
    { id: 'menu', label: t.menu, icon: <BookOpen className="w-5 h-5" /> },
    { id: 'reports', label: t.reports, icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: t.settings, icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNavClick = (pageId: ActivePage) => {
    setActivePage(pageId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 xl:w-72 bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="h-18 px-5 flex items-center justify-between border-b border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/20">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white uppercase leading-none block">
                  {settings.name}
                </span>
                <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider block mt-1">
                  {t.appTagline}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
              {t.operations}
            </div>
            {navItems.map(item => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25 font-semibold'
                      : 'text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800/70 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-neutral-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white text-orange-600' : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile, Theme Toggle & Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-neutral-800 space-y-2 bg-slate-50/50 dark:bg-neutral-900/50">
          {/* Theme switch button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700/60 transition-all cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-orange-500" />
              )}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-slate-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
              {theme}
            </span>
          </button>

          {/* User info & Logout */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-800/80 border border-slate-200/80 dark:border-neutral-700/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-white capitalize">
                  {adminUser?.username || 'Admin'}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-neutral-400 font-medium">
                  {t.administrator}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-colors cursor-pointer"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
