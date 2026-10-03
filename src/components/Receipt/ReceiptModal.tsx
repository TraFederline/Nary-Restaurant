import React from 'react';
import { usePOS } from '../../context/POSContext';
import { X, Printer, Download, Sparkles } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { viewReceiptOrder, setViewReceiptOrder, settings, t, language } = usePOS();

  if (!viewReceiptOrder) return null;

  const order = viewReceiptOrder;
  const payment = order.paymentDetails;
  const dateObj = new Date(order.paymentDetails?.paidAt || order.createdAt);
  const formattedDate = dateObj.toLocaleDateString(language === 'km' ? 'km-KH' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const divider = '==========================================\n';
    const subDivider = '------------------------------------------\n';

    let content = '';
    content += divider;
    content += `          ${settings.name.toUpperCase()}\n`;
    content += `      ${settings.address}\n`;
    content += `         Tel: ${settings.phone}\n`;
    content += divider;
    content += `Order:   ${order.orderNumber}\n`;
    content += `Table:   ${order.tableNumber}\n`;
    content += `Guests:  ${order.guests}\n`;
    content += `Date:    ${formattedDate}\n`;
    content += `Time:    ${formattedTime}\n`;
    content += `Cashier: ${payment?.processedBy || 'Admin'}\n`;
    content += subDivider;

    order.items.forEach(item => {
      const itemLine = `${item.name} x${item.quantity}`;
      const priceLine = `${settings.currencySymbol}${item.itemTotal.toFixed(2)}`;
      const spaces = Math.max(1, 42 - itemLine.length - priceLine.length);
      content += `${itemLine}${' '.repeat(spaces)}${priceLine}\n`;
    });

    content += subDivider;
    content += `Subtotal:                              ${settings.currencySymbol}${order.subtotal.toFixed(2)}\n`;
    if (order.tax > 0) {
      content += `Tax (${Math.round(settings.taxRate * 100)}%):                              ${settings.currencySymbol}${order.tax.toFixed(2)}\n`;
    }
    content += `TOTAL                                  ${settings.currencySymbol}${order.total.toFixed(2)}\n\n`;

    if (payment) {
      content += `Cash Received:                         ${settings.currencySymbol}${payment.cashReceived.toFixed(2)}\n`;
      content += `Change Given:                          ${settings.currencySymbol}${payment.changeGiven.toFixed(2)}\n`;
    }

    content += `Payment Status:                        ${order.status}\n`;
    content += subDivider;
    content += `              ${settings.receiptFooter || (language === 'km' ? 'សូមអរគុណ! សូមអញ្ជើញមកពិសារម្ដងទៀត' : 'Thank You! Please Come Again')}\n`;
    content += divider;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${order.orderNumber.replace('#', '')}_Table${order.tableNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-neutral-800 transition-all max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-neutral-800/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-neutral-200">
              {t.receiptTitle}
            </span>
          </div>
          <button
            onClick={() => setViewReceiptOrder(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-neutral-950 flex justify-center">
          {/* Printable Ticket */}
          <div
            id="printable-receipt"
            className={`w-full max-w-[340px] bg-white text-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 text-xs select-text ${
              language === 'km' ? 'font-khmer leading-relaxed' : 'font-mono'
            }`}
          >
            {/* Store Brand */}
            <div className="text-center pb-4 border-b border-dashed border-slate-400">
              <div className="text-base font-extrabold tracking-wider">{settings.name}</div>
              <div className="text-[11px] text-slate-600 mt-0.5">{settings.address}</div>
              <div className="text-[11px] text-slate-600">Tel: {settings.phone}</div>
            </div>

            {/* Order Meta */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>{language === 'km' ? 'កុម្ម៉ង់:' : 'Order:'}</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'km' ? 'លេខតុ:' : 'Table:'}</span>
                <span className="font-bold">{order.tableNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'km' ? 'ភ្ញៀវ:' : 'Guests:'}</span>
                <span>{order.guests}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'km' ? 'កាលបរិច្ឆេទ:' : 'Date:'}</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'km' ? 'ម៉ោង:' : 'Time:'}</span>
                <span>{formattedTime}</span>
              </div>
              {payment?.processedBy && (
                <div className="flex justify-between">
                  <span>{language === 'km' ? 'អ្នកគិតលុយ:' : 'Cashier:'}</span>
                  <span>{payment.processedBy}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-start text-[11px]">
                  <div className="pr-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-slate-500 block text-[10px]">
                      {item.quantity} × {settings.currencySymbol}{item.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="font-bold shrink-0">
                    {settings.currencySymbol}{item.itemTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>{language === 'km' ? 'សរុបបឋម:' : 'Subtotal:'}</span>
                <span>{settings.currencySymbol}{order.subtotal.toFixed(2)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{language === 'km' ? 'ពន្ធ:' : 'Tax:'} ({Math.round(settings.taxRate * 100)}%)</span>
                  <span>{settings.currencySymbol}{order.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm pt-1 text-slate-900">
                <span>{language === 'km' ? 'សរុបរួម:' : 'TOTAL:'}</span>
                <span>{settings.currencySymbol}{order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment & Change */}
            {payment && (
              <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>{language === 'km' ? 'ប្រាក់បានបង់:' : 'Cash Received:'}</span>
                  <span>{settings.currencySymbol}{payment.cashReceived.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>{language === 'km' ? 'ប្រាក់អាប់:' : 'Change:'}</span>
                  <span>{settings.currencySymbol}{payment.changeGiven.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Status Stamp */}
            <div className="py-2 flex items-center justify-between text-[11px] font-bold">
              <span>{language === 'km' ? 'ស្ថានភាព:' : 'Payment Status:'}</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] uppercase tracking-wider font-bold">
                {order.status === 'PAID' && language === 'km' ? 'បានបង់ប្រាក់ (PAID)' : order.status}
              </span>
            </div>

            {/* Footer */}
            <div className="pt-4 text-center border-t border-dashed border-slate-400 space-y-1">
              <div className="text-[11px] font-semibold text-slate-700">
                {language === 'km' ? 'សូមអរគុណ!' : 'Thank You!'}
              </div>
              <div className="text-[10px] text-slate-500">
                {settings.receiptFooter || (language === 'km' ? 'សូមអញ្ជើញមកពិសារម្ដងទៀត' : 'Please Come Again')}
              </div>
              <div className="text-[8px] text-slate-400 pt-2 tracking-widest uppercase">
                {settings.name} POS
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-neutral-800 flex gap-2.5 bg-white dark:bg-neutral-900">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-orange-600/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printReceipt}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadReceipt}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
