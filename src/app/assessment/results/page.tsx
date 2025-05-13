'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { maturityFramework } from '@/config/ai-config'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

// Default strengths and opportunities if none are extracted from the analysis
const defaultStrengths = {
  productivity: [
    'Initial adoption of AI productivity tools',
    'Interest in enhancing efficiency through AI',
    'Recognition of AI potential for team productivity'
  ],
  valueCreation: [
    'Understanding of customer needs that AI could address',
    'Awareness of AI potential to enhance products and services',
    'Early consideration of competitive positioning with AI'
  ],
  businessModel: [
    'Leadership interest in AI strategic potential',
    'Openness to innovation and new approaches',
    'Recognition of changing industry landscape'
  ]
};

const defaultOpportunities = {
  productivity: [
    'Establish structured approach to AI tool adoption',
    'Develop AI skills and literacy across teams',
    'Create metrics to measure AI productivity impact'
  ],
  valueCreation: [
    'Develop AI feature roadmap for products/services',
    'Improve data infrastructure to support AI capabilities',
    'Prototype AI enhancements with customer feedback'
  ],
  businessModel: [
    'Conduct AI disruption assessment for your industry',
    'Explore potential new revenue streams enabled by AI',
    'Align leadership vision on AI strategic priorities'
  ]
};

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('id')
  const { currentUser } = useAuth()
  
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [assessment, setAssessment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Load assessment data
  useEffect(() => {
    const loadAssessment = async () => {
      setIsLoading(true)
      setError(null)
      
      // If we have an assessmentId and user is authenticated, try to load from Firestore
      if (assessmentId && currentUser) {
        try {
          const assessmentRef = doc(db, 'assessments', assessmentId)
          const assessmentSnap = await getDoc(assessmentRef)
          
          if (assessmentSnap.exists()) {
            const assessmentData = assessmentSnap.data()
            
            // Verify this assessment belongs to the current user
            if (assessmentData.userId === currentUser.uid) {
              setAssessment(assessmentData.results)
              
              // Pre-fill email if available
              if (assessmentData.userInfo?.email) {
                setEmail(assessmentData.userInfo.email)
              } else if (currentUser.email) {
                setEmail(currentUser.email)
              }
            } else {
              setError('You do not have permission to view this assessment.')
              router.push('/dashboard')
            }
          } else {
            setError('Assessment not found.')
          }
        } catch (err) {
          console.error('Error loading assessment from Firestore:', err)
          setError('Failed to load assessment. Please try again.')
          
          // Fall back to localStorage
          loadFromLocalStorage()
        }
      } else {
        // Load from localStorage if no assessmentId or user not authenticated
        loadFromLocalStorage()
      }
      
      setIsLoading(false)
    }
    
    const loadFromLocalStorage = () => {
      const storedAssessment = localStorage.getItem('assessment')
      if (storedAssessment) {
        try {
          const parsedAssessment = JSON.parse(storedAssessment)
          
          // Check if strengths and opportunities are the default placeholders
          // If they are, replace with more meaningful defaults
          if (parsedAssessment.productivity && 
              parsedAssessment.productivity.strengths.some((s: string) => s.includes('will be identified'))) {
            parsedAssessment.productivity.strengths = defaultStrengths.productivity
          }
          
          if (parsedAssessment.valueCreation && 
              parsedAssessment.valueCreation.strengths.some((s: string) => s.includes('will be identified'))) {
            parsedAssessment.valueCreation.strengths = defaultStrengths.valueCreation
          }
          
          if (parsedAssessment.businessModel && 
              parsedAssessment.businessModel.strengths.some((s: string) => s.includes('will be identified'))) {
            parsedAssessment.businessModel.strengths = defaultStrengths.businessModel
          }
          
          if (parsedAssessment.productivity && 
              parsedAssessment.productivity.opportunities.some((s: string) => s.includes('will be identified'))) {
            parsedAssessment.productivity.opportunities = defaultOpportunities.productivity
          }
          
          if (parsedAssessment.valueCreation && 
              parsedAssessment.valueCreation.opportunities.some((s: string) => s.includes('will be identified'))) {
            parsedAssessment.valueCreation.opportunities = defaultOpportunities.valueCreation
          }
          
          if (parsedAssessment.businessModel && 
              parsedAssessment.businessModel.opportunities.some((s: string) => s.includes('will be identified'))) {
            parsedAssessment.businessModel.opportunities = defaultOpportunities.businessModel
          }
          
          setAssessment(parsedAssessment)
          
          // Pre-fill email if available
          if (parsedAssessment.userInfo?.email) {
            setEmail(parsedAssessment.userInfo.email)
          } else if (currentUser?.email) {
            setEmail(currentUser.email)
          }
        } catch (error) {
          console.error('Error parsing assessment:', error)
          setAssessment(generateDemoAssessment())
        }
      } else {
        // If no assessment data found, generate demo assessment
        setAssessment(generateDemoAssessment())
      }
    }
    
    loadAssessment()
  }, [assessmentId, currentUser, router])
  
  const generateDemoAssessment = () => {
    return {
      userInfo: {
        name: "Demo User",
        role: "VP of Engineering",
        industry: "Manufacturing",
        orgSize: "Mid-sized"
      },
      productivity: {
        score: 2.0,
        level: 2,
        strengths: defaultStrengths.productivity,
        opportunities: defaultOpportunities.productivity
      },
      valueCreation: {
        score: 2.5,
        level: 2,
        strengths: defaultStrengths.valueCreation,
        opportunities: defaultOpportunities.valueCreation
      },
      businessModel: {
        score: 1.5,
        level: 1,
        strengths: defaultStrengths.businessModel,
        opportunities: defaultOpportunities.businessModel
      },
      overall: {
        score: 2.0,
        level: 2
      }
    };
  }
  
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading assessment results...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-md">
          <div className="text-center text-red-600 dark:text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Dashboard Link */}
        {currentUser && (
          <div className="mb-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        )}
        
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
              {currentUser ? (
                <Link 
                  href="/dashboard"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  <span>Return to Dashboard</span>
                  <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </Link>
              ) : (
                <Link 
                  href="/"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  <span>Return to Home</span>
                  <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
