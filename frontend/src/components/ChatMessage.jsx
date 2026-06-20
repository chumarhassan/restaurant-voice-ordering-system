import React from 'react';
import { User, Bot, AlertCircle, MapPin, Clock, Phone as PhoneIcon } from 'lucide-react';

/**
 * Chat message bubble component with rich formatting
 */
const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;
  
  // Clean content - remove any JSON that might have slipped through
  const cleanContent = (content) => {
    if (!content) return '';
    
    // Remove any JSON objects from the content
    let cleaned = content.replace(/\{[\s\S]*?"message"[\s\S]*?\}/g, '');
    
    // Remove standalone JSON-like patterns
    cleaned = cleaned.replace(/\{[^{}]*\}/g, '');
    
    // Clean up extra whitespace and newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    
    return cleaned;
  };
  
  // Parse and format message content for better display
  const formatContent = (content) => {
    const cleaned = cleanContent(content);
    if (!cleaned) return null;
    
    // Split into lines
    const lines = cleaned.split('\n');
    
    return lines.map((line, idx) => {
      // Skip empty lines but add spacing
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      
      // Format lines that look like menu items (with prices)
      const priceMatch = line.match(/(.+?)\s*[-–:]\s*(\d+)\s*kr/i);
      if (priceMatch) {
        return (
          <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
            <span className="text-gray-200">{priceMatch[1].trim()}</span>
            <span className="text-orange-400 font-semibold ml-4">{priceMatch[2]}kr</span>
          </div>
        );
      }
      
      // Format total lines
      if (line.toLowerCase().includes('total')) {
        const totalMatch = line.match(/(\d+)\s*kr/i);
        if (totalMatch) {
          return (
            <div key={idx} className="flex justify-between items-center py-2 mt-2 border-t border-orange-500/30 font-bold text-orange-400">
              <span>Total</span>
              <span>{totalMatch[1]}kr</span>
            </div>
          );
        }
      }
      
      // Format list items (starting with -)
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return (
          <div key={idx} className="flex items-start gap-2 py-0.5">
            <span className="text-orange-400 mt-1">•</span>
            <span className="text-gray-200">{line.replace(/^[-•]\s*/, '')}</span>
          </div>
        );
      }
      
      // Format numbered items
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
      if (numberedMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 py-0.5">
            <span className="text-orange-400 font-semibold min-w-[20px]">{numberedMatch[1]}.</span>
            <span className="text-gray-200">{numberedMatch[2]}</span>
          </div>
        );
      }
      
      // Regular line
      return <p key={idx} className="text-gray-200 mb-1 last:mb-0 leading-relaxed">{line}</p>;
    });
  };
  
  // Render restaurant info card if message contains location/hours info
  const renderInfoCard = () => {
    const content = message.content?.toLowerCase() || '';
    
    if (content.includes('storveien') || content.includes('address') || content.includes('location')) {
      return (
        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <MapPin size={16} />
            <span className="font-semibold">Our Location</span>
          </div>
          <p className="text-sm text-gray-300">Storveien 78, 1621 Gressvik</p>
        </div>
      );
    }
    
    if (content.includes('opening') || content.includes('hours') || content.includes('åpningstid')) {
      return (
        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Clock size={16} />
            <span className="font-semibold">Opening Hours</span>
          </div>
          <div className="text-sm text-gray-300 space-y-1">
            <p>Monday: Closed</p>
            <p>Tue-Thu: 14:00 - 23:00</p>
            <p>Fri-Sat: 13:00 - 23:00</p>
            <p>Sunday: 12:00 - 23:00</p>
          </div>
        </div>
      );
    }
    
    if (content.includes('phone') || content.includes('call us') || content.includes('telefon')) {
      return (
        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <PhoneIcon size={16} />
            <span className="font-semibold">Contact Us</span>
          </div>
          <p className="text-sm text-gray-300">69 333 200</p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div 
      className={`flex items-start gap-3 animate-slide-in ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
        isUser 
          ? 'bg-gradient-to-br from-orange-400 to-orange-600' 
          : isError 
            ? 'bg-gradient-to-br from-red-400 to-red-600' 
            : 'bg-gradient-to-br from-blue-400 to-purple-500'
      }`}>
        {isUser ? (
          <User size={20} className="text-white" />
        ) : isError ? (
          <AlertCircle size={20} className="text-white" />
        ) : (
          <Bot size={20} className="text-white" />
        )}
      </div>
      
      {/* Message bubble */}
      <div 
        className={`max-w-[85%] md:max-w-[75%] px-4 py-3 ${
          isUser 
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl rounded-tr-md' 
            : isError 
              ? 'bg-red-500/20 text-red-200 rounded-2xl border border-red-500/30' 
              : 'bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-md border border-white/10'
        }`}
      >
        {/* Sender label for assistant */}
        {!isUser && !isError && (
          <div className="text-xs text-orange-400 font-semibold mb-2 uppercase tracking-wide">
            JAFS Assistant
          </div>
        )}
        
        {/* Message content - with formatting */}
        <div className="break-words">
          {isUser ? (
            <span className="text-white">{message.content}</span>
          ) : (
            formatContent(message.content)
          )}
        </div>
        
        {/* Info card for location/hours */}
        {!isUser && !isError && renderInfoCard()}
        
        {/* Timestamp */}
        <div className={`text-[10px] mt-2 opacity-60 ${
          isUser ? 'text-right' : ''
        }`}>
          {new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
