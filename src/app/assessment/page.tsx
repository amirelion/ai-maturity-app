'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AssessmentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [useVoice, setUseVoice] = useState(false)
  
  const startAssessment = (withVoice: boolean) => {
    setIsLoading(true)
    setUseVoice(withVoice)
    
    // In a real implementation, we would initialize the conversation here
    // For now, we'll just simulate a delay and then continue
    setTimeout(() => {
      // We'll store the voice preference in localStorage for now
      localStorage.setItem('useVoice', withVoice.toString())
      router.push('/assessment/conversation')
    }, 1500)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-12">
      <div className="w-full max-w-4xl px-6 py-10 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Choose Your Assessment Method
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div 
            className="p-6 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md cursor-pointer transition-all"
            onClick={() => startAssessment(false)}
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Text Chat</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Answer questions by typing your responses. Best for quiet environments or if you prefer writing your thoughts.
            </p>
            <div className="flex justify-center">
              <button 
                className="px-6 py-2 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Start Text Assessment'}
              </button>
            </div>
          </div>
          
          <div 
            className="p-6 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md cursor-pointer transition-all"
            onClick={() => startAssessment(true)}
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Voice Chat</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Have a conversation with our AI assistant using voice. More natural and faster for most people.
            </p>
            <div className="flex justify-center">
              <button 
                className="px-6 py-2 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Start Voice Assessment'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>Both methods take approximately 10 minutes to complete.</p>
          <p className="mt-2">You can switch between voice and text anytime during the assessment.</p>
        </div>
      </div>
    </div>
  )
}