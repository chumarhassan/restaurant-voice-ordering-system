import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for voice input/output
 * Uses ElevenLabs for natural text-to-speech
 * Uses Web Speech API for speech recognition
 */

// ElevenLabs configuration. Keep secrets in frontend/.env.local.
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
// Using "Bella" voice - more expressive and natural conversational tone
const ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Bella - natural, warm, conversational
const ELEVENLABS_MODEL = 'eleven_turbo_v2_5'; // Faster, high quality model

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const interruptSpeechRef = useRef(null);
  
  // Interrupt/stop any playing audio (define early for use in useEffect)
  const interruptSpeech = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (window.currentAudio) {
      window.currentAudio.pause();
      window.currentAudio.currentTime = 0;
      window.currentAudio = null;
    }
    setIsSpeaking(false);
    setIsLoadingAudio(false);
  }, []);
  
  // Store ref for use in recognition callback
  useEffect(() => {
    interruptSpeechRef.current = interruptSpeech;
  }, [interruptSpeech]);
  
  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += text;
          } else {
            interimTranscript += text;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        // Stop speaking when user starts talking (interrupt)
        if (finalTranscript || interimTranscript) {
          if (interruptSpeechRef.current) {
            interruptSpeechRef.current();
          }
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setIsListening(false);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      setSpeechSupported(true);
    } else {
      console.warn('Speech recognition not supported');
      setSpeechSupported(false);
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (interruptSpeechRef.current) {
        interruptSpeechRef.current();
      }
    };
  }, []);
  
  // Start listening - also interrupts any ongoing speech
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    
    // Stop any playing audio first
    interruptSpeech();
    
    setTranscript('');
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
    }
  }, [isListening, interruptSpeech]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Failed to stop recognition:', error);
    }
    setIsListening(false);
  }, []);
  
  // Clean text for speech (remove emojis, formatting)
  const cleanTextForSpeech = (text) => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]/gu;
    
    return text
      .replace(emojiRegex, '')
      .replace(/[*_~`#]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .replace(/\.+/g, '.')
      .trim();
  };

  // Speak text using ElevenLabs
  const speak = useCallback(async (text) => {
    if (!speakEnabled || !text) return;
    
    // Stop any currently playing audio
    interruptSpeech();
    
    // Clean the text
    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;
    
    setIsLoadingAudio(true);
    
    try {
      if (!ELEVENLABS_API_KEY) {
        throw new Error('Missing VITE_ELEVENLABS_API_KEY');
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: ELEVENLABS_MODEL,
            voice_settings: {
              stability: 0.35,           // Lower = more expressive
              similarity_boost: 0.85,    // Higher = more consistent
              style: 0.3,               // Add conversational style
              use_speaker_boost: true
            }
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      window.currentAudio = audio; // Global reference for interrupt
      
      audio.onplay = () => {
        setIsSpeaking(true);
        setIsLoadingAudio(false);
      };
      
      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
        window.currentAudio = null;
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsSpeaking(false);
        setIsLoadingAudio(false);
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setIsLoadingAudio(false);
      setIsSpeaking(false);
      
      // Fallback to browser speech synthesis
      fallbackSpeak(cleanText);
    }
  }, [speakEnabled, interruptSpeech]);
  
  // Fallback to browser speech synthesis if ElevenLabs fails
  const fallbackSpeak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => 
      v.name.includes('Zira') || 
      v.name.includes('Samantha') || 
      v.name.includes('Google UK English Female') ||
      (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
    );
    if (femaleVoice) utterance.voice = femaleVoice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, []);
  
  // Cancel speech
  const cancelSpeech = useCallback(() => {
    interruptSpeech();
    // Also cancel browser speech synthesis if used as fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [interruptSpeech]);
  
  // Toggle speak enabled
  const toggleSpeak = useCallback(() => {
    setSpeakEnabled(prev => {
      if (prev) {
        // Turning off - stop any current speech
        interruptSpeech();
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      }
      return !prev;
    });
  }, [interruptSpeech]);
  
  return {
    isListening,
    transcript,
    isSpeaking,
    speechSupported,
    speakEnabled,
    isLoadingAudio,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    toggleSpeak,
    interruptSpeech
  };
};

export default useVoice;
