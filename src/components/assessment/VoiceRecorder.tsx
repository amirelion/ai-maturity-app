'use client'

import { useState, useEffect } from 'react';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

export default function VoiceRecorder({
  onTranscriptionComplete,
  isListening,
  setIsListening
}: VoiceRecorderProps) {
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // In a real implementation, we would use the Web Speech API or a similar library
  // For this demo, we'll simulate recording and transcription
  
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    
    if (isListening) {
      // Simulate recording with progress updates
      setTranscript('Listening...');
      
      // Simulate a transcript being generated after a delay
      timerId = setTimeout(() => {
        // Generate a mock response based on where we are in the conversation
        // In a real app, this would come from the actual transcription
        setTranscript('This is a simulated voice transcription for demo purposes');
        setIsListening(false);
        
        // Pass transcription to parent component
        onTranscriptionComplete('This is a simulated voice transcription for demo purposes');
      }, 3000);
    } else {
      setTranscript('');
    }
    
    return () => {
      clearTimeout(timerId);
    };
  }, [isListening, onTranscriptionComplete, setIsListening]);
  
  const toggleListening = () => {
    // In a real app, we would request microphone permission here
    // and handle any errors
    try {
      setError(null);
      setIsListening(!isListening);
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
      console.error('Microphone error:', err);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={toggleListening}
        className={`w-full p-4 rounded-lg border ${
          isListening 
            ? 'border-red-500 bg-red-50 text-red-500 dark:bg-red-900/20' 
            : 'border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
        } transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500`}
      >
        <div className="flex items-center justify-center">
          {isListening ? (
            <>
              <span className="relative flex h-3 w-3 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span>Listening... Tap to stop</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"></path>
              </svg>
              <span>Tap to speak</span>
            </>
          )}
        </div>
      </button>
      
      {transcript && !isListening && (
        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
          {transcript}
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}