import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Eye, EyeOff, UtensilsCrossed, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { LanguageSwitcher } from '../Language/LanguageSwitcher';

export const LoginPage: React.FC = () => {
  const { login, settings, t, language } = usePOS();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim()) {
      setErrorMessage(language === 'km' ? 'សូមបញ្ចូលឈ្មោះគណនីរបស់អ្នក។' : 'Please enter your username.');
      return;
    }
    if (!password) {
      setErrorMessage(language === 'km' ? 'សូមបញ្ចូលពាក្យសម្ងាត់របស់អ្នក។' : 'Please enter your password.');
      return;
    }
    if (password.length !== 8) {
      setErrorMessage(
        language === 'km'
          ? 'ពាក្យសម្ងាត់ត្រូវតែមានចំនួន ៨ តួអក្សរគត់។'
          : 'Password must be exactly 8 characters.'
      );
      return;
    }

    setIsLoading(true);
    const result = await login(username, password, rememberMe);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || t.invalidLogin);
    } else {
      setSuccessMessage(
        language === 'km'
          ? 'ការចូលបានជោគជ័យ! សូមស្វាគមន៍មកកាន់ប្រព័ន្ធ Admin'
          : 'Login successful. Welcome back, Admin!'
      );
    }
  };

  const handleDemoFill = () => {
    setUsername('admin');
    setPassword('12345678');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Left Side: 40% Desktop Split Login Form */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-[42%] xl:w-[38%] min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-14 border-r border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10"
      >
        <div>
          {/* Top Bar with Logo & Language Switcher */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase block leading-none">
                  {settings.name}
                </span>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-semibold tracking-wider uppercase mt-1">
                  {t.appTagline}
                </p>
              </div>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>

          {/* Welcome Message */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              {t.welcomeBack}
            </h1>
            <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
              {t.signInToPos}
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  {successMessage}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Redirecting to Admin Dashboard...
                </p>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm font-medium text-red-700 dark:text-red-300 whitespace-pre-line">
                {errorMessage}
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-2"
              >
                {t.username}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300"
                >
                  {t.password}
                </label>
                <span className="text-xs text-slate-400 dark:text-neutral-500">
                  {language === 'km' ? '៨ តួអក្សរគត់' : 'Exactly 8 characters'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  maxLength={8}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all tracking-wider font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 dark:border-neutral-600 dark:bg-neutral-800"
                />
                <span className="text-xs text-slate-600 dark:text-neutral-300 font-medium">
                  {t.rememberMe}
                </span>
              </label>

              <button
                type="button"
                onClick={handleDemoFill}
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
              >
                {t.autoFillDemo}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 mt-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-orange-500/25 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{language === 'km' ? 'កំពុងចូល...' : 'Signing In...'}</span>
                </>
              ) : (
                <span>{t.loginBtn}</span>
              )}
            </button>
          </form>

          {/* Demo account helper */}
          <div className="mt-6 p-3.5 rounded-xl bg-slate-100 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/60 text-xs text-slate-600 dark:text-neutral-400">
            <p className="font-semibold text-slate-800 dark:text-neutral-200 mb-1">
              {language === 'km' ? 'គណនីគ្រប់គ្រងសាកល្បង៖' : 'Demo Administrator Access:'}
            </p>
            <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 font-mono text-[11px]">
              <span>User: <strong className="text-slate-800 dark:text-white">admin</strong></span>
              <span>Pass: <strong className="text-slate-800 dark:text-white">12345678</strong></span>
            </div>
          </div>
        </div>

        <div className="pt-6 text-xs text-slate-400 dark:text-neutral-500 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} RestoPOS</span>
          <span>Dual Language: EN / ខ្មែរ</span>
        </div>
      </motion.div>

      {/* Right Side: 60% Cinematic Restaurant Ambiance */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-[58%] xl:w-[62%] relative min-h-[400px] lg:min-h-screen overflow-hidden flex flex-col justify-end p-8 sm:p-14 lg:p-20"
      >
        {/* Background Image */}
        <img
          src="/src/assets/images/login_restaurant_ambiance_1791035562999.jpg"
          alt="Restaurant Ambiance"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Cinematic Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        {/* Floating Ambient Brand Content */}
        <div className="relative z-10 max-w-xl text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wider text-amber-300 uppercase mb-6">
            <span>🍽️ Premium Restaurant POS</span>
          </div>

          <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-orange-400 mb-3 font-bold">
            {settings.name}
          </h2>

          <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            {language === 'km' ? (
              <>
                <span className="block text-white">អាហារឆ្ងាញ់ពិសា។</span>
                <span className="block text-amber-300">ពេលវេលាដ៏រីករាយ។</span>
                <span className="block text-white/90">បទពិសោធន៍ល្អឥតខ្ចោះ។</span>
              </>
            ) : (
              <>
                <span className="block text-white">Great Food.</span>
                <span className="block text-amber-300">Great Moments.</span>
                <span className="block text-white/90">Great Experiences.</span>
              </>
            )}
          </div>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-lg mb-8">
            {language === 'km'
              ? 'ប្រព័ន្ធទំនើបសម្រាប់បម្រើភ្ញៀវក្នុងហាង៖ ចាត់ចែងតុអាហារ បញ្ជូនការកុម្ម៉ង់ទៅផ្ទះបាយ កត់ត្រាវិក្កយបត្រ និងទូទាត់ប្រាក់សុទ្ធយ៉ាងរហ័ស។'
              : 'Engineered exclusively for dine-in operations: seamless table assignments, live kitchen ticket routing, bill settlement, and cash accounting.'}
          </p>

          <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6 text-neutral-300">
            <div>
              <div className="text-2xl font-bold font-mono text-white">100%</div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider">
                {language === 'km' ? 'ក្នុងហាង' : 'In-House'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white">&lt; 30s</div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider">
                {language === 'km' ? 'គិតលុយលឿន' : 'Fast Billing'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white">Accurate</div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider">
                {language === 'km' ? 'លុយអាប់ត្រឹមត្រូវ' : 'Cash & Change'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
