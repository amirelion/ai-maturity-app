'use client'

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { MaturityLevel } from '@/types/assessment';

// Helper to check if Firestore is available
const isFirestoreAvailable = () => {
  return typeof window !== 'undefined' && db && typeof db !== 'undefined';
};

interface AssessmentCard {
  id: string;
  createdAt: Date;
  completedAt?: Date;
  status: 'in-progress' | 'completed';
  results?: {
    overall: {
      score: number;
      level: MaturityLevel;
    };
  };
  userInfo: {
    industry?: string;
    orgSize?: string;
  };
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [firestoreAvailable, setFirestoreAvailable] = useState(false);

  // Check if Firestore is available
  useEffect(() => {
    // Check after a slight delay to allow Firebase to initialize
    const checkFirestore = setTimeout(() => {
      try {
        const available = isFirestoreAvailable();
        setFirestoreAvailable(available);
        if (!available) {
          console.warn('Firestore is not available in dashboard, using localStorage fallback');
        }
      } catch (err) {
        console.error('Error checking Firestore availability:', err);
        setFirestoreAvailable(false);
      }
    }, 500);

    return () => clearTimeout(checkFirestore);
  }, []);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!currentUser || !firestoreAvailable) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        if (!db) {
          throw new Error('Firestore database is not initialized');
        }
        
        const assessmentsRef = collection(db, 'assessments');
        const q = query(
          assessmentsRef,
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const assessmentList: AssessmentCard[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          assessmentList.push({
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            completedAt: data.completedAt?.toDate(),
            status: data.status,
            results: data.results,
            userInfo: data.userInfo || {}
          });
        });
        
        setAssessments(assessmentList);
      } catch (err) {
        console.error('Error fetching assessments:', err);
        setError('Failed to load your assessments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch assessments once Firestore availability has been checked
    if (firestoreAvailable !== undefined) {
      fetchAssessments();
    }
  }, [currentUser, firestoreAvailable]);

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!currentUser || !firestoreAvailable || !db) {
      setError('Cannot delete assessment - Firestore is not available');
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'assessments', assessmentId));
      setAssessments(prev => prev.filter(assessment => assessment.id !== assessmentId));
      setDeleteConfirmation(null);
    } catch (err) {
      console.error('Error deleting assessment:', err);
      setError('Failed to delete assessment. Please try again.');
    }
  };

  const getMaturityLevelName = (level?: MaturityLevel) => {
    if (!level) return 'Unknown';
    
    switch (level) {
      case 1: return 'Exploring';
      case 2: return 'Experimenting';
      case 3: return 'Implementing';
      case 4: return 'Transforming';
      default: return 'Unknown';
    }
  };

  const getLevelColor = (level?: MaturityLevel) => {
    if (!level) return 'bg-gray-300';
    
    switch (level) {
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-blue-500';
      case 3: return 'bg-green-500';
      case 4: return 'bg-purple-500';
      default: return 'bg-gray-300';
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Your Assessments
            </h1>
            <Link
              href="/assessment"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              New Assessment
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md text-red-700 dark:text-red-100">
              {error}
            </div>
          ) : assessments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No assessments found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You haven't completed any AI maturity assessments yet.
              </p>
              <div className="mt-6">
                <Link
                  href="/assessment"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Start Your First Assessment
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            assessment.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          }`}>
                            {assessment.status === 'completed' ? 'Completed' : 'In Progress'}
                          </span>
                          {assessment.userInfo?.industry && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              {assessment.userInfo.industry}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setDeleteConfirmation(assessment.id)}
                          className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                          aria-label="Delete assessment"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="mt-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Created: {formatDate(assessment.createdAt)}
                        </div>
                        {assessment.completedAt && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Completed: {formatDate(assessment.completedAt)}
                          </div>
                        )}
                      </div>
                      
                      {assessment.status === 'completed' && assessment.results ? (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Overall Maturity: {assessment.results.overall.score.toFixed(1)}/4.0
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {getMaturityLevelName(assessment.results.overall.level)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div 
                              className={`${getLevelColor(assessment.results.overall.level)} h-2.5 rounded-full`}
                              style={{ width: `${(assessment.results.overall.score / 4) * 100}%` }}
                            ></div>
                          </div>
                          
                          <div className="mt-4">
                            <Link
                              href={`/assessment/results?id=${assessment.id}`}
                              className="inline-flex w-full justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 dark:text-primary-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                              View Full Results
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <Link
                            href={`/assessment/conversation?id=${assessment.id}`}
                            className="inline-flex w-full justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                          >
                            Continue Assessment
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Delete Confirmation Modal */}
              {deleteConfirmation && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Delete Assessment
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Are you sure you want to delete this assessment? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setDeleteConfirmation(null)}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteAssessment(deleteConfirmation)}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
