'use client'

import { useState, useEffect, useCallback } from 'react';

type SpeechRecognitionProps = {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
};

export function useSpeechRecognition({
  onResult,
  onError,
  autoStart = false
}: SpeechRecognitionProps = {}) {
  const [isListening, setIsListening] = useState(autoStart);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // This is just a mock implementation for the demo
  // In a real application, you would use the Web Speech API or OpenAI's API
  
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    
    if (isListening) {
      // Simulate recording
      console.log('Started listening...');
      setTranscript('Listening...');
      
      // Simulate a result after a delay
      timerId = setTimeout(() => {
        const mockTranscript = "This is a simulated voice recording for demonstration purposes.";
        setTranscript(mockTranscript);
        setIsListening(false);
        
        if (onResult) {
          onResult(mockTranscript);
        }
      }, 3000);
    }
    
    return () => {
      clearTimeout(timerId);
    };
  }, [isListening, onResult]);
  
  const startListening = useCallback(() => {
    try {
      setError(null);
      setIsListening(true);
    } catch (err) {
      const errorMessage = 'Could not access microphone. Please check permissions.';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      console.error('Speech recognition error:', err);
    }
  }, [onError]);
  
  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);
  
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);
  
  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening
  };
}