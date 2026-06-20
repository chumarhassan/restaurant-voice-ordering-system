import React, { useRef } from 'react';
import { X, Printer, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Order receipt modal component
 */
const Receipt = ({ order, onClose, showCallAgain = false }) => {
  const receiptRef = useRef(null);
  const navigate = useNavigate();
  
  if (!order) return null;
  
  // Print receipt
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - JAFS Gressvik</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            max-width: 300px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
            color: #000;
          }
          .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 15px; margin-bottom: 15px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 5px 0; vertical-align: top; }
          .price { text-align: right; }
          .total { border-top: 2px solid #333; font-weight: bold; font-size: 18px; margin-top: 15px; padding-top: 10px; }
          .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #333; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>JAFS GRESSVIK</h1>
          <p>FABULOUS FAST FOOD</p>
          <p>Storveien 78, 1621 Gressvik</p>
          <p>Tel: 69 333 200</p>
        </div>
        <p><strong>Order #:</strong> ${order.orderId}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString('en-US')}</p>
        <p><strong>Type:</strong> ${order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</p>
        <table>
          ${order.items?.map(item => `
            <tr>
              <td>${item.quantity}x</td>
              <td>${item.name}${item.size ? ` (${item.size})` : ''}${item.addons?.length ? `<br><small>+ ${item.addons.join(', ')}</small>` : ''}</td>
              <td class="price">${item.price}kr</td>
            </tr>
          `).join('') || ''}
        </table>
        <div class="total">
          <table>
            <tr><td>TOTAL:</td><td class="price">${order.totalPrice}kr</td></tr>
          </table>
        </div>
        <div class="footer">
          <p>Thank you for your order!</p>
          <p>See you again soon!</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
        ref={receiptRef}
      >
        {/* Thank you message for call receipts */}
        {showCallAgain && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-4 rounded-t-2xl">
            <h2 className="text-xl font-bold">📄 Here's Your Receipt!</h2>
            <p className="text-sm opacity-90 mt-1">Thank you for ordering from JAFS</p>
          </div>
        )}
        
        {/* Receipt content */}
        <div className="p-6">
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <span className="text-2xl text-white font-bold">J</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">JAFS GRESSVIK</h1>
            <p className="text-sm text-orange-600 font-medium">FABULOUS FAST FOOD</p>
            <p className="text-xs text-gray-500 mt-2">Storveien 78, 1621 Gressvik</p>
            <p className="text-xs text-gray-500">Tel: 69 333 200</p>
          </div>
          
          {/* Order info */}
          <div className="text-sm text-gray-600 mb-4 space-y-1">
            <div className="flex justify-between">
              <span>Order #:</span>
              <span className="font-mono font-bold text-orange-600">{order.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(order.createdAt).toLocaleString('en-US')}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span>{order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</span>
            </div>
          </div>
          
          {/* Items */}
          <div className="border-t border-gray-200 pt-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <span className="text-orange-600 font-mono">{item.quantity}x</span>
                  <span className="text-gray-800 ml-2">{item.name}</span>
                  {item.size && (
                    <span className="text-gray-500 text-xs ml-1">({item.size})</span>
                  )}
                  {item.addons?.length > 0 && (
                    <div className="text-xs text-green-600 ml-6">
                      + {item.addons.join(', ')}
                    </div>
                  )}
                </div>
                <span className="font-semibold text-gray-800">{item.price}kr</span>
              </div>
            ))}
          </div>
          
          {/* Total */}
          <div className="border-t-2 border-gray-800 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">TOTAL</span>
              <span className="text-2xl font-bold text-orange-600">{order.totalPrice}kr</span>
            </div>
          </div>
          
          {/* Estimated time */}
          <div className="mt-4 p-3 bg-green-50 rounded-lg text-center border border-green-200">
            <p className="text-green-800 font-medium">
              Ready in approximately 15-20 minutes
            </p>
          </div>
          
          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t-2 border-dashed border-gray-300">
            <p className="text-gray-600 font-medium">Thank you for your order!</p>
            <p className="text-sm text-gray-500">We hope to see you again soon!</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="bg-gray-50 p-4 flex flex-col gap-3 rounded-b-2xl">
          {showCallAgain && (
            <button
              onClick={() => {
                onClose();
                navigate('/call');
                // Small delay to ensure navigation completes
                setTimeout(() => {
                  window.location.reload();
                }, 100);
              }}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Phone size={18} />
              Call Again
            </button>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Printer size={18} />
              Print Receipt
            </button>
            
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <X size={18} />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
