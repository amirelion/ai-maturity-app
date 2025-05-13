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
  
  // Set up audio recording
  useEffect(() => {
    if (!isListening) {
      // Clean up and stop recording if we were previously listening
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
          
          // Stop all tracks on the stream
          if (mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
        } catch (err) {
          console.error('Error stopping media recorder:', err);
        }
      }
      return;
    }

    // Start recording if isListening is true
    const startRecording = async () => {
      audioChunksRef.current = []; // Clear previous chunks
      
      try {
        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Your browser does not support audio recording');
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorderRef.current.onstop = async () => {
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
        
        mediaRecorderRef.current.onerror = (event) => {
          console.error('Media recorder error:', event);
          setError('Audio recording error');
          if (onError) onError('Audio recording error');
        };
        
        mediaRecorderRef.current.start();
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
    };
    
    startRecording();
    
    // Cleanup function
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
          
          // Stop all tracks on the stream
          if (mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
        } catch (err) {
          console.error('Error in cleanup:', err);
        }
      }
    };
  }, [isListening, onResult, onError]);
  
  const startListening = useCallback(() => {
    setError(null);
    setIsListening(true);
    setTranscript('');
  }, []);
  
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
    audioBlob,
    startListening,
    stopListening,
    toggleListening
  };
}