'use client'

import { useState, useEffect, useCallback } from 'react';
import { Question, Response, UserInfo, AssessmentResult } from '@/types/assessment';
import { allQuestions } from '@/lib/questions';
import { questionsBank } from '@/config/ai-config';

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
  
  // Calculate progress
  const progress = Math.min(Math.round((currentQuestionIndex / allQuestions.length) * 100), 100);
  
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
        await generateAssessmentResults();
      }
    } catch (err) {
      console.error('Error processing response:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestionIndex, userInfo, responses, conversation, currentContext]);
  
  // Generate assessment results using the API
  const generateAssessmentResults = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/assessment/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInfo,
          responses
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Analysis API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAssessment(data.assessment);
    } catch (err) {
      console.error('Error generating assessment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not generate assessment';
      setError(errorMessage);
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
    playAssistantResponse,
    resetAssessment
  };
}