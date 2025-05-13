'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProfilePage() {
  const { currentUser, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [orgSize, setOrgSize] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadUserProfile = async () => {
      if (currentUser) {
        setName(currentUser.displayName || '');
        
        // Get additional user information from Firestore
        try {
          if (db) { // Check if db exists
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setIndustry(userData.industry || '');
              setRole(userData.role || '');
              setOrgSize(userData.orgSize || '');
            }
          } else {
            console.error('Firestore database is not initialized');
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };
    
    loadUserProfile();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Update Firebase Auth profile
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: name
        });
        
        // Update Firestore user document
        if (db) { // Check if db exists
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            name,
            industry,
            role,
            orgSize,
            updatedAt: new Date()
          });
        } else {
          throw new Error('Firestore database is not initialized');
        }
        
        setMessage({ 
          type: 'success', 
          text: 'Your profile has been updated successfully!' 
        });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'An error occurred while updating your profile. Please try again.' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Your Profile
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-300">
                Manage your account information
              </p>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
              {message.text && (
                <div className={`mb-4 p-3 rounded-md ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100' 
                    : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100'
                }`}>
                  {message.text}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Email cannot be changed
                  </p>
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Role
                  </label>
                  <div className="mt-1">
                    <input
                      id="role"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      placeholder="E.g., CTO, VP of Engineering, Data Scientist"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Industry
                  </label>
                  <div className="mt-1">
                    <select
                      id="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    >
                      <option value="">Select an industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Education">Education</option>
                      <option value="Government">Government</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="orgSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Organization Size
                  </label>
                  <div className="mt-1">
                    <select
                      id="orgSize"
                      value={orgSize}
                      onChange={(e) => setOrgSize(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    >
                      <option value="">Select organization size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1000 employees</option>
                      <option value="1001+">1001+ employees</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
