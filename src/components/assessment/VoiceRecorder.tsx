'use client'

import { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

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
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const recordingAttemptedRef = useRef(false);
  
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [showSendButton, setShowSendButton] = useState(false);
  
  const { 
    transcript, 
    error: recognitionError, 
    startListening: startSpeechRecognition,
    stopListening: stopSpeechRecognition,
    isListening: isSpeechRecognitionListening
  } = useSpeechRecognition({
    onResult: (text) => {
      if (text && text.trim()) {
        // Just store the transcript, don't send it yet
        setTranscribedText(text);
        setShowSendButton(true);
      } else {
        setError("We couldn't hear anything. Please try speaking again.");
      }
      setIsProcessing(false);
    },
    onError: (err) => {
      setError(err);
      setIsProcessing(false);
    },
    autoStart: false
  });
  
  // Handle sending transcribed text
  const handleSendTranscription = () => {
    setIsProcessing(true);
    try {
      // Only now do we send the transcription to the parent
      onTranscriptionComplete(transcribedText);
      // Reset states
      setShowSendButton(false);
      setTranscribedText('');
      setIsProcessing(false);
      // Reset the recording attempted flag
      recordingAttemptedRef.current = false;
    } catch (err) {
      console.error("Error processing transcription:", err);
      setError("Failed to process your response. Please try again.");
      setIsProcessing(false);
    }
  };

  // Handle button click to toggle recording
  const handleToggleListening = () => {
    // If audio is playing, don't do anything
    if (isAudioPlaying) return;
    
    // Clear any previous errors
    setError(null);
    
    // Hide send button when starting a new recording
    if (!isListening) {
      setShowSendButton(false);
      setTranscribedText('');
    }
    
    // Only toggle if not currently processing
    if (!isProcessing) {
      if (isListening) {
        setIsProcessing(true); // Set processing to true while transcribing
        stopSpeechRecognition();
        setIsListening(false);
      } else {
        // Set a flag to indicate we've attempted to start recording
        recordingAttemptedRef.current = true;
        startSpeechRecognition();
        setIsListening(true);
      }
    }
  };
  
  // Sync listening state to the speech recognition state
  // but only after user has clicked the button, indicated by recordingAttemptedRef
  useEffect(() => {
    // Only sync states if we've attempted recording at least once
    if (recordingAttemptedRef.current) {
      if (isListening !== isSpeechRecognitionListening) {
        if (isListening) {
          try {
            startSpeechRecognition();
          } catch (err) {
            console.error("Error starting speech recognition:", err);
            setError("Failed to access microphone. Please check your permissions.");
            setIsListening(false);
          }
        } else {
          stopSpeechRecognition();
        }
      }
    }
  }, [isListening, isSpeechRecognitionListening, startSpeechRecognition, stopSpeechRecognition, setIsListening]);
  
  // Propagate errors from speech recognition
  useEffect(() => {
    if (recognitionError) {
      setError(recognitionError);
    }
  }, [recognitionError]);

  // Track audio playback to prevent button actions during playback
  useEffect(() => {
    const handleAudioStart = () => {
      setIsAudioPlaying(true);
    };
    
    const handleAudioEnd = () => {
      setIsAudioPlaying(false);
    };
    
    window.addEventListener('audio-playback-start', handleAudioStart);
    window.addEventListener('audio-playback-end', handleAudioEnd);
    
    return () => {
      window.removeEventListener('audio-playback-start', handleAudioStart);
      window.removeEventListener('audio-playback-end', handleAudioEnd);
    };
  }, []);

  return (
    <div className="w-full">
      <button
        onClick={handleToggleListening}
        disabled={isProcessing || isAudioPlaying || showSendButton}
        className={`w-full p-4 rounded-lg border ${
          isAudioPlaying
            ? 'border-blue-500 bg-blue-50 text-blue-500 dark:bg-blue-900/20 cursor-not-allowed'
            : isProcessing 
              ? 'border-yellow-500 bg-yellow-50 text-yellow-500 dark:bg-yellow-900/20 cursor-wait' 
              : isListening 
                ? 'border-red-500 bg-red-50 text-red-500 dark:bg-red-900/20' 
                : showSendButton
                  ? 'border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 opacity-50'
                  : 'border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
        } transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500`}
      >
        <div className="flex items-center justify-center">
          {isAudioPlaying ? (
            <>
              <span className="relative flex h-3 w-3 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span>Audio playing... Please wait</span>
            </>
          ) : isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing your response...</span>
            </>
          ) : isListening ? (
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
      
      {transcribedText && showSendButton && (
        <div className="mt-4">
          <div className="mb-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
            {transcribedText}
          </div>
          <button
            onClick={handleSendTranscription}
            disabled={isProcessing}
            className="w-full p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <svg className="animate-spin mx-auto h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span>Send Message</span>
            )}
          </button>
          <button
            onClick={() => {
              setShowSendButton(false);
              setTranscribedText('');
            }}
            disabled={isProcessing}
            className="w-full mt-2 p-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
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