import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { LoginPage } from './components/Login/LoginPage';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { PaymentModal } from './components/Payment/PaymentModal';
import { ReceiptModal } from './components/Receipt/ReceiptModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { TablesPage } from './pages/TablesPage';
import { NewOrderPage } from './pages/NewOrderPage';
import { ActiveOrdersPage } from './pages/ActiveOrdersPage';
import { BillingPage } from './pages/BillingPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const POSAppContent: React.FC = () => {
  const { isAuthenticated, activePage } = usePOS();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Requirement: Login page MUST always be the first screen. Users cannot access dashboard without logging in.
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'tables':
        return <TablesPage />;
      case 'new-order':
        return <NewOrderPage />;
      case 'active-orders':
        return <ActiveOrdersPage />;
      case 'billing':
        return <BillingPage />;
      case 'order-history':
        return <OrderHistoryPage />;
      case 'menu':
        return <MenuManagementPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 flex flex-col transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 xl:pl-72 flex flex-col flex-1 min-w-0">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Modals */}
      <PaymentModal />
      <ReceiptModal />
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <POSAppContent />
    </POSProvider>
  );
}
