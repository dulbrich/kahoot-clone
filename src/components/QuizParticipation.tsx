import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timer, CheckCircle2, XCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import type { Quiz, QuizState, ParticipantAnswer } from '../types';
import { supabase } from '../lib/supabase';

export default function QuizParticipation() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    timeRemaining: 0,
    answers: [],
    status: 'waiting',
  });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startLoading, setStartLoading] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select(`
            id,
            title,
            description,
            status,
            share_code,
            questions (
              id,
              text,
              time_limit,
              order,
              options (
                id,
                text,
                is_correct,
                order
              )
            )
          `)
          .eq('share_code', code)
          .eq('status', 'published')
          .single();

        if (quizError) throw quizError;
        if (!quizData) {
          toast.error('Quiz not found');
          navigate('/join');
          return;
        }

        // Sort questions and options by their order
        const formattedQuiz = {
          ...quizData,
          questions: quizData.questions
            .sort((a, b) => a.order - b.order)
            .map(q => ({
              ...q,
              options: q.options.sort((a, b) => a.order - b.order),
            })),
        };

        setQuiz(formattedQuiz);
        setQuizState(prev => ({
          ...prev,
          timeRemaining: formattedQuiz.questions[0].time_limit,
        }));
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Failed to load quiz');
        navigate('/join');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [code, navigate]);

  useEffect(() => {
    if (quizState.status === 'active' && quizState.timeRemaining > 0) {
      const timer = setInterval(() => {
        setQuizState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);

      return () => clearInterval(timer);
    }

    if (quizState.timeRemaining === 0 && quizState.status === 'active') {
      handleTimeUp();
    }
  }, [quizState.status, quizState.timeRemaining]);

  const handleTimeUp = () => {
    if (!selectedOption) {
      toast.error("Time's up!");
    }
    showAnswer();
  };

  const startQuiz = async () => {
    if (!quiz) {
      toast.error('Quiz not found');
      return;
    }

    setStartLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be signed in to participate');
      }

      // Create participant record
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .insert({
          quiz_id: quiz.id,
          name: user.email, // Use user's email as the participant name
        })
        .select('id')
        .single();

      if (participantError) {
        console.error('Error creating participant:', participantError);
        throw new Error('Failed to register participant');
      }

      if (!participant?.id) {
        throw new Error('No participant ID returned');
      }

      setParticipantId(participant.id);
      setQuizState(prev => ({
        ...prev,
        status: 'active',
      }));
      
      toast.success('Quiz started!');
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start quiz. Please try again.');
    } finally {
      setStartLoading(false);
    }
  };

  const showAnswer = () => {
    setShowFeedback(true);
    setTimeout(() => {
      if (quizState.currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
        nextQuestion();
      } else {
        setQuizState(prev => ({ ...prev, status: 'completed' }));
        navigate(`/results/${code}`);
      }
    }, 3000);
  };

  const nextQuestion = () => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      timeRemaining: quiz?.questions[prev.currentQuestionIndex + 1].time_limit || 30,
    }));
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const handleOptionSelect = async (optionId: string) => {
    if (showFeedback || quizState.status !== 'active' || !quiz || !participantId) return;
    
    setSelectedOption(optionId);
    const currentQuestion = quiz.questions[quizState.currentQuestionIndex];
    const timeToAnswer = currentQuestion.time_limit - quizState.timeRemaining;

    try {
      // Save the answer
      const { error: answerError } = await supabase
        .from('answers')
        .insert({
          participant_id: participantId,
          question_id: currentQuestion.id,
          option_id: optionId,
          time_to_answer: timeToAnswer,
        });

      if (answerError) {
        console.error('Error saving answer:', answerError);
        throw answerError;
      }

      const answer: ParticipantAnswer = {
        questionId: currentQuestion.id,
        optionId,
        timeToAnswer,
      };

      setQuizState(prev => ({
        ...prev,
        answers: [...prev.answers, answer],
      }));

      showAnswer();
    } catch (error) {
      console.error('Error saving answer:', error);
      toast.error('Failed to save answer');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Quiz Not Found</h2>
          <p className="mt-2 text-gray-600">The quiz you're looking for doesn't exist or has ended.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[quizState.currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        {quizState.status === 'waiting' && (
          <div className="text-center space-y-6 mt-20">
            <h2 className="text-3xl font-bold text-gray-900">Ready to Start?</h2>
            <p className="text-gray-600">Click the button below when you're ready to begin.</p>
            <button
              onClick={startQuiz}
              disabled={startLoading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {startLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Starting...</span>
                </div>
              ) : (
                'Start Quiz'
              )}
            </button>
          </div>
        )}

        {quizState.status === 'active' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Question {quizState.currentQuestionIndex + 1} of {quiz.questions.length}
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Timer className="w-4 h-4" />
                <span>{quizState.timeRemaining}s</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {currentQuestion.text}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOption === option.id;
                  const showCorrect = showFeedback && option.is_correct;
                  const showIncorrect = showFeedback && isSelected && !option.is_correct;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      disabled={showFeedback}
                      className={`
                        relative p-4 rounded-lg text-left transition-all duration-200
                        ${showFeedback ? 'cursor-default' : 'hover:bg-blue-50'}
                        ${isSelected ? 'ring-2 ring-blue-500' : 'border border-gray-200'}
                        ${showCorrect ? 'bg-green-50 border-green-500' : ''}
                        ${showIncorrect ? 'bg-red-50 border-red-500' : ''}
                      `}
                    >
                      <span className="block text-gray-900">{option.text}</span>
                      {showCorrect && (
                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                      {showIncorrect && (
                        <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {quizState.status === 'completed' && (
          <div className="text-center space-y-6 mt-20">
            <h2 className="text-3xl font-bold text-gray-900">Quiz Completed!</h2>
            <p className="text-gray-600">
              Thank you for participating. Your results will be shown when the host ends the quiz.
            </p>
          </div>
        )}
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}