'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAssessment } from '@/hooks/useAssessment'
import VoiceRecorder from '@/components/assessment/VoiceRecorder'

// Wrap the component that uses useSearchParams in a Suspense boundary
function ConversationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('id')
  
  const [input, setInput] = useState('')
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const playedLastMessageRef = useRef(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use our assessment hook for real functionality
  const { 
    currentQuestion,
    conversation, 
    addResponse, 
    progress, 
    isLoading,
    isAssessmentComplete,
    assessment,
    error,
    canForceComplete,
    forceCompleteAssessment,
    playAssistantResponse,
    isAudioPlaying
  } = useAssessment()

  // Check if voice mode was selected
  useEffect(() => {
    const savedVoicePreference = localStorage.getItem('useVoice')
    if (savedVoicePreference === 'true') {
      setIsVoiceMode(true)
    }
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  // Redirect to results when assessment is complete
  useEffect(() => {
    if (isAssessmentComplete && assessment) {
      if (assessmentId) {
        router.push(`/assessment/results?id=${assessmentId}`)
      } else {
        router.push('/assessment/results')
      }
    }
  }, [isAssessmentComplete, assessment, router, assessmentId])

  // Play the last assistant message if in voice mode - with improved handling
  useEffect(() => {
    // If conversation changes, check if we need to play the last message
    if (conversation.length > 0) {
      const lastMessage = conversation[conversation.length - 1];
      
      // Only play the message if:
      // 1. We're in voice mode
      // 2. The last message is from the assistant
      // 3. We haven't already played this message
      // 4. Audio is not currently playing
      if (
        isVoiceMode && 
        lastMessage.role === 'assistant' && 
        !playedLastMessageRef.current && 
        !isAudioPlaying
      ) {
        console.log("Playing assistant message:", lastMessage.content.substring(0, 30) + "...");
        // Set the flag to prevent repeated playback
        playedLastMessageRef.current = true;
        
        // Play the message
        playAssistantResponse(lastMessage.content);
      }
    }
  }, [conversation, isVoiceMode, playAssistantResponse, isAudioPlaying]);

  // Reset the played flag when audio playback ends
  useEffect(() => {
    const handleAudioEnd = () => {
      // After audio playback completes, we can set the flag to false so the next message can play
      console.log("Audio playback ended, resetting flag");
      playedLastMessageRef.current = false;
    };
    
    // This will trigger when audio playback ends
    window.addEventListener('audio-playback-end', handleAudioEnd);
    
    return () => {
      window.removeEventListener('audio-playback-end', handleAudioEnd);
    };
  }, []);

  const handleSendMessage = () => {
    if (input.trim() === '' || isLoading) return
    
    addResponse(input)
    setInput('')
  }

  const handleVoiceInput = (transcript: string) => {
    if (transcript && !isLoading) {
      addResponse(transcript)
    }
  }

  const toggleVoiceMode = () => {
    setIsVoiceMode(prev => {
      const newValue = !prev;
      // Save preference to localStorage
      localStorage.setItem('useVoice', newValue.toString());
      return newValue;
    });
  }

  const handleCompleteAssessment = async () => {
    await forceCompleteAssessment()
    if (assessmentId) {
      router.push(`/assessment/results?id=${assessmentId}`)
    } else {
      router.push('/assessment/results')
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center">
            <Link 
              href={assessmentId ? "/dashboard" : "/"}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Maturity Assessment</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{progress}% Complete</span>
          </div>
        </div>
      </header>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {conversation.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary-100 dark:bg-primary-900 text-gray-800 dark:text-gray-100' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center space-x-2">
                <div className="animate-pulse flex space-x-1">
                  <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">Thinking...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                {error}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center">
            <button
              onClick={toggleVoiceMode}
              className="p-2 rounded-full text-gray-500 hover:text-primary-500 focus:outline-none mr-2"
              aria-label={isVoiceMode ? "Switch to keyboard input" : "Switch to voice input"}
            >
              {isVoiceMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>

            {isVoiceMode ? (
              <VoiceRecorder
                onTranscriptionComplete={handleVoiceInput}
                isListening={isListening}
                setIsListening={setIsListening}
              />
            ) : (
              <div className="flex-1 flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your response..."
                  disabled={isLoading}
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-75"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={input.trim() === '' || isLoading}
                  className="ml-2 p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span>Send</span>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {/* Complete Assessment Button */}
          <div className="mt-6 text-center">
            {canForceComplete ? (
              <button
                onClick={handleCompleteAssessment}
                disabled={isLoading}
                className="py-3 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base"
              >
                {isLoading ? 'Analyzing...' : 'Complete Assessment & View Results'}
              </button>
            ) : (
              <button
                onClick={handleCompleteAssessment}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 underline"
                disabled={isLoading}
              >
                Skip to results (answer more questions to complete)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback for the Suspense boundary
const LoadingFallback = () => (
  <div className="flex flex-col h-screen max-h-screen bg-gray-50 dark:bg-gray-900 pt-16 items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading conversation...</p>
  </div>
);

// Create the main component with Suspense
export default function ConversationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConversationContent />
    </Suspense>
  )
}