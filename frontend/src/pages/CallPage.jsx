import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, User } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useVoice } from '../hooks/useVoice';
import Receipt from '../components/Receipt';

/**
 * Phone-style call interface - Voice only, like a real phone call
 */
const CallPage = () => {
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastAIMessage, setLastAIMessage] = useState('');
  const [callEnding, setCallEnding] = useState(false);
  
  const callTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const lastTranscriptRef = useRef('');
  
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
    speakEnabled,
    toggleSpeak,
    interruptSpeech,
    isLoadingAudio
  } = useVoice();
  
  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Update call timer
  useEffect(() => {
    if (callActive) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      setCallDuration(0);
    }
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callActive]);
  
  // Handle transcript changes - auto-send after silence
  useEffect(() => {
    if (!callActive || !isListening) return;
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    if (transcript && transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      setCurrentTranscript(transcript);
      
      // Wait 2 seconds of silence before sending
      silenceTimerRef.current = setTimeout(() => {
        if (transcript.trim() && !isLoading && !isSpeaking) {
          handleSendVoice(transcript.trim());
        }
      }, 2000);
    }
    
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [transcript, callActive, isListening, isLoading, isSpeaking]);
  
  // Auto-listen after AI finishes speaking
  useEffect(() => {
    if (callActive && !isSpeaking && !isLoadingAudio && !isLoading && !isListening && speakEnabled) {
      const timer = setTimeout(() => {
        if (callActive && !isSpeaking && !isLoadingAudio && !isLoading) {
          startListening();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, isLoadingAudio, isLoading, callActive, isListening, startListening, speakEnabled]);
  
  // Speak AI responses and handle order completion
  useEffect(() => {
    if (messages.length > 0 && callActive) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        const cleanMsg = cleanContent(lastMessage.content);
        setLastAIMessage(cleanMsg);
        if (speakEnabled) {
          speak(cleanMsg);
        }
        
        // Check if order is complete from the message data
        const isOrderComplete = lastMessage.data?.orderComplete || 
                               lastMessage.data?.intent === 'complete' ||
                               (currentOrder?.items?.length > 0 && 
                                (cleanMsg.toLowerCase().includes('thanks') || 
                                 cleanMsg.toLowerCase().includes('thank you') ||
                                 cleanMsg.toLowerCase().includes('have a') ||
                                 cleanMsg.toLowerCase().includes('ready in')));
        
        if (isOrderComplete && currentOrder?.items?.length > 0) {
          console.log('Order complete detected, finalizing...');
          setTimeout(async () => {
            stopListening();
            interruptSpeech();
            setCallEnding(true);
            
            // Speak receipt message
            if (speakEnabled) {
              await speak("Here's your receipt. Thank you for ordering from JAFS!");
            }
            
            // Wait for receipt message to finish, then end call and show receipt
            setTimeout(async () => {
              endCall();
              setCallEnding(false);
              const order = await finalizeOrder();
              if (order) {
                setCompletedOrder(order);
                setShowReceipt(true);
              }
            }, 3000);
          }, 3000); // Wait 3 seconds for goodbye message to finish
        }
      }
    }
  }, [messages, speakEnabled, speak, callActive, finalizeOrder, currentOrder, stopListening]);
  
  // Send voice message
  const handleSendVoice = async (message) => {
    if (!message.trim() || isLoading) return;
    
    stopListening();
    setCurrentTranscript('');
    lastTranscriptRef.current = '';
    
    await sendMessage(message);
  };
  
  // Start call
  const startCall = async () => {
    setCallActive(true);
    clearChat();
    setCurrentTranscript('');
    setLastAIMessage('');
    lastTranscriptRef.current = '';
    
    // Send initial greeting
    const response = await sendMessage('hello');
  };
  
  // End call
  const endCall = () => {
    setCallActive(false);
    interruptSpeech();
    stopListening();
    setCurrentTranscript('');
    setLastAIMessage('');
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  };
  
  // Toggle mute (microphone)
  const toggleMute = () => {
    if (isListening) {
      stopListening();
    } else {
      interruptSpeech();
      startListening();
    }
  };
  
  // Clean content for display
  const cleanContent = (content) => {
    if (!content) return '';
    return content
      .replace(/\{[\s\S]*?"message"[\s\S]*?\}/g, '')
      .replace(/\{[^{}]*\}/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <div className="w-full max-w-md">
        {/* Phone Frame */}
        <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-[3rem] p-3 shadow-2xl">
          {/* Phone Screen */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.5rem] overflow-hidden">
            {/* Notch */}
            <div className="flex justify-center pt-2">
              <div className="w-24 h-6 bg-black rounded-full"></div>
            </div>
            
            {/* Screen Content */}
            <div className="px-6 py-8 min-h-[500px] flex flex-col">
              {!callActive ? (
                /* Idle State - Start Call */
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-6 shadow-2xl">
                    <span className="text-4xl font-bold text-white">J</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">JAFS Gressvik</h2>
                  <p className="text-gray-400 mb-8">Tap to call and order</p>
                  
                  {/* Call Button */}
                  <button
                    onClick={startCall}
                    className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 transition-all hover:scale-110"
                  >
                    <Phone size={32} className="text-white" />
                  </button>
                  <p className="text-sm text-gray-500 mt-4">Voice ordering</p>
                </div>
              ) : (
                /* Active Call State */
                <div className="flex-1 flex flex-col">
                  {/* Call Header */}
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <span className="text-2xl font-bold text-white">J</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">JAFS Gressvik</h3>
                    <p className={`text-sm mt-1 ${callEnding ? 'text-red-400' : 'text-green-400'}`}>
                      {callEnding ? 'Call ending...' : formatDuration(callDuration)}
                    </p>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex-1 flex flex-col justify-center">
                    {callEnding && (
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full text-red-400">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm">Preparing your receipt...</span>
                        </div>
                      </div>
                    )}
                    
                    {!callEnding && isLoadingAudio && (
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full text-orange-400">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-sm">Connecting...</span>
                        </div>
                      </div>
                    )}
                    
                    {!callEnding && isSpeaking && (
                      <div className="text-center mb-4">
                        <div className="flex justify-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-orange-500 rounded-full animate-pulse"
                              style={{
                                height: `${Math.random() * 20 + 10}px`,
                                animationDelay: `${i * 100}ms`,
                                animationDuration: '0.5s'
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-orange-400">AI Speaking</p>
                      </div>
                    )}
                    
                    {!callEnding && isListening && !isSpeaking && (
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2 animate-pulse">
                          <Mic size={28} className="text-green-400" />
                        </div>
                        <p className="text-sm text-green-400">Listening...</p>
                      </div>
                    )}
                    
                    {!callEnding && isLoading && !isSpeaking && (
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-400">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                          <span className="text-sm">Processing...</span>
                        </div>
                      </div>
                    )}
                    
                    {/* No chat bubbles - just phone call */}
                    
                    {/* Order Summary */}
                    {currentOrder?.items?.length > 0 && (
                      <div className="mt-4 mx-2 bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-gray-500 mb-2">Your Order:</p>
                        {currentOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-300">{item.quantity}x {item.name}</span>
                            <span className="text-orange-400">{item.price}kr</span>
                          </div>
                        ))}
                        <div className="border-t border-white/10 mt-2 pt-2 flex justify-between font-semibold">
                          <span className="text-white">Total</span>
                          <span className="text-orange-400">{currentOrder.totalPrice}kr</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Call Controls */}
                  <div className="flex justify-center items-center gap-6 mt-6">
                    {/* Mute Button */}
                    <button
                      onClick={toggleMute}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                        isListening
                          ? 'bg-white/20 text-white'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {isListening ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>
                    
                    {/* End Call Button */}
                    <button
                      onClick={endCall}
                      className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 transition-all"
                    >
                      <PhoneOff size={28} className="text-white" />
                    </button>
                    
                    {/* Speaker Button */}
                    <button
                      onClick={toggleSpeak}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                        speakEnabled
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {speakEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Home Indicator */}
            <div className="flex justify-center pb-2">
              <div className="w-32 h-1 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        {!callActive && (
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>Speak naturally to place your order</p>
            <p className="mt-1">The AI will guide you through the menu</p>
          </div>
        )}
      </div>
      
      {/* Receipt modal */}
      {showReceipt && completedOrder && (
        <Receipt 
          order={completedOrder} 
          showCallAgain={true}
          onClose={() => {
            setShowReceipt(false);
            setCompletedOrder(null);
          }} 
        />
      )}
    </div>
  );
};

export default CallPage;
