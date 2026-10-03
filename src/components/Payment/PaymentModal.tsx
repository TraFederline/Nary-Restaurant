import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  DollarSign,
  Printer,
  ArrowRight,
  User,
  Users,
} from 'lucide-react';
import { Order } from '../../types';

export const PaymentModal: React.FC = () => {
  const { payingOrder, setPayingOrder, processPayment, setViewReceiptOrder, settings, t, language } = usePOS();
  const [cashInput, setCashInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [completedChange, setCompletedChange] = useState<number>(0);

  useEffect(() => {
    if (payingOrder) {
      setCashInput('');
      setError(null);
      setCompletedOrder(null);
      setCompletedChange(0);
    }
  }, [payingOrder]);

  if (!payingOrder) return null;

  const total = payingOrder.total;
  const cashReceived = parseFloat(cashInput) || 0;
  const change = Math.round((cashReceived - total) * 100) / 100;
  const isInsufficient = cashReceived < total;

  const handlePreset = (amount: number) => {
    setCashInput(amount.toString());
    setError(null);
  };

  const handleExact = () => {
    setCashInput(total.toFixed(2));
    setError(null);
  };

  const handleAddAmount = (add: number) => {
    const current = parseFloat(cashInput) || 0;
    setCashInput((current + add).toString());
    setError(null);
  };

  const handleCompletePayment = () => {
    setError(null);
    if (!cashInput || isNaN(Number(cashInput))) {
      setError(language === 'km' ? 'សូមបញ្ចូលចំនួនប្រាក់សុទ្ធដែលភ្ញៀវបានបង់។' : 'Please enter cash received amount.');
      return;
    }

    if (cashReceived < total) {
      setError(
        `${t.insufficientPayment}\n${t.mustPayAtLeast} ${settings.currencySymbol}${total.toFixed(2)}`
      );
      return;
    }

    const result = processPayment(payingOrder.id, cashReceived);
    if (!result.success) {
      setError(result.error || 'Payment processing failed.');
    } else {
      setCompletedOrder(result.order || payingOrder);
      setCompletedChange(result.change);
    }
  };

  const handleClose = () => {
    setPayingOrder(null);
    setCompletedOrder(null);
  };

  const handlePrintReceipt = () => {
    if (completedOrder) {
      setViewReceiptOrder(completedOrder);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-neutral-800 transition-all max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-slate-50/50 dark:bg-neutral-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                {completedOrder ? t.paymentCompleted : t.processPayment}
              </h2>
              <span className="text-xs text-slate-500 dark:text-neutral-400">
                {language === 'km' ? 'កុម្ម៉ង់' : 'Order'} {payingOrder.orderNumber} · {language === 'km' ? 'តុ' : 'Table'} {payingOrder.tableNumber}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {completedOrder ? (
            /* SUCCESS VIEW */
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  ✓ {language === 'km' ? 'ការទូទាត់ប្រាក់បានជោគជ័យ' : 'Payment Successful'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  {language === 'km'
                    ? `ស្ថានភាពកុម្ម៉ង់ត្រូវបានប្តូរជា «បានបង់ប្រាក់»។ តុ ${completedOrder.tableNumber} ឥឡូវនេះគឺ «ទំនេរ»។`
                    : `Order status updated to PAID. Table ${completedOrder.tableNumber} is now marked as AVAILABLE.`}
                </p>
              </div>

              {/* Settlement summary box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 text-left font-mono space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                  <span>{t.orderNumberLabel}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                  <span>{t.totalBill}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {settings.currencySymbol}{completedOrder.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                  <span>{t.customerPaid}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {settings.currencySymbol}{completedOrder.paymentDetails?.cashReceived.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-dashed border-slate-300 dark:border-neutral-600 pt-2 flex justify-between font-bold text-base text-emerald-600 dark:text-emerald-400">
                  <span>{t.changeGiven}:</span>
                  <span>{settings.currencySymbol}{completedChange.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-orange-600/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.printReceipt}</span>
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 font-semibold text-sm rounded-xl cursor-pointer"
                >
                  {t.done}
                </button>
              </div>
            </div>
          ) : (
            /* PAYMENT FORM VIEW */
            <>
              {/* Order Metadata */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 pb-2 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800 dark:text-neutral-200">
                    {language === 'km' ? 'តុ' : 'Table'} {payingOrder.tableNumber}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Users className="w-3.5 h-3.5" />
                    {payingOrder.guests} {t.covers}
                  </span>
                </div>
                <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                  {payingOrder.status === 'BILL REQUESTED' ? t.billRequested : t.unpaid}
                </span>
              </div>

              {/* Itemized preview */}
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {payingOrder.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 dark:text-neutral-500">
                        {item.quantity}×
                      </span>
                      <span className="text-slate-800 dark:text-neutral-200 font-medium">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono text-slate-700 dark:text-neutral-300 font-semibold">
                      {settings.currencySymbol}{item.itemTotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill Totals Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-neutral-400">
                  <span>{t.subtotal}</span>
                  <span className="font-mono">{settings.currencySymbol}{payingOrder.subtotal.toFixed(2)}</span>
                </div>
                {payingOrder.tax > 0 && (
                  <div className="flex justify-between text-slate-500 dark:text-neutral-400">
                    <span>{t.tax} ({Math.round(settings.taxRate * 100)}%)</span>
                    <span className="font-mono">{settings.currencySymbol}{payingOrder.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 dark:border-neutral-700 pt-2 flex justify-between text-base font-extrabold text-slate-900 dark:text-white">
                  <span>{t.totalAmount}</span>
                  <span className="font-mono text-lg text-orange-600 dark:text-orange-400">
                    {settings.currencySymbol}{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Cash Input & Quick Presets */}
              <div className="space-y-2.5">
                <label
                  htmlFor="cash-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300"
                >
                  {t.customerPaidCash}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                    {settings.currencySymbol}
                  </div>
                  <input
                    id="cash-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={cashInput}
                    onChange={e => {
                      setCashInput(e.target.value);
                      setError(null);
                    }}
                    placeholder="0.00"
                    autoFocus
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl text-lg font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>

                {/* Quick denomination buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExact}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    {t.exact} ({settings.currencySymbol}{total.toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset(10)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700"
                  >
                    {settings.currencySymbol}10
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset(20)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700"
                  >
                    {settings.currencySymbol}20
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset(50)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700"
                  >
                    {settings.currencySymbol}50
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset(100)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700"
                  >
                    {settings.currencySymbol}100
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddAmount(10)}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100"
                  >
                    +10
                  </button>
                </div>
              </div>

              {/* Calculated Change Display */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  !cashInput
                    ? 'bg-slate-50 dark:bg-neutral-800/40 border-slate-200 dark:border-neutral-800'
                    : isInsufficient
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isInsufficient && cashInput ? t.shortfall : t.changeReturn}
                  </span>
                  <span className="text-xl font-mono font-extrabold">
                    {cashInput
                      ? isInsufficient
                        ? `-${settings.currencySymbol}${Math.abs(change).toFixed(2)}`
                        : `${settings.currencySymbol}${change.toFixed(2)}`
                      : `${settings.currencySymbol}0.00`}
                  </span>
                </div>
                {isInsufficient && cashInput && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {t.mustPayAtLeast} {settings.currencySymbol}{total.toFixed(2)}
                  </p>
                )}
                {!isInsufficient && cashInput && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                    {change === 0 ? t.exactPaymentGiven : t.sufficientCashReceived}
                  </p>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-medium whitespace-pre-line flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={isInsufficient || !cashInput}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>{t.completePayment}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
