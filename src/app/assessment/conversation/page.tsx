'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// This is a placeholder for the actual conversation component
// We'll implement this more fully once we set up the OpenAI integration

export default function ConversationPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hi there! I\'m excited to help you understand your AI readiness. First, could you tell me your name and role in your organization?' }
  ])
  const [input, setInput] = useState('')
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
  }, [messages])

  const handleSendMessage = () => {
    if (input.trim() === '') return
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }])
    setInput('')
    
    // Simulate assistant response (in a real app, this would call the OpenAI API)
    setTimeout(() => {
      // This is just a placeholder response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Thanks for sharing that! What industry does your organization operate in?' 
      }])
      
      // Update progress (just for demo purposes)
      setProgress(prev => Math.min(prev + 10, 100))
    }, 1000)
  }

  const toggleVoiceMode = () => {
    setIsVoiceMode(prev => !prev)
  }

  const handleVoiceCapture = () => {
    setIsListening(prev => !prev)
    // In a real implementation, this would start/stop the microphone
  }

  const completeAssessment = () => {
    router.push('/assessment/results')
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Maturity Assessment</h1>
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
          {messages.map((message, index) => (
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
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto flex items-center">
          <button
            onClick={toggleVoiceMode}
            className="p-2 rounded-full text-gray-500 hover:text-primary-500 focus:outline-none mr-2"
          >
            {isVoiceMode ? (
              <span className="material-icons">keyboard</span>
            ) : (
              <span className="material-icons">mic</span>
            )}
          </button>

          {isVoiceMode ? (
            <button
              onClick={handleVoiceCapture}
              className={`flex-1 p-4 rounded-lg border ${
                isListening 
                  ? 'border-red-500 bg-red-50 text-red-500 dark:bg-red-900/20' 
                  : 'border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {isListening ? 'Listening... Tap to stop' : 'Tap to speak'}
            </button>
          ) : (
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your response..."
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          )}

          {!isVoiceMode && (
            <button
              onClick={handleSendMessage}
              disabled={input.trim() === ''}
              className="ml-2 p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          )}
        </div>

        {/* Demo shortcut for presentation purposes */}
        <div className="mt-4 max-w-3xl mx-auto text-center">
          <button
            onClick={completeAssessment}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 underline"
          >
            Skip to results (demo only)
          </button>
        </div>
      </div>
    </div>
  )
}