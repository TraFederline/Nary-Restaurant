import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import {
  Settings,
  Building,
  DollarSign,
  Receipt,
  RotateCcw,
  Moon,
  Sun,
  Save,
  CheckCircle2,
  Database,
  Download,
  Code,
  HardDrive,
  Copy,
  Check,
  Zap,
  Globe,
  Type,
  Languages,
  Sparkles,
} from 'lucide-react';
import { KhmerFont } from '../types';
import { CambodiaFlagIcon, EnglishFlagIcon } from '../components/Language/FlagIcons';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    theme,
    toggleTheme,
    resetDemoData,
    tables,
    menuItems,
    activeOrders,
    orderHistory,
    language,
    setLanguage,
    khmerFont,
    setKhmerFont,
    t,
  } = usePOS();

  const [name, setName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [taxRatePercent, setTaxRatePercent] = useState((settings.taxRate * 100).toString());
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Database Inspector state
  const [inspectedKey, setInspectedKey] = useState<string>('restopos_active_orders');
  const [copied, setCopied] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name,
      tagline,
      address,
      phone,
      currencySymbol,
      taxRate: Math.max(0, (parseFloat(taxRatePercent) || 0) / 100),
      receiptFooter,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (
      confirm(
        language === 'km'
          ? 'តើលោកអ្នកពិតជាចង់កំណត់ទិន្នន័យឡើងវិញមែនទេ? វានឹងស្ដារតុ បញ្ជីមុខម្ហូប និងការកុម្ម៉ង់ទាំងអស់មកសភាពដើម។'
          : 'Are you sure you want to reset demo data? This will restore initial tables, menu catalog, active dining orders, and history.'
      )
    ) {
      resetDemoData();
      alert(language === 'km' ? 'ទិន្នន័យត្រូវបានកំណត់ឡើងវិញដោយជោគជ័យ!' : 'Demo data restored successfully!');
      window.location.reload();
    }
  };

  // Calculate raw storage size
  const storageKeys = [
    { key: 'restopos_tables', name: language === 'km' ? 'តុអាហារ' : 'Tables & Floor', count: tables.length, data: tables },
    { key: 'restopos_menu_items', name: language === 'km' ? 'បញ្ជីម្ហូប' : 'Menu Items', count: menuItems.length, data: menuItems },
    { key: 'restopos_active_orders', name: language === 'km' ? 'កុម្ម៉ង់សកម្ម' : 'Active Orders', count: activeOrders.length, data: activeOrders },
    { key: 'restopos_order_history', name: language === 'km' ? 'ប្រវត្តិវិក្កយបត្រ' : 'Order History', count: orderHistory.length, data: orderHistory },
    { key: 'restopos_settings', name: language === 'km' ? 'ការកំណត់' : 'Settings', count: 1, data: settings },
  ];

  const totalBytes = storageKeys.reduce((acc, item) => {
    const raw = localStorage.getItem(item.key) || JSON.stringify(item.data);
    return acc + new Blob([raw]).size;
  }, 0);

  const currentInspectedData =
    localStorage.getItem(inspectedKey) ||
    JSON.stringify(storageKeys.find(s => s.key === inspectedKey)?.data || {}, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(currentInspectedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportFullDatabase = () => {
    const backup: Record<string, any> = {};
    storageKeys.forEach(item => {
      backup[item.key] = item.data;
    });
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `restopos_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wide">
            {t.posConfig}
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            {t.settingsSubtitle}
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{t.settingsSavedSuccess}</span>
        </div>
      )}

      {/* Language & Khmer Typography Configuration Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.languageTypographySettings}
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {t.languageTypographySubtitle}
              </p>
            </div>
          </div>

          {/* Active Language Badge with Flag Icon */}
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 self-start sm:self-auto">
            {language === 'km' ? (
              <CambodiaFlagIcon className="w-4 h-3 rounded-[2px]" />
            ) : (
              <EnglishFlagIcon className="w-4 h-3 rounded-[2px]" />
            )}
            <span>{language === 'km' ? 'ភាសាខ្មែរ (Khmer Active)' : 'English (Active)'}</span>
          </span>
        </div>

        {/* 1. Language Toggle Cards with Official Flag Icons */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-2">
            {language === 'km' ? 'ជ្រើសរើសភាសាប្រព័ន្ធ (System Language)' : 'Select System Language'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                language === 'en'
                  ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 ring-2 ring-orange-500/20'
                  : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <EnglishFlagIcon className="w-5 h-3.5 rounded-[2px]" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">English</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  International standard with USD billing & receipts
                </p>
              </div>
              {language === 'en' && <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => setLanguage('km')}
              className={`p-4 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer font-khmer ${
                language === 'km'
                  ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 ring-2 ring-orange-500/20'
                  : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CambodiaFlagIcon className="w-5 h-3.5 rounded-[2px]" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">ភាសាខ្មែរ (Khmer)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  ពុម្ពអក្សរខ្មែរស្អាត ច្បាស់ សម្រាប់តុ ប៊ូតុង និងវិក្កយបត្រ
                </p>
              </div>
              {language === 'km' && <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />}
            </button>
          </div>
        </div>

        {/* 2. Khmer Font Family Selection */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-orange-500" />
              <span>{t.khmerFontFamily}</span>
            </label>
            <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
              Active: <strong>{khmerFont}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 'kantumruy' as KhmerFont,
                name: t.fontKantumruy,
                desc: t.fontKantumruyDesc,
                cssClass: 'font-kantumruy',
                badge: 'Recommended UI',
              },
              {
                id: 'battambang' as KhmerFont,
                name: t.fontBattambang,
                desc: t.fontBattambangDesc,
                cssClass: 'font-battambang',
                badge: 'Standard Classic',
              },
              {
                id: 'siemreap' as KhmerFont,
                name: t.fontSiemreap,
                desc: t.fontSiemreapDesc,
                cssClass: 'font-siemreap',
                badge: 'Traditional Elegance',
              },
              {
                id: 'noto' as KhmerFont,
                name: t.fontNoto,
                desc: t.fontNotoDesc,
                cssClass: 'font-noto-khmer',
                badge: 'Google Sans',
              },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setKhmerFont(f.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  khmerFont === f.id
                    ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 ring-2 ring-orange-500/20'
                    : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-slate-50/50 dark:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-sm font-bold text-slate-900 dark:text-white ${f.cssClass}`}>
                    {f.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-300 font-medium">
                    {f.badge}
                  </span>
                </div>
                <p className={`text-xs text-slate-500 dark:text-neutral-400 leading-relaxed ${f.cssClass}`}>
                  {f.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Live Typography & Button/Table Preview */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/80 space-y-3 font-khmer">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200/60 dark:border-neutral-700/60">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.typographyPreview}</span>
            </span>
            <span className="text-[11px] text-orange-600 dark:text-orange-400 font-mono">
              Font: {khmerFont} • Anti-Aliased
            </span>
          </div>

          {/* Action Buttons in Khmer */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              + {t.sampleButton}
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold rounded-xl"
            >
              {t.requestBill}
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              {t.samplePayButton}
            </button>
          </div>

          {/* Table Cell Sample */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-neutral-700 text-xs bg-white dark:bg-neutral-900">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-neutral-800/80 text-[11px] font-bold text-slate-600 dark:text-neutral-400">
                <tr>
                  <th className="px-3 py-2">{t.filterByTable} / ទីតាំង</th>
                  <th className="px-3 py-2">{t.orderedDishes}</th>
                  <th className="px-3 py-2">{t.itemStatus}</th>
                  <th className="px-3 py-2 text-right">{t.totalAmount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 text-slate-800 dark:text-neutral-200">
                <tr>
                  <td className="px-3 py-2.5 font-bold">តុលេខ ០៥ (ជាន់ទី ១)</td>
                  <td className="px-3 py-2.5">បាយមាន់ហៃណាំពិសេស × ២</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {t.unpaid}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold">$17.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed italic">
            * ពុម្ពអក្សរខ្មែរត្រូវបានកែសម្រួលគម្លាតបន្ទាត់ (Line-height) និងគម្លាតខាងក្នុង (Padding) យ៉ាងផ្ចិតផ្ចង់ ដើម្បីកុំឱ្យដាច់ជើងអក្សរ (្គ, ្ញ, ្ត) ឬស្រៈលើ (ិ, ី, ឹ) លើប៊ូតុង និងតារាង។
          </p>
        </div>
      </div>

      {/* DATABASE INFORMATION & LIVE INSPECTOR CARD */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.databaseLocation}
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {t.currentStorageEngine}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportFullDatabase}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportDatabaseJson}</span>
          </button>
        </div>

        {/* Where is the database explanation */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/80 text-xs text-slate-600 dark:text-neutral-300 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <HardDrive className="w-4 h-4 text-orange-500" />
            <span>{t.whereDatabaseLocated}</span>
          </div>
          <p className="leading-relaxed">
            {t.databaseExplanation}
          </p>
          <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-slate-500">
            <span>{t.storageConsumed}: <strong>{(totalBytes / 1024).toFixed(2)} KB</strong></span>
            <span>·</span>
            <span>Engine: <strong>HTML5 LocalStorage</strong></span>
          </div>
        </div>

        {/* Storage Collections Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {storageKeys.map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setInspectedKey(item.key)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                inspectedKey === item.key
                  ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 ring-1 ring-orange-500/50'
                  : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
              }`}
            >
              <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
                {item.name}
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                {item.count} {language === 'km' ? 'ធាតុ' : 'items'}
              </span>
            </button>
          ))}
        </div>

        {/* Live Raw JSON Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-semibold text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              <span>Key: <strong>{inspectedKey}</strong></span>
            </span>
            <button
              type="button"
              onClick={handleCopyJson}
              className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.copied : t.copyRawJson}</span>
            </button>
          </div>

          <div className="relative rounded-xl bg-slate-900 text-neutral-200 p-4 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
            <pre>
              {typeof currentInspectedData === 'string'
                ? currentInspectedData
                : JSON.stringify(currentInspectedData, null, 2)}
            </pre>
          </div>
        </div>

        {/* How to check directly in Chrome / Edge / Safari Developer Tools */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 text-xs text-slate-600 dark:text-neutral-300 space-y-1.5">
          <span className="font-bold text-blue-900 dark:text-blue-300 block">
            {t.howToVerifyDevTools}
          </span>
          <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
            <li>{language === 'km' ? 'ចុច F12 (ឬចុចកណ្ដុរស្ដាំ → Inspect)' : 'Press F12 (or Right-Click → Inspect)'}.</li>
            <li>{language === 'km' ? 'ចូលទៅកាន់ផ្ទាំង Application (Chrome/Edge) ឬ Storage (Safari/Firefox)' : 'Go to Application tab (Chrome/Edge) or Storage tab (Safari/Firefox)'}.</li>
            <li>{language === 'km' ? 'ពន្លា Local Storage នៅខាងឆ្វេង → ចុចលើ URL កម្មវិធីរបស់អ្នក' : 'In left tree, expand Local Storage → click on app URL'}.</li>
            <li>{language === 'km' ? 'អ្នកនឹងឃើញតារាងទិន្នន័យ restopos_tables, restopos_active_orders, restopos_order_history' : 'You will see all keys: restopos_tables, restopos_active_orders, restopos_order_history'}.</li>
          </ol>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding & Contact Info */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <Building className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.restaurantBranding}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                {t.restaurantName}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                {t.taglineSlogan}
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                {t.addressReceipt}
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                {t.phoneNumber}
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.financialTax}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                {t.currencySymbolLabel}
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={e => setCurrencySymbol(e.target.value)}
                required
                className="w-24 p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white text-center"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                {t.salesTaxRate}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={taxRatePercent}
                  onChange={e => setTaxRatePercent(e.target.value)}
                  className="w-24 p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white text-center"
                />
                <span className="text-xs text-slate-400">e.g. 5% or 0% for tax-inclusive</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                {t.receiptFooterText}
              </label>
              <input
                type="text"
                value={receiptFooter}
                onChange={e => setReceiptFooter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Display Theme Preference */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-orange-500" />
              )}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.displayThemeMode}
              </h3>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs font-semibold text-slate-800 dark:text-neutral-200 flex items-center gap-2 cursor-pointer hover:bg-slate-100"
            >
              <span>Current: {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
              <span className="text-orange-600 dark:text-orange-400 font-bold uppercase text-[10px]">
                Switch
              </span>
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            {language === 'km'
              ? 'ការកំណត់នេះត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិក្នុង LocalStorage និងអនុវត្តពេលចូលប្រើ។'
              : "Preference is automatically saved in your browser's local storage and applied whenever you log in."}
          </p>
        </div>

        {/* Action Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t.saveSettings}</span>
          </button>
        </div>
      </form>

      {/* Demo Reset Card */}
      <div className="p-6 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
            <RotateCcw className="w-4 h-4" />
            <span>{t.resetDemoData}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1 max-w-lg">
            {language === 'km'
              ? 'ស្ដារតុគំរូ បញ្ជីមុខម្ហូបគ្រប់ប្រភេទ តុដែលកំពុងមានភ្ញៀវ និងប្រវត្តិការកុម្ម៉ង់ទាំងអស់មកកាន់សភាពដើមវិញ។'
              : 'Restore sample tables, menu items across all categories, active dining tables, and order history back to fresh initial state.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetData}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          {t.resetAllData}
        </button>
      </div>
    </div>
  );
};
