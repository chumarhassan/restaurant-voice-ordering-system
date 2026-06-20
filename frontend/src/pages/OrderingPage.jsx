import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Trash2, Phone, PhoneOff, Loader2 } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { useChat } from '../hooks/useChat';
import ChatMessage from '../components/ChatMessage';
import OrderSummary from '../components/OrderSummary';
import Receipt from '../components/Receipt';

const OrderingPage = () => {
  const [inputText, setInputText] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [callActive, setCallActive] = useState(false);
  const [autoListenAfterSpeak, setAutoListenAfterSpeak] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  
  const {
    messages,
    isLoading,
    currentOrder,
    sendMessage,
    clearChat,
    finalizeOrder
  } = useChat();
  
  const {
    isListening,
    transcript,
    isSpeaking,
    speechSupported,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    speakEnabled,
    toggleSpeak,
    interruptSpeech,
    isLoadingAudio
  } = useVoice();
  
  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  // Auto-send message after user stops speaking (silence detection)
  useEffect(() => {
    if (!callActive || !isListening) return;
    
    // Clear any existing timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    // If transcript changed, start a silence timer
    if (transcript && transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      setInputText(transcript);
      
      // Wait for 1.5 seconds of silence before auto-sending
      silenceTimerRef.current = setTimeout(() => {
        if (transcript.trim() && !isLoading && !isSpeaking) {
          // Auto-send the message
          handleSendVoice(transcript.trim());
        }
      }, 1500);
    }
    
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [transcript, callActive, isListening, isLoading, isSpeaking]);
  
  // Auto-start listening after AI finishes speaking (continuous conversation)
  useEffect(() => {
    if (callActive && autoListenAfterSpeak && !isSpeaking && !isLoadingAudio && !isLoading && !isListening) {
      // Small delay before starting to listen again
      const timer = setTimeout(() => {
        if (callActive && !isSpeaking && !isLoadingAudio && !isLoading) {
          startListening();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, isLoadingAudio, isLoading, callActive, autoListenAfterSpeak, isListening, startListening]);
  
  // Speak AI responses and capture suggested actions
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        // Speak if enabled
        if (speakEnabled && callActive) {
          speak(lastMessage.content);
        }
        // Update suggested actions
        if (lastMessage.suggestedActions) {
          setSuggestedActions(lastMessage.suggestedActions);
        }
      }
    }
  }, [messages, speakEnabled, speak, callActive]);
  
  // Interrupt speech when user types
  const handleInputChange = (e) => {
    interruptSpeech();
    setInputText(e.target.value);
  };
  
  // Handle send from voice (auto-send)
  const handleSendVoice = async (message) => {
    if (!message.trim() || isLoading) return;
    
    stopListening();
    setInputText('');
    lastTranscriptRef.current = '';
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
  
  // Handle send message (manual - button/enter)
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const message = inputText.trim();
    setInputText('');
    lastTranscriptRef.current = '';
    setSuggestedActions([]);
    stopListening();
    interruptSpeech();
    
    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
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
    interruptSpeech();
    
    const response = await sendMessage(action);
    
    if (response?.suggestedActions) {
      setSuggestedActions(response.suggestedActions);
    }
  };
  
  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      interruptSpeech();
      handleSend();
    }
  };
  
  // Toggle voice listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      interruptSpeech();
      startListening();
    }
  };
  
  // Start/End call simulation
  const toggleCall = async () => {
    if (callActive) {
      // End call
      setCallActive(false);
      interruptSpeech();
      stopListening();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    } else {
      // Start call
      setCallActive(true);
      clearChat();
      setInputText('');
      setSuggestedActions([]);
      setCompletedOrder(null);
      setShowReceipt(false);
      lastTranscriptRef.current = '';
      
      // Trigger initial greeting
      const response = await sendMessage('hello');
      if (response?.suggestedActions) {
        setSuggestedActions(response.suggestedActions);
      }
    }
  };
  
  // Clear and reset
  const handleClear = () => {
    clearChat();
    setInputText('');
    setCompletedOrder(null);
    setShowReceipt(false);
    setSuggestedActions([]);
    setCallActive(false);
    interruptSpeech();
    stopListening();
    lastTranscriptRef.current = '';
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      {/* Chat section */}
      <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍔</span>
            <div>
              <h1 className="text-lg font-bold text-white">JAFS Voice Ordering</h1>
              <p className="text-xs text-gray-400">
                {callActive ? 'Call in progress...' : 'Start a call to order'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Call button */}
            <button
              onClick={toggleCall}
              className={`p-2 px-4 rounded-lg flex items-center gap-2 transition-all ${
                callActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {callActive ? <PhoneOff size={18} /> : <Phone size={18} />}
              <span className="text-sm font-medium">
                {callActive ? 'End Call' : 'Start Call'}
              </span>
            </button>
            
            <button
              onClick={toggleSpeak}
              className={`p-2 rounded-lg transition-colors ${
                speakEnabled ? 'text-orange-500 bg-orange-500/10' : 'text-gray-400 hover:text-white'
              }`}
              title={speakEnabled ? 'Mute voice' : 'Unmute voice'}
            >
              {speakEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            
            <button
              onClick={handleClear}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
              title="Clear & Reset"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-6 shadow-lg">
                <Phone size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to JAFS Gressvik!</h2>
              <p className="text-gray-400 max-w-md mb-6">
                Click "Start Call" to begin ordering. You can speak or type your order.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['View Menu', 'Kebab', 'Burgers', 'Pizza'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setCallActive(true);
                      sendMessage(item).then(r => {
                        if (r?.suggestedActions) setSuggestedActions(r.suggestedActions);
                      });
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 rounded-xl text-white font-medium transition-all hover:scale-105"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} />
              ))}
              
              {/* Speaking/Loading indicator */}
              {(isSpeaking || isLoadingAudio) && (
                <div className="flex items-center gap-3 text-orange-400 py-2 px-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  {isLoadingAudio ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span className="text-sm">Preparing voice...</span>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-1 items-end h-6">
                        <span className="w-1 bg-orange-500 rounded-full animate-pulse" style={{ height: '8px', animationDuration: '0.6s' }}></span>
                        <span className="w-1 bg-orange-500 rounded-full animate-pulse" style={{ height: '16px', animationDuration: '0.5s', animationDelay: '100ms' }}></span>
                        <span className="w-1 bg-orange-500 rounded-full animate-pulse" style={{ height: '12px', animationDuration: '0.7s', animationDelay: '200ms' }}></span>
                        <span className="w-1 bg-orange-500 rounded-full animate-pulse" style={{ height: '20px', animationDuration: '0.4s', animationDelay: '150ms' }}></span>
                        <span className="w-1 bg-orange-500 rounded-full animate-pulse" style={{ height: '10px', animationDuration: '0.6s', animationDelay: '250ms' }}></span>
                      </div>
                      <span className="text-sm font-medium">Speaking...</span>
                      <button 
                        onClick={interruptSpeech}
                        className="ml-auto text-xs bg-orange-500/20 hover:bg-orange-500/30 px-2 py-1 rounded transition-colors"
                      >
                        Stop
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Actions */}
        {suggestedActions.length > 0 && !isLoading && (
          <div className="px-4 py-3 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
              {suggestedActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action)}
                  className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-full text-sm text-orange-300 hover:text-orange-200 transition-all"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input area */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            {/* Microphone button */}
            <button
              onClick={toggleListening}
              disabled={!speechSupported || !callActive}
              className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 text-white mic-pulse'
                  : callActive
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              } ${!speechSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={interruptSpeech}
              placeholder={
                !callActive 
                  ? 'Start a call first...' 
                  : isListening 
                    ? 'Listening... speak now' 
                    : 'Type your order...'
              }
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              disabled={isLoading || !callActive}
            />
            
            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading || !callActive}
              className="flex-shrink-0 w-12 h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          
          {/* Voice status - continuous call indicator */}
          {callActive && (
            <div className="mt-3 flex items-center justify-center gap-3">
              {isListening ? (
                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Listening - speak your order</span>
                </div>
              ) : isSpeaking || isLoadingAudio ? (
                <div className="flex items-center gap-2 text-orange-400 bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/30">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">AI speaking - interrupt anytime</span>
                </div>
              ) : isLoading ? (
                <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/30">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <Phone size={14} />
                  <span className="text-sm">Call active - waiting...</span>
                </div>
              )}
            </div>
          )}
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
      </div>
      
      {/* Receipt modal */}
      {showReceipt && completedOrder && (
        <Receipt 
          order={completedOrder} 
          onClose={() => {
            setShowReceipt(false);
            handleClear();
          }} 
        />
      )}
    </div>
  );
};

export default OrderingPage;
