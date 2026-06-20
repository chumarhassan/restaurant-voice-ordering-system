import React from 'react';
import { ShoppingCart, Trash2, Check } from 'lucide-react';

/**
 * Order summary sidebar component
 */
const OrderSummary = ({ order, onFinalize }) => {
  const items = order?.items || [];
  const total = order?.totalPrice || 0;
  const hasItems = items.length > 0;
  
  return (
    <div className="glass rounded-2xl h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="p-2 bg-orange-500/20 rounded-lg">
          <ShoppingCart size={20} className="text-orange-400" />
        </div>
        <div>
          <h2 className="font-semibold text-white">Your Order</h2>
          <p className="text-xs text-gray-400">
            {hasItems ? `${items.length} item${items.length > 1 ? 's' : ''}` : 'No items yet'}
          </p>
        </div>
      </div>
      
      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4">
        {!hasItems ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
            <ShoppingCart size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Order by speaking or typing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div 
                key={index}
                className="bg-white/5 rounded-lg p-3 flex justify-between items-start"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-mono text-sm">
                      {item.quantity}x
                    </span>
                    <span className="text-white text-sm font-medium">
                      {item.name}
                    </span>
                  </div>
                  
                  {item.size && (
                    <span className="text-xs text-gray-500 ml-6">
                      {item.size}
                    </span>
                  )}
                  
                  {item.addons && item.addons.length > 0 && (
                    <div className="text-xs text-green-400/70 ml-6 mt-1">
                      + {item.addons.join(', ')}
                    </div>
                  )}
                  
                  {item.notes && (
                    <div className="text-xs text-gray-500 ml-6 mt-1 italic">
                      "{item.notes}"
                    </div>
                  )}
                </div>
                
                <span className="text-white font-semibold text-sm">
                  {item.price}kr
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer with total and finalize button */}
      <div className="p-4 border-t border-white/10">
        {/* Total */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400">Total</span>
          <span className="text-2xl font-bold text-orange-500">
            {total}kr
          </span>
        </div>
        
        {/* Finalize button */}
        <button
          onClick={onFinalize}
          disabled={!hasItems}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            hasItems
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Check size={20} />
          Complete Order
        </button>
        
        {hasItems && (
          <p className="text-center text-xs text-gray-500 mt-2">
            Say "that's all" or click to complete
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
