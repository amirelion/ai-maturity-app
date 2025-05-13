'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { maturityFramework } from '@/config/ai-config'

export default function ResultsPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [assessment, setAssessment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Load assessment data from localStorage
  useEffect(() => {
    const storedAssessment = localStorage.getItem('assessment')
    if (storedAssessment) {
      setAssessment(JSON.parse(storedAssessment))
    } else {
      // If no assessment data found, generate some for demo purposes
      const demoAssessment = {
        userInfo: {
          name: "Demo User",
          role: "VP of Engineering",
          industry: "Manufacturing",
          orgSize: "Mid-sized"
        },
        productivity: {
          score: 2.1,
          level: 2,
          strengths: [
            'Some teams experimenting with AI tools',
            'Leadership interest in AI adoption',
            'Initial success with productivity pilots'
          ],
          opportunities: [
            'Formalize AI governance structure',
            'Develop comprehensive AI training program',
            'Establish metrics to track AI impact'
          ]
        },
        valueCreation: {
          score: 1.5,
          level: 1,
          strengths: [
            'Early exploration of AI in products',
            'Understanding of customer needs',
            'Some prototypes in development'
          ],
          opportunities: [
            'Develop an AI product roadmap',
            'Focus on data quality and infrastructure',
            'Create cross-functional AI innovation teams'
          ]
        },
        businessModel: {
          score: 1.8,
          level: 2,
          strengths: [
            'Leadership awareness of AI disruption potential',
            'Initial exploration of AI-enabled services',
            'Willingness to experiment with new approaches'
          ],
          opportunities: [
            'Conduct AI disruption risk assessment',
            'Explore data monetization opportunities',
            'Pilot AI-native business models'
          ]
        },
        overall: {
          score: 1.8,
          level: 2
        }
      }
      setAssessment(demoAssessment)
    }
    setIsLoading(false)
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Call the API to send the email with assessment results
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          assessment
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to send email')
      }
      
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send the report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Helper function to render maturity level bars
  const renderMaturityBar = (score: number) => {
    const levels = [
      { 
        max: maturityFramework.levels.exploring.range.max, 
        label: maturityFramework.levels.exploring.name, 
        color: 'bg-yellow-500' 
      },
      { 
        max: maturityFramework.levels.experimenting.range.max, 
        label: maturityFramework.levels.experimenting.name, 
        color: 'bg-blue-500' 
      },
      { 
        max: maturityFramework.levels.implementing.range.max, 
        label: maturityFramework.levels.implementing.name, 
        color: 'bg-green-500' 
      },
      { 
        max: 4, 
        label: maturityFramework.levels.transforming.name, 
        color: 'bg-purple-500' 
      }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing your assessment results...</p>
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
            Overall Maturity Score: {assessment?.overall.score.toFixed(1)}/4.0
          </h2>
          
          <div className="mb-8">
            {renderMaturityBar(assessment?.overall.score)}
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Productivity Enhancement</h3>
              {renderMaturityBar(assessment?.productivity.score)}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Value Creation</h3>
              {renderMaturityBar(assessment?.valueCreation.score)}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Business Model Innovation</h3>
              {renderMaturityBar(assessment?.businessModel.score)}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Key Strengths
              </h3>
              <ul className="space-y-2">
                {assessment?.productivity.strengths.slice(0, 2).map((strength: string, index: number) => (
                  <li key={`prod-${index}`} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                  </li>
                ))}
                {assessment?.valueCreation.strengths.slice(0, 1).map((strength: string, index: number) => (
                  <li key={`val-${index}`} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                  </li>
                ))}
                {assessment?.businessModel.strengths.slice(0, 1).map((strength: string, index: number) => (
                  <li key={`biz-${index}`} className="flex items-start">
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
                {assessment?.productivity.opportunities.slice(0, 1).map((opportunity: string, index: number) => (
                  <li key={`prod-opp-${index}`} className="flex items-start">
                    <span className="text-primary-500 mr-2">→</span>
                    <span className="text-gray-700 dark:text-gray-300">{opportunity}</span>
                  </li>
                ))}
                {assessment?.valueCreation.opportunities.slice(0, 2).map((opportunity: string, index: number) => (
                  <li key={`val-opp-${index}`} className="flex items-start">
                    <span className="text-primary-500 mr-2">→</span>
                    <span className="text-gray-700 dark:text-gray-300">{opportunity}</span>
                  </li>
                ))}
                {assessment?.businessModel.opportunities.slice(0, 1).map((opportunity: string, index: number) => (
                  <li key={`biz-opp-${index}`} className="flex items-start">
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