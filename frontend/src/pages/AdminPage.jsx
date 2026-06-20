import React, { useState, useEffect } from 'react';
import { RefreshCw, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../utils/api';

const AdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const ordersData = await fetchOrders();
      setOrders(ordersData.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    loadData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadData(); // Refresh
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };
  
  // Group orders by status
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
  const inProgressOrders = orders.filter(o => o.status === 'preparing');
  const doneOrders = orders.filter(o => o.status === 'ready' || o.status === 'completed');
  
  // Order card component
  const OrderCard = ({ order }) => (
    <div
      onClick={() => setSelectedOrder(order)}
      className="bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-mono text-orange-400 font-semibold">#{order.orderId}</p>
          <p className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold">{order.totalPrice}kr</p>
          <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
        </div>
      </div>
      
      {order.customerName && order.customerName !== 'Guest' && (
        <p className="text-sm text-gray-400 mb-2">Customer: {order.customerName}</p>
      )}
      
      <div className="space-y-1 mb-3">
        {order.items?.slice(0, 2).map((item, idx) => (
          <p key={idx} className="text-sm text-gray-300">
            {item.quantity}x {item.name}
          </p>
        ))}
        {order.items?.length > 2 && (
          <p className="text-xs text-gray-500">+{order.items.length - 2} more...</p>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {order.status === 'pending' && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(order.orderId, 'preparing');
              }}
              className="flex-1 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Start Preparing
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(order.orderId, 'ready');
              }}
              className="py-2 px-3 bg-green-600/50 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              title="Skip to Ready"
            >
              Skip →
            </button>
          </>
        )}
        
        {order.status === 'preparing' && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(order.orderId, 'pending');
              }}
              className="py-2 px-3 bg-yellow-600/50 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
              title="Move back to New"
            >
              ← Back
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(order.orderId, 'ready');
              }}
              className="flex-1 py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Mark Ready
            </button>
          </>
        )}
        
        {order.status === 'ready' && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(order.orderId, 'preparing');
              }}
              className="py-2 px-3 bg-orange-600/50 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
              title="Move back to Preparing"
            >
              ← Back
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(order.orderId, 'completed');
              }}
              className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Complete Order
            </button>
          </>
        )}
        
        {order.status === 'completed' && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(order.orderId, 'ready');
              }}
              className="flex-1 py-2 px-3 bg-green-600/50 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ← Reopen
            </button>
            <div className="flex-1 py-2 px-3 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium text-center">
              ✓ Completed
            </div>
          </>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Order Dashboard</h1>
          <p className="text-gray-400">Manage orders in real-time</p>
        </div>
        
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
      
      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertCircle size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingOrders.length}</p>
              <p className="text-xs text-gray-400">New Orders</p>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{inProgressOrders.length}</p>
              <p className="text-xs text-gray-400">In Progress</p>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{doneOrders.length}</p>
              <p className="text-xs text-gray-400">Done</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Orders columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending/New Orders */}
        <div className="glass rounded-xl p-4">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            New Orders ({pendingOrders.length})
          </h2>
          
          {pendingOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No new orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map(order => (
                <OrderCard key={order.orderId} order={order} />
              ))}
            </div>
          )}
        </div>
        
        {/* In Progress */}
        <div className="glass rounded-xl p-4">
          <h2 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
            <Clock size={20} />
            In Progress ({inProgressOrders.length})
          </h2>
          
          {inProgressOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No orders cooking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inProgressOrders.map(order => (
                <OrderCard key={order.orderId} order={order} />
              ))}
            </div>
          )}
        </div>
        
        {/* Done */}
        <div className="glass rounded-xl p-4">
          <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
            <CheckCircle size={20} />
            Done ({doneOrders.length})
          </h2>
          
          {doneOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No completed orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {doneOrders.map(order => (
                <OrderCard key={order.orderId} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Order detail modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="glass rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Order #{selectedOrder.orderId}
                </h3>
                <div className="text-sm text-gray-400">
                  {new Date(selectedOrder.createdAt).toLocaleString('en-US')}
                </div>
              </div>
              
              <div className="space-y-4">
                {selectedOrder.customerName && selectedOrder.customerName !== 'Guest' && (
                  <div className="text-sm">
                    <span className="text-gray-500">Customer: </span>
                    <span className="text-white">{selectedOrder.customerName}</span>
                  </div>
                )}
                
                <div className="border-t border-white/10 pt-4">
                  <h4 className="font-semibold text-white mb-2">Items</h4>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2 text-gray-300">
                      <span>
                        {item.quantity}x {item.name}
                        {item.size && <span className="text-gray-500 text-sm"> ({item.size})</span>}
                      </span>
                      <span className="text-white">{item.price}kr</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-white/10 pt-4 flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-orange-500">{selectedOrder.totalPrice}kr</span>
                </div>
                
                {selectedOrder.transcript && selectedOrder.transcript.length > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="font-semibold text-white mb-2">Conversation</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 text-sm">
                      {selectedOrder.transcript.map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={`p-2 rounded ${
                            msg.role === 'user' 
                              ? 'bg-orange-500/20 text-orange-200' 
                              : 'bg-white/10 text-gray-300'
                          }`}
                        >
                          <span className="font-semibold">
                            {msg.role === 'user' ? 'Customer: ' : 'AI: '}
                          </span>
                          {msg.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
