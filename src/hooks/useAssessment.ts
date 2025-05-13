'use client'

import { useState, useEffect, useCallback } from 'react';
import { Question, Response, UserInfo, AssessmentResult } from '@/types/assessment';
import { allQuestions } from '@/lib/questions';
import { questionsBank } from '@/config/ai-config';

// How many questions should be answered before allowing to complete assessment
const MIN_QUESTIONS_THRESHOLD = 4; 

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
  
  // Calculate progress
  const progress = Math.min(Math.round((currentQuestionIndex / allQuestions.length) * 100), 100);
  
  // Load any existing data from localStorage
  useEffect(() => {
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
  }, []);
  
  // Update localStorage when data changes
  useEffect(() => {
    if (responses.length > 0) {
      localStorage.setItem('assessment_responses', JSON.stringify(responses));
    }
  }, [responses]);
  
  useEffect(() => {
    if (Object.keys(userInfo).length > 0) {
      localStorage.setItem('assessment_user_info', JSON.stringify(userInfo));
    }
  }, [userInfo]);
  
  useEffect(() => {
    if (conversation.length > 1) {
      localStorage.setItem('assessment_conversation', JSON.stringify(conversation));
    }
  }, [conversation]);
  
  useEffect(() => {
    localStorage.setItem('assessment_question_index', currentQuestionIndex.toString());
  }, [currentQuestionIndex]);
  
  // Store assessment when it's generated
  useEffect(() => {
    if (assessment) {
      localStorage.setItem('assessment', JSON.stringify(assessment));
    }
  }, [assessment]);
  
  // Check if enough questions have been answered to allow force completion
  useEffect(() => {
    if (responses.length >= MIN_QUESTIONS_THRESHOLD) {
      setCanForceComplete(true);
    }
  }, [responses]);
  
  // Determine conversation context based on current question
  useEffect(() => {
    const currentQuestion = allQuestions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    switch (currentQuestion.valueArea) {
      case 'general':
        if (currentQuestion.id.startsWith('user-')) {
          setCurrentContext('userInfo');
        } else if (currentQuestion.id.startsWith('closing-')) {
          setCurrentContext('closing');
        }
        break;
      case 'productivity':
        setCurrentContext('productivity');
        break;
      case 'valueCreation':
        setCurrentContext('valueCreation');
        break;
      case 'businessModel':
        setCurrentContext('businessModel');
        break;
    }
  }, [currentQuestionIndex]);
  
  // Add user response and get AI response
  const addResponse = useCallback(async (answer: string) => {
    const currentQuestion = allQuestions[currentQuestionIndex];
    
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
      
      // Move to next question if available
      if (currentQuestionIndex < allQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Assessment complete
        await completeAssessment();
      }
    } catch (err) {
      console.error('Error processing response:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestionIndex, userInfo, responses, conversation, currentContext]);
  
  // Force complete the assessment (for demo purposes)
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
      
      // Store in localStorage for the results page
      localStorage.setItem('assessment', JSON.stringify(data.assessment));
      
      // Clean up conversation history to save space
      localStorage.removeItem('assessment_conversation');
      localStorage.removeItem('assessment_responses');
      localStorage.removeItem('assessment_question_index');
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
          score: 3.2,
          level: 3,
          strengths: ['Leadership vision for transformation', 'Willingness to disrupt status quo'],
          opportunities: ['Pilot new business models', 'Develop ecosystem partnerships']
        },
        overall: {
          score: 2.5,
          level: 2
        },
        responses,
        timestamp: Date.now()
      };
      
      setAssessment(demoAssessment);
      localStorage.setItem('assessment', JSON.stringify(demoAssessment));
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
  const resetAssessment = () => {
    setCurrentQuestionIndex(0);
    setResponses([]);
    setUserInfo({});
    setAssessment(null);
    setConversation([{ 
      role: 'assistant', 
      content: allQuestions[0].text 
    }]);
    setIsAssessmentComplete(false);
    setError(null);
    setCurrentContext('userInfo');
    setCanForceComplete(false);
    
    // Clear localStorage
    localStorage.removeItem('assessment');
    localStorage.removeItem('assessment_conversation');
    localStorage.removeItem('assessment_responses');
    localStorage.removeItem('assessment_user_info');
    localStorage.removeItem('assessment_question_index');
  };
  
  return {
    currentQuestion: allQuestions[currentQuestionIndex],
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
    resetAssessment
  };
}