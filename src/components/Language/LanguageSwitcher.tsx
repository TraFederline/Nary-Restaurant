import React, { useState, useRef, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { ChevronDown, Type } from 'lucide-react';
import { KhmerFont } from '../../types';
import { CambodiaFlagIcon, EnglishFlagIcon } from './FlagIcons';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { language, setLanguage, khmerFont, setKhmerFont } = usePOS();
  const [showFontMenu, setShowFontMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowFontMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fonts: { id: KhmerFont; name: string; khName: string }[] = [
    { id: 'kantumruy', name: 'Kantumruy Pro', khName: 'កន្ទុំរុយ ប្រូ (ទំនើប)' },
    { id: 'battambang', name: 'Battambang', khName: 'បាត់ដំបង (ស្តង់ដារ)' },
    { id: 'siemreap', name: 'Siemreap', khName: 'សៀមរាប (បុរាណ)' },
    { id: 'noto', name: 'Noto Sans Khmer', khName: 'ណូតូ សាន (ស្អាត)' },
  ];

  return (
    <div className="relative flex items-center gap-1.5" ref={menuRef}>
      <div className="flex items-center p-0.5 bg-slate-100 dark:bg-neutral-800 rounded-xl border border-slate-200/80 dark:border-neutral-700/80 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setLanguage('en');
            setShowFontMenu(false);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-xs font-bold'
              : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Switch to English"
        >
          <EnglishFlagIcon className="w-4 h-3 rounded-[2px]" />
          {!compact && <span>EN</span>}
        </button>

        <button
          type="button"
          onClick={() => setLanguage('km')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-khmer ${
            language === 'km'
              ? 'bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-xs font-bold'
              : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="ប្ដូរទៅភាសាខ្មែរ (Switch to Khmer)"
        >
          <CambodiaFlagIcon className="w-4 h-3 rounded-[2px]" />
          <span>{!compact ? 'ខ្មែរ' : 'KM'}</span>
        </button>
      </div>

      {language === 'km' && !compact && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFontMenu(!showFontMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50 text-[11px] font-medium font-khmer hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors cursor-pointer"
            title="ជ្រើសរើសពុម្ពអក្សរខ្មែរ (Select Khmer Font)"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="capitalize hidden sm:inline">{khmerFont}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showFontMenu && (
            <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-slate-200 dark:border-neutral-800 py-1 z-50 text-xs font-khmer">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider border-b border-slate-100 dark:border-neutral-800">
                ពុម្ពអក្សរខ្មែរ (Khmer Font)
              </div>
              {fonts.map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setKhmerFont(f.id);
                    setShowFontMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer ${
                    khmerFont === f.id
                      ? 'text-orange-600 dark:text-orange-400 font-bold bg-orange-50/50 dark:bg-orange-950/20'
                      : 'text-slate-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs">{f.khName}</span>
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500">{f.name}</span>
                  </div>
                  {khmerFont === f.id && <span className="text-orange-500 font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
