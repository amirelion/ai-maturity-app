'use client'

import { useState, useEffect, useCallback } from 'react';
import { Question, Response, UserInfo, AssessmentResult } from '@/types/assessment';
import { allQuestions } from '@/lib/questions';

export function useAssessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [userInfo, setUserInfo] = useState<Partial<UserInfo>>({});
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { 
      role: 'assistant', 
      content: allQuestions[0].text 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);
  
  // Calculate progress
  const progress = Math.min(Math.round((currentQuestionIndex / allQuestions.length) * 100), 100);
  
  // Add user response
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
    
    try {
      // In a real implementation, this would call the API to get the assistant's response
      // For demo purposes, we'll use a timeout to simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      
      // Move to next question if available
      if (currentQuestionIndex < allQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        
        // Add assistant's next question to conversation
        const nextQuestion = allQuestions[currentQuestionIndex + 1];
        setConversation(prev => [
          ...prev,
          { role: 'assistant', content: nextQuestion.text }
        ]);
      } else {
        // Assessment complete
        setIsAssessmentComplete(true);
        
        // Add final message
        setConversation(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: "Thank you for completing the assessment! I'm analyzing your responses to generate your AI maturity report." 
          }
        ]);
        
        // Generate assessment results
        // In a real implementation, this would call the API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, we'll generate a mock assessment
        const mockAssessment: AssessmentResult = {
          userInfo: userInfo as UserInfo,
          productivity: {
            score: 2.5,
            level: 2,
            strengths: ['Good adoption of basic AI tools', 'Clear vision for productivity improvements'],
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
        
        setAssessment(mockAssessment);
      }
    } catch (error) {
      console.error('Error processing response:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestionIndex, userInfo, responses]);
  
  return {
    currentQuestion: allQuestions[currentQuestionIndex],
    responses,
    addResponse,
    userInfo,
    conversation,
    progress,
    isLoading,
    isAssessmentComplete,
    assessment
  };
}