/**
 * Order Service
 * Handles order creation, storage, and management
 */

import { v4 as uuidv4 } from 'uuid';

// In-memory order storage (replaced with MongoDB in production)
const orders = new Map();

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Order types
export const ORDER_TYPE = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery'
};

/**
 * Create a new order
 */
export const createOrder = async (orderData) => {
  const orderId = uuidv4().split('-')[0].toUpperCase(); // Short order ID like "A1B2C3"
  
  const order = {
    orderId,
    items: orderData.items || [],
    totalPrice: orderData.totalPrice || 0,
    orderType: orderData.orderType || ORDER_TYPE.PICKUP,
    customerName: orderData.customerName || 'Guest',
    customerPhone: orderData.customerPhone || '',
    customerAddress: orderData.customerAddress || '',
    notes: orderData.notes || '',
    status: ORDER_STATUS.CONFIRMED,
    sessionId: orderData.sessionId || '',
    transcript: orderData.transcript || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedReadyTime: new Date(Date.now() + 20 * 60 * 1000).toISOString() // 20 minutes
  };
  
  // Calculate total if not provided
  if (!order.totalPrice && order.items.length > 0) {
    order.totalPrice = order.items.reduce((sum, item) => sum + (item.price || 0), 0);
  }
  
  // Store order
  orders.set(orderId, order);
  
  console.log(`✅ Order created: ${orderId} - ${order.totalPrice}kr`);
  
  return order;
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId) => {
  return orders.get(orderId) || null;
};

/**
 * Get all orders
 */
export const getAllOrders = async (filters = {}) => {
  let orderList = Array.from(orders.values());
  
  // Apply filters
  if (filters.status) {
    orderList = orderList.filter(o => o.status === filters.status);
  }
  
  if (filters.orderType) {
    orderList = orderList.filter(o => o.orderType === filters.orderType);
  }
  
  if (filters.date) {
    const filterDate = new Date(filters.date).toDateString();
    orderList = orderList.filter(o => new Date(o.createdAt).toDateString() === filterDate);
  }
  
  // Sort by creation date (newest first)
  orderList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const start = (page - 1) * limit;
  
  return {
    orders: orderList.slice(start, start + limit),
    total: orderList.length,
    page,
    totalPages: Math.ceil(orderList.length / limit)
  };
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, status) => {
  const order = orders.get(orderId);
  
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }
  
  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  
  order.status = status;
  order.updatedAt = new Date().toISOString();
  
  orders.set(orderId, order);
  
  return order;
};

/**
 * Update order details
 */
export const updateOrder = async (orderId, updates) => {
  const order = orders.get(orderId);
  
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }
  
  // Update allowed fields
  const allowedUpdates = ['items', 'totalPrice', 'customerName', 'customerPhone', 
                          'customerAddress', 'notes', 'status', 'orderType'];
  
  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      order[key] = updates[key];
    }
  }
  
  order.updatedAt = new Date().toISOString();
  
  // Recalculate total if items changed
  if (updates.items) {
    order.totalPrice = order.items.reduce((sum, item) => sum + (item.price || 0), 0);
  }
  
  orders.set(orderId, order);
  
  return order;
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId, reason = '') => {
  const order = orders.get(orderId);
  
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }
  
  order.status = ORDER_STATUS.CANCELLED;
  order.cancellationReason = reason;
  order.updatedAt = new Date().toISOString();
  
  orders.set(orderId, order);
  
  return order;
};

/**
 * Generate receipt HTML
 */
export const generateReceipt = (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.quantity}x</td>
      <td>
        ${item.name}
        ${item.size ? `<small>(${item.size})</small>` : ''}
        ${item.addons?.length ? `<br><small>+ ${item.addons.join(', ')}</small>` : ''}
      </td>
      <td class="price">${item.price}kr</td>
    </tr>
  `).join('');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Kvittering - JAFS Gressvik</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      max-width: 300px;
      margin: 0 auto;
      padding: 20px;
      background: #fff;
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #333;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 5px 0;
      font-size: 12px;
    }
    .order-info {
      margin-bottom: 15px;
      font-size: 14px;
    }
    .order-info strong {
      display: inline-block;
      width: 100px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    td {
      padding: 5px 0;
      vertical-align: top;
    }
    .price {
      text-align: right;
      white-space: nowrap;
    }
    .total {
      border-top: 2px solid #333;
      font-weight: bold;
      font-size: 18px;
      margin-top: 15px;
      padding-top: 10px;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px dashed #333;
      font-size: 12px;
    }
    @media print {
      body { margin: 0; padding: 10px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍔 JAFS GRESSVIK</h1>
    <p>FABELAKTIG FASTFOOD</p>
    <p>Storveien 78, 1621 Gressvik</p>
    <p>Tlf: 69 333 200</p>
  </div>
  
  <div class="order-info">
    <p><strong>Ordre #:</strong> ${order.orderId}</p>
    <p><strong>Dato:</strong> ${new Date(order.createdAt).toLocaleString('no-NO')}</p>
    <p><strong>Type:</strong> ${order.orderType === 'pickup' ? 'Henting' : 'Levering'}</p>
    ${order.customerName !== 'Guest' ? `<p><strong>Kunde:</strong> ${order.customerName}</p>` : ''}
    ${order.customerPhone ? `<p><strong>Tlf:</strong> ${order.customerPhone}</p>` : ''}
  </div>
  
  <table>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>
  
  <div class="total">
    <table>
      <tr>
        <td>TOTAL:</td>
        <td class="price">${order.totalPrice}kr</td>
      </tr>
    </table>
  </div>
  
  ${order.notes ? `<p style="margin-top: 15px;"><strong>Notater:</strong> ${order.notes}</p>` : ''}
  
  <div class="footer">
    <p>Takk for besøket!</p>
    <p>Velkommen tilbake! 😊</p>
  </div>
</body>
</html>
  `;
};

/**
 * Get order statistics
 */
export const getOrderStats = async () => {
  const orderList = Array.from(orders.values());
  const today = new Date().toDateString();
  const todayOrders = orderList.filter(o => new Date(o.createdAt).toDateString() === today);
  
  return {
    totalOrders: orderList.length,
    todayOrders: todayOrders.length,
    todayRevenue: todayOrders.reduce((sum, o) => sum + o.totalPrice, 0),
    pendingOrders: orderList.filter(o => o.status === ORDER_STATUS.PENDING).length,
    preparingOrders: orderList.filter(o => o.status === ORDER_STATUS.PREPARING).length,
    completedToday: todayOrders.filter(o => o.status === ORDER_STATUS.COMPLETED).length,
    averageOrderValue: todayOrders.length > 0 
      ? Math.round(todayOrders.reduce((sum, o) => sum + o.totalPrice, 0) / todayOrders.length)
      : 0
  };
};

export default {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrder,
  cancelOrder,
  generateReceipt,
  getOrderStats,
  ORDER_STATUS,
  ORDER_TYPE
};
