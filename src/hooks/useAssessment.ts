'use client'

import { useState, useEffect, useCallback } from 'react';
import { Question, Response, UserInfo, AssessmentResult } from '@/types/assessment';
import { allQuestions, userInfoQuestions, productivityQuestions, valueCreationQuestions, businessModelQuestions, closingQuestions } from '@/lib/questions';
import { questionsBank } from '@/config/ai-config';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// How many questions should be answered before allowing to complete assessment
const MIN_QUESTIONS_THRESHOLD = 4; 

// Defines how many user info questions to ask before moving to AI questions
const MAX_USER_INFO_QUESTIONS = 3; // We'll only ask for name/role, industry, and org size

export function useAssessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [userInfo, setUserInfo] = useState<Partial<UserInfo>>({});
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant' | 'system'; content: string }[]>([
    { 
      role: 'assistant', 
      content: allQuestions[0].text 
    }
  ]);
  const [currentContext, setCurrentContext] = useState<string>('userInfo');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canForceComplete, setCanForceComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(userInfoQuestions[0]);
  
  // New state variables for Firebase integration
  const { currentUser } = useAuth();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [isNewAssessment, setIsNewAssessment] = useState(true);
  
  // Calculate progress
  const progress = Math.min(Math.round((currentQuestionIndex / (userInfoQuestions.slice(0, MAX_USER_INFO_QUESTIONS).length + 
                                               productivityQuestions.slice(0, 3).length + 
                                               valueCreationQuestions.slice(0, 3).length + 
                                               businessModelQuestions.slice(0, 3).length)) * 100), 100);
  
  // Check if the user has an in-progress assessment or initialize a new one
  useEffect(() => {
    const initializeAssessment = async () => {
      // If the user is authenticated, check for existing assessments
      if (currentUser) {
        setIsLoading(true);
        try {
          // Check for in-progress assessment
          const assessmentsRef = collection(db, 'assessments');
          const q = query(
            assessmentsRef, 
            where('userId', '==', currentUser.uid),
            where('status', '==', 'in-progress'),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            // Load existing assessment
            const assessmentDoc = querySnapshot.docs[0];
            const assessmentData = assessmentDoc.data();
            
            setAssessmentId(assessmentDoc.id);
            setResponses(assessmentData.responses || []);
            setUserInfo(assessmentData.userInfo || {});
            setConversation(assessmentData.conversation || [{ role: 'assistant', content: allQuestions[0].text }]);
            setCurrentQuestionIndex(assessmentData.currentQuestionIndex || 0);
            setCurrentContext(assessmentData.currentContext || 'userInfo');
            setIsNewAssessment(false);
            
            console.log('Loaded existing assessment:', assessmentDoc.id);
          } else {
            // Create a new assessment
            const newAssessmentRef = await addDoc(collection(db, 'assessments'), {
              userId: currentUser.uid,
              status: 'in-progress',
              responses: [],
              userInfo: {},
              conversation: [{ role: 'assistant', content: allQuestions[0].text }],
              currentQuestionIndex: 0,
              currentContext: 'userInfo',
              createdAt: serverTimestamp()
            });
            
            setAssessmentId(newAssessmentRef.id);
            setIsNewAssessment(true);
            
            console.log('Created new assessment:', newAssessmentRef.id);
          }
        } catch (error) {
          console.error('Error initializing assessment:', error);
          setError('Failed to initialize assessment');
          
          // Fall back to localStorage
          loadFromLocalStorage();
        } finally {
          setIsLoading(false);
        }
      } else {
        // User not logged in, use localStorage
        loadFromLocalStorage();
      }
    };
    
    const loadFromLocalStorage = () => {
      const storedResponses = localStorage.getItem('assessment_responses');
      if (storedResponses) {
        setResponses(JSON.parse(storedResponses));
      }
      
      const storedUserInfo = localStorage.getItem('assessment_user_info');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
      
      const storedConversation = localStorage.getItem('assessment_conversation');
      if (storedConversation) {
        setConversation(JSON.parse(storedConversation));
      }
      
      const storedQuestionIndex = localStorage.getItem('assessment_question_index');
      if (storedQuestionIndex) {
        setCurrentQuestionIndex(parseInt(storedQuestionIndex, 10));
      }
    };
    
    initializeAssessment();
  }, [currentUser]);
  
  // Save to Firestore when data changes
  useEffect(() => {
    const saveToFirestore = async () => {
      if (currentUser && assessmentId && !isLoading) {
        try {
          const assessmentRef = doc(db, 'assessments', assessmentId);
          await updateDoc(assessmentRef, {
            responses,
            userInfo,
            conversation,
            currentQuestionIndex,
            currentContext,
            lastUpdatedAt: serverTimestamp()
          });
          
          console.log('Saved assessment data to Firestore');
        } catch (error) {
          console.error('Error saving to Firestore:', error);
          // Fall back to localStorage if Firestore fails
          saveToLocalStorage();
        }
      } else if (!currentUser) {
        // User not logged in, use localStorage
        saveToLocalStorage();
      }
    };
    
    const saveToLocalStorage = () => {
      if (responses.length > 0) {
        localStorage.setItem('assessment_responses', JSON.stringify(responses));
      }
      
      if (Object.keys(userInfo).length > 0) {
        localStorage.setItem('assessment_user_info', JSON.stringify(userInfo));
      }
      
      if (conversation.length > 1) {
        localStorage.setItem('assessment_conversation', JSON.stringify(conversation));
      }
      
      localStorage.setItem('assessment_question_index', currentQuestionIndex.toString());
    };
    
    // Don't save data if we're still initializing
    if (assessmentId || !currentUser) {
      if (responses.length > 0 || Object.keys(userInfo).length > 0 || conversation.length > 1) {
        if (currentUser && assessmentId) {
          saveToFirestore();
        } else {
          saveToLocalStorage();
        }
      }
    }
  }, [responses, userInfo, conversation, currentQuestionIndex, currentContext, currentUser, assessmentId, isLoading]);
  
  // Check if enough questions have been answered to allow force completion
  useEffect(() => {
    if (responses.length >= MIN_QUESTIONS_THRESHOLD) {
      setCanForceComplete(true);
    }
  }, [responses]);
  
  // Update current question and context based on responses length
  useEffect(() => {
    let question: Question | null = null;
    let context = currentContext;
    
    // User info questions (limited to MAX_USER_INFO_QUESTIONS)
    if (responses.length < MAX_USER_INFO_QUESTIONS) {
      context = 'userInfo';
      question = userInfoQuestions[responses.length];
    }
    // Productivity questions (ask 3)
    else if (responses.length < MAX_USER_INFO_QUESTIONS + 3) {
      context = 'productivity';
      question = productivityQuestions[responses.length - MAX_USER_INFO_QUESTIONS];
    }
    // Value Creation questions (ask 3)
    else if (responses.length < MAX_USER_INFO_QUESTIONS + 6) {
      context = 'valueCreation';
      question = valueCreationQuestions[responses.length - (MAX_USER_INFO_QUESTIONS + 3)];
    }
    // Business Model questions (ask 3)
    else if (responses.length < MAX_USER_INFO_QUESTIONS + 9) {
      context = 'businessModel';
      question = businessModelQuestions[responses.length - (MAX_USER_INFO_QUESTIONS + 6)];
    }
    // If we've gone through all categories, return a closing question
    else {
      context = 'closing';
      question = closingQuestions[0];
    }
    
    setCurrentQuestion(question);
    setCurrentContext(context);
  }, [responses.length]);
  
  // Add user response and get AI response
  const addResponse = useCallback(async (answer: string) => {
    if (!currentQuestion) {
      console.error('No current question available');
      return;
    }
    
    // Save this response
    const newResponse: Response = {
      questionId: currentQuestion.id,
      answer,
      timestamp: Date.now()
    };
    
    setResponses(prev => [...prev, newResponse]);
    
    // Add to conversation
    setConversation(prev => [
      ...prev,
      { role: 'user', content: answer }
    ]);
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update user info if this was a user info question
      if (currentQuestion.valueArea === 'general' && currentQuestion.id.startsWith('user-')) {
        if (currentQuestion.id === 'user-name-role') {
          // Extract name and role
          setUserInfo(prev => ({
            ...prev,
            name: answer.split(' ')[0], // Simple extraction for demo
            role: answer
          }));
        } else if (currentQuestion.id === 'user-industry') {
          setUserInfo(prev => ({
            ...prev,
            industry: answer
          }));
        } else if (currentQuestion.id === 'user-org-size') {
          setUserInfo(prev => ({
            ...prev,
            orgSize: answer
          }));
        } else if (currentQuestion.id === 'user-email') {
          setUserInfo(prev => ({
            ...prev,
            email: answer
          }));
        }
      }
      
      // Call API to get AI response
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: conversation.concat({ role: 'user', content: answer }),
          context: currentContext
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const assistantResponse = data.response;
      
      // Add assistant's response to conversation
      setConversation(prev => [
        ...prev,
        { role: 'assistant', content: assistantResponse }
      ]);
      
      // Check if we should move to completing the assessment
      if (responses.length >= MAX_USER_INFO_QUESTIONS + 8) { // -1 because we just added a new response
        // We've gone through all the question categories
        await completeAssessment();
      } else {
        // Update currentQuestionIndex just for progress tracking
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error processing response:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [responses, conversation, currentContext, currentQuestion]);
  
  // Force complete the assessment
  const forceCompleteAssessment = useCallback(async () => {
    if (responses.length < MIN_QUESTIONS_THRESHOLD) {
      setError(`Please answer at least ${MIN_QUESTIONS_THRESHOLD} questions before completing the assessment.`);
      return;
    }
    
    // Add a final message to the conversation
    setConversation(prev => [
      ...prev,
      { 
        role: 'assistant', 
        content: "Thank you for your responses! I'll now analyze what you've shared to generate your AI maturity report." 
      }
    ]);
    
    await completeAssessment();
  }, [responses]);
  
  // Complete the assessment and generate results
  const completeAssessment = async () => {
    try {
      setIsLoading(true);
      setIsAssessmentComplete(true);
      
      // If we don't have enough user info, fill with defaults
      const finalUserInfo: UserInfo = {
        name: userInfo.name || "User",
        role: userInfo.role || "Technology Professional",
        industry: userInfo.industry || "Technology",
        orgSize: userInfo.orgSize || "Medium",
        email: userInfo.email || ""
      };
      
      // Call the API to generate the assessment
      const response = await fetch('/api/assessment/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInfo: finalUserInfo,
          responses
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Analysis API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAssessment(data.assessment);
      
      // If user is authenticated, save completed assessment to Firestore
      if (currentUser && assessmentId) {
        try {
          const assessmentRef = doc(db, 'assessments', assessmentId);
          await updateDoc(assessmentRef, {
            status: 'completed',
            results: data.assessment,
            completedAt: serverTimestamp()
          });
          
          console.log('Saved completed assessment to Firestore');
        } catch (error) {
          console.error('Error saving completed assessment to Firestore:', error);
        }
      } else {
        // User not authenticated, save to localStorage
        localStorage.setItem('assessment', JSON.stringify(data.assessment));
      }
      
      // Clean up conversation history to save space if not using Firestore
      if (!currentUser) {
        localStorage.removeItem('assessment_conversation');
        localStorage.removeItem('assessment_responses');
        localStorage.removeItem('assessment_question_index');
      }
    } catch (err) {
      console.error('Error generating assessment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not generate assessment';
      setError(errorMessage);
      
      // If there's an error, generate a simple assessment for demo purposes
      const demoAssessment: AssessmentResult = {
        userInfo: userInfo as UserInfo,
        productivity: {
          score: 2.1,
          level: 2,
          strengths: ['Good adoption of basic AI tools', 'Leadership support for efficiency improvements'],
          opportunities: ['Expand training programs', 'Establish AI governance']
        },
        valueCreation: {
          score: 1.8,
          level: 2,
          strengths: ['Early experimentation with AI features', 'Customer-centric approach'],
          opportunities: ['Develop AI product roadmap', 'Enhance data capabilities']
        },
        businessModel: {
          score: 1.5,
          level: 1,
          strengths: ['Leadership awareness of AI potential', 'Initial interest in exploring AI opportunities'],
          opportunities: ['Develop AI strategy aligned with business goals', 'Identify potential areas for business model innovation']
        },
        overall: {
          score: 1.8,
          level: 2
        },
        responses,
        timestamp: Date.now()
      };
      
      setAssessment(demoAssessment);
      
      // Save the demo assessment
      if (currentUser && assessmentId) {
        try {
          const assessmentRef = doc(db, 'assessments', assessmentId);
          await updateDoc(assessmentRef, {
            status: 'completed',
            results: demoAssessment,
            completedAt: serverTimestamp(),
            error: errorMessage
          });
        } catch (saveError) {
          console.error('Error saving demo assessment to Firestore:', saveError);
          localStorage.setItem('assessment', JSON.stringify(demoAssessment));
        }
      } else {
        localStorage.setItem('assessment', JSON.stringify(demoAssessment));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Play audio for assistant responses (if using voice mode)
  const playAssistantResponse = async (text: string) => {
    try {
      const response = await fetch('/api/openai/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }
      
      const audioArrayBuffer = await response.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(audioArrayBuffer);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      
      return new Promise<void>((resolve) => {
        source.onended = () => resolve();
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      return Promise.resolve(); // Continue even if audio fails
    }
  };
  
  // Reset the assessment
  const resetAssessment = async () => {
    setCurrentQuestionIndex(0);
    setResponses([]);
    setUserInfo({});
    setAssessment(null);
    setConversation([{ 
      role: 'assistant', 
      content: userInfoQuestions[0].text 
    }]);
    setIsAssessmentComplete(false);
    setError(null);
    setCurrentContext('userInfo');
    setCanForceComplete(false);
    
    // If user is authenticated, create a new assessment in Firestore
    if (currentUser) {
      try {
        const newAssessmentRef = await addDoc(collection(db, 'assessments'), {
          userId: currentUser.uid,
          status: 'in-progress',
          responses: [],
          userInfo: {},
          conversation: [{ role: 'assistant', content: userInfoQuestions[0].text }],
          currentQuestionIndex: 0,
          currentContext: 'userInfo',
          createdAt: serverTimestamp()
        });
        
        setAssessmentId(newAssessmentRef.id);
        setIsNewAssessment(true);
        
        console.log('Created new assessment:', newAssessmentRef.id);
      } catch (error) {
        console.error('Error creating new assessment:', error);
      }
    } else {
      // Clear localStorage
      localStorage.removeItem('assessment');
      localStorage.removeItem('assessment_conversation');
      localStorage.removeItem('assessment_responses');
      localStorage.removeItem('assessment_user_info');
      localStorage.removeItem('assessment_question_index');
    }
  };
  
  return {
    currentQuestion,
    responses,
    addResponse,
    userInfo,
    conversation,
    progress,
    isLoading,
    isAssessmentComplete,
    assessment,
    error,
    canForceComplete,
    forceCompleteAssessment,
    playAssistantResponse,
    resetAssessment,
    assessmentId
  };
}
