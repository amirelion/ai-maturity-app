import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-12">
      <div className="w-full max-w-4xl px-6 py-10 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
          AI Maturity Navigator
        </h1>
        
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 text-center">
          Discover your organization&apos;s AI readiness across key value dimensions
        </p>
        
        <div className="mb-12 space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 text-white">
                1
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">Productivity Enhancement</h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">How effectively are you leveraging AI to boost individual and team efficiency?</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 text-white">
                2
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">Value Creation</h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">Are you incorporating AI into products and services to enhance customer value?</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 text-white">
                3
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">Business Model Innovation</h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">How ready is your organization to transform its business model with AI?</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link href="/assessment" className="px-8 py-3 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
            Start Your Assessment
          </Link>
        </div>
      </div>
    </div>
  )
}