/**
 * API utility functions
 */

const API_BASE = '/api';

// Generic fetch wrapper with error handling
const fetchApi = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }
    
    return data.data || data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Chat API
export const sendChatMessage = async (sessionId, message, currentOrder = null) => {
  return fetchApi('/chat', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      message,
      currentOrder
    })
  });
};

export const getGreeting = async () => {
  return fetchApi('/chat/greeting', {
    method: 'POST'
  });
};

export const getTranscript = async (sessionId) => {
  return fetchApi(`/chat/${sessionId}/transcript`);
};

// Menu API
export const fetchMenu = async () => {
  return fetchApi('/menu');
};

export const searchMenu = async (query) => {
  return fetchApi(`/menu/search?q=${encodeURIComponent(query)}`);
};

export const getMenuItem = async (itemId) => {
  return fetchApi(`/menu/item/${itemId}`);
};

// Orders API
export const createOrder = async (orderData) => {
  return fetchApi('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
};

export const fetchOrders = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.date) params.append('date', filters.date);
  if (filters.page) params.append('page', filters.page);
  
  return fetchApi(`/orders?${params.toString()}`);
};

export const fetchOrderStats = async () => {
  return fetchApi('/orders/stats');
};

export const getOrder = async (orderId) => {
  return fetchApi(`/orders/${orderId}`);
};

export const getOrderReceipt = async (orderId) => {
  return fetchApi(`/orders/${orderId}/receipt`);
};

export const updateOrderStatus = async (orderId, status) => {
  return fetchApi(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
};

// Transcripts API
export const fetchTranscripts = async () => {
  return fetchApi('/transcripts');
};

export default {
  sendChatMessage,
  getGreeting,
  getTranscript,
  fetchMenu,
  searchMenu,
  getMenuItem,
  createOrder,
  fetchOrders,
  fetchOrderStats,
  getOrder,
  getOrderReceipt,
  updateOrderStatus,
  fetchTranscripts
};
