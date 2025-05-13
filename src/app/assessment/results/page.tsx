'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ResultsPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  // Mock assessment results - in a real app these would come from the assessment process
  const results = {
    productivity: 2.5, // On a scale of 1-4
    valueCreation: 1.8,
    businessModel: 3.2,
    overall: 2.5,
    strengths: [
      'Strong executive awareness of AI potential',
      'Several successful productivity tool pilots',
      'Clear vision for AI-driven business model'
    ],
    opportunities: [
      'Formalize AI governance structure',
      'Expand AI integration in customer-facing products',
      'Develop comprehensive AI training program'
    ]
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call to send email
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }
  
  // Helper function to render maturity level bars
  const renderMaturityBar = (score: number) => {
    const levels = [
      { max: 1.5, label: 'Exploring', color: 'bg-yellow-500' },
      { max: 2.5, label: 'Experimenting', color: 'bg-blue-500' },
      { max: 3.5, label: 'Implementing', color: 'bg-green-500' },
      { max: 4, label: 'Transforming', color: 'bg-purple-500' }
    ]
    
    const currentLevel = levels.find(level => score <= level.max)
    const percentage = Math.min((score / 4) * 100, 100)
    
    return (
      <div className="w-full">
        <div className="flex justify-between mb-1 text-sm">
          <span>{currentLevel?.label}</span>
          <span>{score.toFixed(1)}/4.0</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className={`${currentLevel?.color} h-2.5 rounded-full`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your AI Maturity Assessment Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Based on your responses, here's where your organization stands
          </p>
        </div>
        
        {/* Results Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Overall Maturity Score: {results.overall.toFixed(1)}/4.0
          </h2>
          
          <div className="mb-8">
            {renderMaturityBar(results.overall)}
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Productivity Enhancement</h3>
              {renderMaturityBar(results.productivity)}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Value Creation</h3>
              {renderMaturityBar(results.valueCreation)}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Business Model Innovation</h3>
              {renderMaturityBar(results.businessModel)}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Key Strengths
              </h3>
              <ul className="space-y-2">
                {results.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Growth Opportunities
              </h3>
              <ul className="space-y-2">
                {results.opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary-500 mr-2">→</span>
                    <span className="text-gray-700 dark:text-gray-300">{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Email Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {!isSubmitted ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Get Your Detailed Report
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter your email to receive a comprehensive analysis with personalized recommendations.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send My Report'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Report Sent Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We've sent your detailed AI maturity report to {email}. Check your inbox shortly.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <span>Return to Home</span>
                <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}