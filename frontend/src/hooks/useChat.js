import { useState, useCallback, useRef } from 'react';
import { sendChatMessage, createOrder, getGreeting } from '../utils/api';

// Lightweight session id for browser-only chat state.
const generateSessionId = () => {
  return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

/**
 * Custom hook for chat functionality
 */
export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({
    items: [],
    totalPrice: 0
  });
  const [error, setError] = useState(null);
  
  const sessionIdRef = useRef(generateSessionId());
  
  // Initialize with greeting
  const initGreeting = useCallback(async () => {
    try {
      const response = await getGreeting();
      if (response?.message) {
        setMessages([{
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
          suggestedActions: response.suggestedActions || []
        }]);
      }
    } catch (err) {
      console.error('Failed to get greeting:', err);
      // Use fallback greeting in English
      setMessages([{
        role: 'assistant',
        content: 'Hello and welcome to JAFS Gressvik! I\'m your AI ordering assistant. How may I help you today?',
        timestamp: new Date().toISOString(),
        suggestedActions: ['View Menu', 'See Pizzas', 'Opening Hours']
      }]);
    }
  }, []);
  
  // Send message
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return null;
    
    setError(null);
    setIsLoading(true);
    
    // Add user message immediately
    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await sendChatMessage(
        sessionIdRef.current,
        text,
        currentOrder
      );
      
      // Add assistant response with suggested actions
      const assistantMessage = {
        role: 'assistant',
        content: response.message || 'Sorry, something went wrong.',
        timestamp: new Date().toISOString(),
        data: response,
        suggestedActions: response.suggestedActions || []
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update order if items changed
      if (response.orderItems && response.orderItems.length > 0) {
        setCurrentOrder({
          items: response.orderItems,
          totalPrice: response.totalPrice || 0
        });
      }
      
      // Check for escalation
      if (response.shouldEscalate) {
        console.log('Escalation triggered:', response.escalationReason);
      }
      
      return response;
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
      
      // Add error message in English
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, an error occurred. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      }]);
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentOrder]);
  
  // Clear chat and reset
  const clearChat = useCallback(() => {
    sessionIdRef.current = generateSessionId();
    setMessages([]);
    setCurrentOrder({ items: [], totalPrice: 0 });
    setError(null);
  }, []);
  
  // Finalize order
  const finalizeOrder = useCallback(async () => {
    if (currentOrder.items.length === 0) {
      setError('No items in your order');
      return null;
    }
    
    setIsLoading(true);
    
    try {
      const order = await createOrder({
        items: currentOrder.items,
        totalPrice: currentOrder.totalPrice,
        sessionId: sessionIdRef.current,
        transcript: messages
      });
      
      // Add confirmation message in English
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Your order #${order.orderId} has been confirmed! Total: ${order.totalPrice}kr. It will be ready in about 15-20 minutes. Thank you for choosing JAFS Gressvik!`,
        timestamp: new Date().toISOString(),
        suggestedActions: ['Start New Order']
      }]);
      
      return order;
    } catch (err) {
      console.error('Order error:', err);
      setError('Could not complete your order');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentOrder, messages]);
  
  // Add item to order manually
  const addItem = useCallback((item) => {
    setCurrentOrder(prev => ({
      items: [...prev.items, item],
      totalPrice: prev.totalPrice + (item.price || 0)
    }));
  }, []);
  
  // Remove item from order
  const removeItem = useCallback((index) => {
    setCurrentOrder(prev => {
      const newItems = [...prev.items];
      const removed = newItems.splice(index, 1)[0];
      return {
        items: newItems,
        totalPrice: prev.totalPrice - (removed?.price || 0)
      };
    });
  }, []);
  
  return {
    messages,
    isLoading,
    currentOrder,
    error,
    sendMessage,
    clearChat,
    finalizeOrder,
    addItem,
    removeItem,
    sessionId: sessionIdRef.current,
    initGreeting
  };
};

export default useChat;
