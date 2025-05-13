'use client'

import { useState, useEffect, useCallback, useRef } from 'react';

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
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Clean up function to stop recording and release resources
  const cleanupRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping media recorder:', err);
      }
    }
    
    // Stop all tracks on the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    mediaRecorderRef.current = null;
  }, []);
  
  // Start recording audio
  const startListening = useCallback(async () => {
    setError(null);
    setIsListening(true);
    setTranscript('');
    audioChunksRef.current = []; // Clear previous chunks
    
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording');
      }
      
      // First, stop any existing recording
      cleanupRecording();
      
      // Then start a new recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          setError('No audio recorded');
          if (onError) onError('No audio recorded');
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Send to OpenAI for transcription
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob);
          
          const response = await fetch('/api/openai/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`Transcription failed: ${response.statusText}`);
          }
          
          const data = await response.json();
          const transcriptText = data.text?.trim();
          
          if (!transcriptText) {
            setError('No speech detected. Please try again and speak clearly.');
            if (onError) onError('No speech detected');
            return;
          }
          
          setTranscript(transcriptText);
          
          if (onResult) {
            onResult(transcriptText);
          }
        } catch (err) {
          console.error('Transcription error:', err);
          const errorMessage = err instanceof Error ? err.message : 'Transcription failed';
          setError(errorMessage);
          
          if (onError) {
            onError(errorMessage);
          }
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('Media recorder error:', event);
        setError('Audio recording error');
        if (onError) onError('Audio recording error');
      };
      
      mediaRecorder.start();
      console.log('Recording started...');
    } catch (err) {
      console.error('Media recorder setup error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not access microphone';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      setIsListening(false);
    }
  }, [cleanupRecording, onError, onResult]);
  
  // Stop recording
  const stopListening = useCallback(() => {
    setIsListening(false);
    cleanupRecording();
  }, [cleanupRecording]);
  
  // Handle changes in isListening state
  useEffect(() => {
    if (!isListening) {
      cleanupRecording();
    }
    
    // Cleanup on component unmount
    return () => {
      cleanupRecording();
    };
  }, [isListening, cleanupRecording]);
  
  // Auto-start if requested
  useEffect(() => {
    if (autoStart) {
      startListening();
    }
    
    // Cleanup on component unmount
    return () => {
      cleanupRecording();
    };
  }, [autoStart, startListening, cleanupRecording]);
  
  return {
    isListening,
    transcript,
    error,
    audioBlob,
    startListening,
    stopListening,
    toggleListening: isListening ? stopListening : startListening
  };
}