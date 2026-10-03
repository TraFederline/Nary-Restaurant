import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Table,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  RestaurantSettings,
  ActivePage,
  ThemeMode,
  KhmerFont,
} from '../types';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_ACTIVE_ORDERS,
  INITIAL_ORDER_HISTORY,
  INITIAL_SETTINGS,
} from '../data/initialData';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface POSContextType {
  // Auth
  isAuthenticated: boolean;
  adminUser: { username: string; role: string } | null;
  login: (username: string, password: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Language & Khmer Font
  language: Language;
  setLanguage: (lang: Language) => void;
  khmerFont: KhmerFont;
  setKhmerFont: (font: KhmerFont) => void;
  t: typeof TRANSLATIONS['en'];

  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;

  // Navigation
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;

  // Tables
  tables: Table[];
  addTable: (table: { number: string; capacity: number; zone?: string }) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  resetTable: (tableId: string) => void;
  selectedTableForOrder: Table | null;
  setSelectedTableForOrder: (table: Table | null) => void;

  // Menu
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleMenuItemAvailability: (id: string) => void;

  // Orders
  activeOrders: Order[];
  orderHistory: Order[];
  createOrder: (tableId: string, guests: number, items: OrderItem[]) => Order;
  addItemsToOrder: (orderId: string, newItems: OrderItem[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  requestBill: (orderId: string) => void;
  processPayment: (orderId: string, cashReceived: number) => { success: boolean; change: number; order?: Order; error?: string };

  // Modals & Action overlays
  payingOrder: Order | null;
  setPayingOrder: (order: Order | null) => void;
  viewReceiptOrder: Order | null;
  setViewReceiptOrder: (order: Order | null) => void;

  // Settings
  settings: RestaurantSettings;
  updateSettings: (newSettings: Partial<RestaurantSettings>) => void;
  resetDemoData: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('restopos_auth') === 'true' || sessionStorage.getItem('restopos_auth') === 'true';
  });
  const [adminUser, setAdminUser] = useState<{ username: string; role: string } | null>(() => {
    const saved = localStorage.getItem('restopos_user') || sessionStorage.getItem('restopos_user');
    return saved ? JSON.parse(saved) : null;
  });

  // 2. Theme State
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('restopos_theme') as ThemeMode;
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // 2b. Language State (English & Khmer)
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('restopos_lang') as Language;
    return saved === 'km' || saved === 'en' ? saved : 'en';
  });

  const [khmerFont, setKhmerFontState] = useState<KhmerFont>(() => {
    const saved = localStorage.getItem('restopos_khmer_font') as KhmerFont;
    return saved === 'kantumruy' || saved === 'battambang' || saved === 'siemreap' || saved === 'noto' ? saved : 'kantumruy';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('restopos_lang', lang);
  };

  const setKhmerFont = (font: KhmerFont) => {
    setKhmerFontState(font);
    localStorage.setItem('restopos_khmer_font', font);
  };

  useEffect(() => {
    const fontMap: Record<KhmerFont, string> = {
      kantumruy: "'Kantumruy Pro', 'Plus Jakarta Sans', system-ui, sans-serif",
      battambang: "'Battambang', 'Kantumruy Pro', system-ui, sans-serif",
      siemreap: "'Siemreap', 'Kantumruy Pro', system-ui, sans-serif",
      noto: "'Noto Sans Khmer', 'Kantumruy Pro', system-ui, sans-serif",
    };
    document.documentElement.style.setProperty('--khmer-font', fontMap[khmerFont] || fontMap.kantumruy);
  }, [khmerFont]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', language);
    if (language === 'km') {
      document.body.classList.add('font-khmer');
    } else {
      document.body.classList.remove('font-khmer');
    }
  }, [language]);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('restopos_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // 3. Navigation State
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  // 4. Data states with localStorage persistence
  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('restopos_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('restopos_menu_items');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [activeOrders, setActiveOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('restopos_active_orders');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVE_ORDERS;
  });

  const [orderHistory, setOrderHistory] = useState<Order[]>(() => {
    const saved = localStorage.getItem('restopos_order_history');
    return saved ? JSON.parse(saved) : INITIAL_ORDER_HISTORY;
  });

  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    const saved = localStorage.getItem('restopos_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Flow & Modal states
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<Table | null>(null);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [viewReceiptOrder, setViewReceiptOrder] = useState<Order | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('restopos_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('restopos_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('restopos_active_orders', JSON.stringify(activeOrders));
  }, [activeOrders]);

  useEffect(() => {
    localStorage.setItem('restopos_order_history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    localStorage.setItem('restopos_settings', JSON.stringify(settings));
  }, [settings]);

  // Auth Functions
  const login = async (username: string, pass: string, remember: boolean) => {
    if (username.trim() === 'admin' && pass === '12345678') {
      const user = { username: 'admin', role: 'Administrator' };
      setIsAuthenticated(true);
      setAdminUser(user);
      if (remember) {
        localStorage.setItem('restopos_auth', 'true');
        localStorage.setItem('restopos_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('restopos_auth', 'true');
        sessionStorage.setItem('restopos_user', JSON.stringify(user));
      }
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password.\nPlease try again.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('restopos_auth');
    localStorage.removeItem('restopos_user');
    sessionStorage.removeItem('restopos_auth');
    sessionStorage.removeItem('restopos_user');
    setActivePage('dashboard');
  };

  // Table Management
  const addTable = (tableData: { number: string; capacity: number; zone?: string }) => {
    const newTable: Table = {
      id: `t-${Date.now()}`,
      number: tableData.number.padStart(2, '0'),
      capacity: Number(tableData.capacity),
      status: 'AVAILABLE',
      zone: tableData.zone || 'Main Dining',
    };
    setTables(prev => [...prev, newTable]);
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTable = (id: string) => {
    // Don't delete if table has an active order
    const table = tables.find(t => t.id === id);
    if (table && table.status !== 'AVAILABLE') {
      alert(`Cannot remove Table ${table.number} while it is ${table.status}. Clear the order first.`);
      return;
    }
    setTables(prev => prev.filter(t => t.id !== id));
  };

  const resetTable = (tableId: string) => {
    setTables(prev =>
      prev.map(t =>
        t.id === tableId
          ? {
              ...t,
              status: 'AVAILABLE',
              currentOrderId: undefined,
              currentGuests: undefined,
              orderStartedAt: undefined,
            }
          : t
      )
    );
  };

  // Menu Management
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `m-${Date.now()}`,
      price: Math.max(0, Number(item.price)),
    };
    setMenuItems(prev => [newItem, ...prev]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              ...updates,
              price: updates.price !== undefined ? Math.max(0, Number(updates.price)) : item.price,
            }
          : item
      )
    );
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleMenuItemAvailability = (id: string) => {
    setMenuItems(prev =>
      prev.map(item => (item.id === id ? { ...item, available: !item.available } : item))
    );
  };

  // Order Management
  const createOrder = (tableId: string, guests: number, items: OrderItem[]): Order => {
    const table = tables.find(t => t.id === tableId);
    const tableNumber = table ? table.number : '??';

    // Calculate subtotal & tax
    const subtotal = items.reduce((acc, item) => acc + item.itemTotal, 0);
    const tax = Math.round(subtotal * settings.taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    // Generate unique order number (e.g., #0027)
    const nextSeq = activeOrders.length + orderHistory.length + 27;
    const orderNumber = `#${String(nextSeq).padStart(4, '0')}`;
    const nowIso = new Date().toISOString();

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      tableId,
      tableNumber,
      guests: Math.max(1, guests),
      items,
      subtotal,
      tax,
      total,
      status: 'UNPAID', // Customer orders food -> Order sent -> Remains UNPAID while eating
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Update active orders
    setActiveOrders(prev => [newOrder, ...prev]);

    // Update table status to OCCUPIED
    setTables(prev =>
      prev.map(t =>
        t.id === tableId
          ? {
              ...t,
              status: 'OCCUPIED',
              currentOrderId: newOrder.id,
              currentGuests: guests,
              orderStartedAt: nowIso,
            }
          : t
      )
    );

    return newOrder;
  };

  const addItemsToOrder = (orderId: string, newItems: OrderItem[]) => {
    setActiveOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const mergedItems = [...order.items, ...newItems];
        const subtotal = mergedItems.reduce((acc, item) => acc + item.itemTotal, 0);
        const tax = Math.round(subtotal * settings.taxRate * 100) / 100;
        const total = Math.round((subtotal + tax) * 100) / 100;

        return {
          ...order,
          items: mergedItems,
          subtotal,
          tax,
          total,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setActiveOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const requestBill = (orderId: string) => {
    const nowIso = new Date().toISOString();
    let targetTableId = '';

    setActiveOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        targetTableId = order.tableId;
        return {
          ...order,
          status: 'BILL REQUESTED',
          billRequestedAt: nowIso,
          updatedAt: nowIso,
        };
      })
    );

    if (targetTableId) {
      setTables(prev =>
        prev.map(t => (t.id === targetTableId ? { ...t, status: 'BILLING' } : t))
      );
    }
  };

  const processPayment = (
    orderId: string,
    cashReceived: number
  ): { success: boolean; change: number; order?: Order; error?: string } => {
    const order = activeOrders.find(o => o.id === orderId);
    if (!order) {
      return { success: false, change: 0, error: 'Order not found or already closed.' };
    }

    if (order.status === 'PAID') {
      return { success: false, change: 0, error: 'This order is already marked as PAID.' };
    }

    if (cashReceived < order.total) {
      return {
        success: false,
        change: 0,
        error: `Insufficient payment. Customer must pay at least ${settings.currencySymbol}${order.total.toFixed(2)}.`,
      };
    }

    const change = Math.round((cashReceived - order.total) * 100) / 100;
    const nowIso = new Date().toISOString();

    const completedOrder: Order = {
      ...order,
      status: 'PAID',
      updatedAt: nowIso,
      paymentDetails: {
        cashReceived: Number(cashReceived),
        changeGiven: change,
        paymentMethod: 'CASH',
        processedBy: adminUser?.username || 'Admin',
        paidAt: nowIso,
      },
    };

    // Remove from active orders and append to order history
    setActiveOrders(prev => prev.filter(o => o.id !== orderId));
    setOrderHistory(prev => [completedOrder, ...prev]);

    // Free the table (status becomes AVAILABLE)
    setTables(prev =>
      prev.map(t =>
        t.id === order.tableId
          ? {
              ...t,
              status: 'AVAILABLE',
              currentOrderId: undefined,
              currentGuests: undefined,
              orderStartedAt: undefined,
            }
          : t
      )
    );

    return { success: true, change, order: completedOrder };
  };

  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetDemoData = () => {
    localStorage.removeItem('restopos_tables');
    localStorage.removeItem('restopos_menu_items');
    localStorage.removeItem('restopos_active_orders');
    localStorage.removeItem('restopos_order_history');
    localStorage.removeItem('restopos_settings');
    setTables(INITIAL_TABLES);
    setMenuItems(INITIAL_MENU_ITEMS);
    setActiveOrders(INITIAL_ACTIVE_ORDERS);
    setOrderHistory(INITIAL_ORDER_HISTORY);
    setSettings(INITIAL_SETTINGS);
  };

  return (
    <POSContext.Provider
      value={{
        isAuthenticated,
        adminUser,
        login,
        logout,
        language,
        setLanguage,
        khmerFont,
        setKhmerFont,
        t,
        theme,
        toggleTheme,
        activePage,
        setActivePage,
        tables,
        addTable,
        updateTable,
        deleteTable,
        resetTable,
        selectedTableForOrder,
        setSelectedTableForOrder,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuItemAvailability,
        activeOrders,
        orderHistory,
        createOrder,
        addItemsToOrder,
        updateOrderStatus,
        requestBill,
        processPayment,
        payingOrder,
        setPayingOrder,
        viewReceiptOrder,
        setViewReceiptOrder,
        settings,
        updateSettings,
        resetDemoData,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
