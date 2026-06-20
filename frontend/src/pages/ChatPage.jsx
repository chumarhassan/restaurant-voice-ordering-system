import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Trash2, ShoppingCart, Check, MapPin, Clock, Phone } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import OrderSummary from '../components/OrderSummary';
import Receipt from '../components/Receipt';

/**
 * Chat-only ordering page - Text and buttons, no voice
 */
const ChatPage = () => {
  const [inputText, setInputText] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [suggestedActions, setSuggestedActions] = useState([
    'View Menu', 'See Pizzas', 'See Burgers', 'See Kebab'
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const {
    messages,
    isLoading,
    currentOrder,
    sendMessage,
    clearChat,
    finalizeOrder,
    initGreeting
  } = useChat();
  
  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      initGreeting();
    }
  }, []);
  
  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  // Update suggested actions from AI response
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.suggestedActions) {
        setSuggestedActions(lastMessage.suggestedActions);
      }
    }
  }, [messages]);
  
  // Handle send message
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const message = inputText.trim();
    setInputText('');
    setSuggestedActions([]);
    
    const response = await sendMessage(message);
    
    if (response?.suggestedActions) {
      setSuggestedActions(response.suggestedActions);
    }
    
    if (response?.orderComplete) {
      const order = await finalizeOrder();
      if (order) {
        setCompletedOrder(order);
        setShowReceipt(true);
      }
    }
  };
  
  // Handle quick action click
  const handleQuickAction = async (action) => {
    setSuggestedActions([]);
    const response = await sendMessage(action);
    if (response?.suggestedActions) {
      setSuggestedActions(response.suggestedActions);
    }
  };
  
  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Clear and reset
  const handleClear = () => {
    clearChat();
    setInputText('');
    setCompletedOrder(null);
    setShowReceipt(false);
    setSuggestedActions(['View Menu', 'See Pizzas', 'See Burgers', 'See Kebab']);
    initGreeting();
  };
  
  // Clean message content (remove JSON)
  const cleanContent = (content) => {
    if (!content) return '';
    return content
      .replace(/\{[\s\S]*?"message"[\s\S]*?\}/g, '')
      .replace(/\{[^{}]*\}/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      {/* Chat section */}
      <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">J</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">JAFS Gressvik</h1>
              <p className="text-xs text-gray-400">Chat ordering - Type or tap to order</p>
            </div>
          </div>
          
          <button
            onClick={handleClear}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Start Over"
          >
            <Trash2 size={20} />
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-md'
                    : 'bg-white/10 text-gray-200 rounded-bl-md border border-white/10'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="text-xs text-orange-400 font-semibold mb-1">JAFS Assistant</div>
                )}
                <div className="whitespace-pre-wrap">{cleanContent(msg.content)}</div>
                <div className={`text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-sm text-gray-400">Typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Actions */}
        {suggestedActions.length > 0 && !isLoading && (
          <div className="px-4 py-3 border-t border-white/5 bg-white/5">
            <div className="flex flex-wrap gap-2">
              {suggestedActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action)}
                  className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-full text-sm text-orange-300 hover:text-orange-200 transition-all hover:scale-105"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input area */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your order or question..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              disabled={isLoading}
            />
            
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="flex-shrink-0 w-12 h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Order summary sidebar */}
      <div className="lg:w-80 flex-shrink-0">
        <OrderSummary 
          order={currentOrder}
          onFinalize={async () => {
            const order = await finalizeOrder();
            if (order) {
              setCompletedOrder(order);
              setShowReceipt(true);
            }
          }}
        />
        
        {/* Restaurant Info Card */}
        <div className="mt-4 glass rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Phone size={16} className="text-orange-400" />
            Restaurant Info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 text-gray-400">
              <MapPin size={14} className="text-orange-400 mt-0.5" />
              <span>Storveien 78, 1621 Gressvik</span>
            </div>
            <div className="flex items-start gap-2 text-gray-400">
              <Clock size={14} className="text-orange-400 mt-0.5" />
              <div>
                <p>Mon: Closed</p>
                <p>Tue-Thu: 14:00-23:00</p>
                <p>Fri-Sat: 13:00-23:00</p>
                <p>Sun: 12:00-23:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Receipt modal */}
      {showReceipt && completedOrder && (
        <Receipt 
          order={completedOrder} 
          onClose={() => {
            setShowReceipt(false);
            setCompletedOrder(null);
          }} 
        />
      )}
    </div>
  );
};

export default ChatPage;
