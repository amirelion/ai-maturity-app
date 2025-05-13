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
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // Set up audio recording
  useEffect(() => {
    let mediaRecorder: MediaRecorder | null = null;
    const audioChunks: Blob[] = [];
    
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
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
            setTranscript(data.text);
            
            if (onResult) {
              onResult(data.text);
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
        
        mediaRecorder.start();
        console.log('Recording started...');
      } catch (err) {
        console.error('Media recorder error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Could not access microphone';
        setError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
        
        setIsListening(false);
      }
    };
    
    const stopRecording = () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        console.log('Recording stopped...');
        
        // Stop all tracks on the stream
        if (mediaRecorder.stream) {
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
      }
    };
    
    if (isListening) {
      audioChunks.length = 0; // Clear previous chunks
      startRecording();
    } else if (mediaRecorder) {
      stopRecording();
    }
    
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        stopRecording();
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