'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioManager, SessionState, detectWakeWord, detectExitTrigger } from '@/lib/audio';
import { GeminiRealtimeClient, generateRealtimeToken } from '@/lib/gemini-realtime';

const SYSTEM_PROMPT = `You are Fahad AI — the realtime digital version of Muhammad Fahad Imdad. 

Key instructions:
- Speak in first person (I, me, my) as Muhammad Fahad Imdad
- Never call yourself an assistant or AI
- Only answer with knowledge grounded in fahadimdad.com via the tools provided
- If something is unknown, respond naturally like a human: "I don't have the details on that right now"
- Keep spoken answers short, conversational, and natural
- Use the web_search_site tool to search fahadimdad.com for current information
- Use the open_link_preview tool to get detailed content from specific pages

You have access to these tools:
1. web_search_site(q: string, max?: number) - Search fahadimdad.com in real-time
2. open_link_preview(url: string) - Fetch and clean a single page from fahadimdad.com`;

export default function Home() {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  
  const audioManagerRef = useRef<AudioManager | null>(null);
  const geminiClientRef = useRef<GeminiRealtimeClient | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const endSession = useCallback(() => {
    setSessionState('ended');
    
    if (audioManagerRef.current) {
      audioManagerRef.current.cleanup();
      audioManagerRef.current = null;
    }
    
    if (geminiClientRef.current) {
      geminiClientRef.current.disconnect();
      geminiClientRef.current = null;
    }
    
    setIsConnected(false);
    setAudioLevel(0);
    
    // Return to idle state after 3 seconds
    setTimeout(() => {
      setSessionState('idle');
      setLastMessage('');
    }, 3000);
  }, []);

  const startSession = useCallback(async () => {
    try {
      setSessionState('listening');
      
      // Initialize audio manager
      audioManagerRef.current = new AudioManager(
        () => endSession(), // On silence detected
        (level) => setAudioLevel(level) // On audio level change
      );
      
      const micInitialized = await audioManagerRef.current.initializeMicrophone();
      if (!micInitialized) {
        console.error('Failed to initialize microphone');
        endSession();
        return;
      }
      
      // Get Gemini Realtime token
      const token = await generateRealtimeToken();
      if (!token) {
        console.error('Failed to get Gemini token');
        endSession();
        return;
      }
      
      // Initialize Gemini Realtime client
      geminiClientRef.current = new GeminiRealtimeClient(
        {
          token,
          model: 'gemini-1.5-pro-realtime',
          voice: 'male',
          systemPrompt: SYSTEM_PROMPT
        },
        (message) => {
          setLastMessage(message);
          setSessionState('speaking');
        },
        async (audioData) => {
          if (audioManagerRef.current) {
            await audioManagerRef.current.playAudioFromBase64(audioData);
            setSessionState('listening');
          }
        },
        (state) => {
          setIsConnected(state === 'connected');
        }
      );
      
      const connected = await geminiClientRef.current.connect();
      if (!connected) {
        console.error('Failed to connect to Gemini Realtime');
        endSession();
        return;
      }
      
      audioManagerRef.current.startListening();
    } catch (error) {
      console.error('Failed to start session:', error);
      endSession();
    }
  }, [endSession]);

  // Initialize speech recognition for wake word detection
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        if (sessionState === 'idle' && detectWakeWord(transcript)) {
          startSession();
        } else if (sessionState === 'listening' && detectExitTrigger(transcript)) {
          endSession();
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [sessionState, startSession, endSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioManagerRef.current) {
        audioManagerRef.current.cleanup();
      }
      if (geminiClientRef.current) {
        geminiClientRef.current.disconnect();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const renderStateContent = () => {
    switch (sessionState) {
      case 'idle':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.h1
              className="text-4xl md:text-6xl font-light mb-4 animate-pulse-slow"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Say Hi Fahad to begin
            </motion.h1>
            <p className="text-lg text-white/70">
              Voice-first AI assistant powered by real-time knowledge
            </p>
          </motion.div>
        );

      case 'listening':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              className="w-32 h-32 rounded-full border-2 border-white/30 mb-8 mx-auto flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
                borderColor: [`rgba(255,255,255,${0.3 + audioLevel * 0.7})`, `rgba(255,255,255,${0.3 + audioLevel * 0.7})`]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-white"
                animate={{ 
                  scale: [1, 1 + audioLevel * 0.5, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            <h2 className="text-2xl font-light">Listening...</h2>
            <p className="text-white/70 mt-2">Speak naturally, I&apos;m here to help</p>
          </motion.div>
        );

      case 'speaking':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="flex justify-center items-end space-x-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 bg-white equalizer-bar"
                  style={{ height: '20px' }}
                  animate={{
                    height: ['20px', '60px', '20px'],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
            <motion.h2
              className="text-2xl font-light animate-glow"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              Speaking...
            </motion.h2>
            {lastMessage && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white/70 mt-4 max-w-2xl mx-auto"
              >
                {lastMessage}
              </motion.p>
            )}
          </motion.div>
        );

      case 'ended':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h2 className="text-3xl font-light mb-4">Session ended</h2>
            <p className="text-white/70">Say Hi Fahad again to start a new conversation</p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div 
        className="w-full max-w-4xl mx-auto"
        style={{ cursor: sessionState !== 'idle' ? 'none' : 'default' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={sessionState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {renderStateContent()}
          </motion.div>
        </AnimatePresence>
        
        {/* Connection status indicator */}
        {sessionState !== 'idle' && sessionState !== 'ended' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-8 right-8"
          >
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          </motion.div>
        )}
      </div>
    </div>
  );
}