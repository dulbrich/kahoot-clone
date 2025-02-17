import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Timer, CheckCircle2, XCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import type { Quiz, QuizState, ParticipantAnswer } from '../types';

export default function QuizParticipation() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    timeRemaining: 0,
    answers: [],
    status: 'waiting',
  });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Simulated quiz data - replace with actual API call
  useEffect(() => {
    // TODO: Fetch quiz data from API
    const mockQuiz: Quiz = {
      id: '1',
      title: 'Sample Quiz',
      description: 'A sample quiz for testing',
      questions: [
        {
          id: '1',
          text: 'What is the capital of France?',
          timeLimit: 30,
          options: [
            { id: 'a', text: 'London', isCorrect: false },
            { id: 'b', text: 'Paris', isCorrect: true },
            { id: 'c', text: 'Berlin', isCorrect: false },
            { id: 'd', text: 'Madrid', isCorrect: false },
          ],
        },
        // Add more questions as needed
      ],
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
      shareCode: code,
    };
    setQuiz(mockQuiz);
    setQuizState(prev => ({
      ...prev,
      timeRemaining: mockQuiz.questions[0].timeLimit,
    }));
  }, [code]);

  useEffect(() => {
    if (!location.state?.participantName) {
      navigate(`/join/${code}`);
    }
  }, [location.state, code, navigate]);

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
      toast.error("Time is up!");
    }
    showAnswer();
  };

  const startQuiz = () => {
    setQuizState(prev => ({
      ...prev,
      status: 'active',
    }));
  };

  const showAnswer = () => {
    setShowFeedback(true);
    setTimeout(() => {
      if (quizState.currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
        nextQuestion();
      } else {
        setQuizState(prev => ({ ...prev, status: 'completed' }));
      }
    }, 3000);
  };

  const nextQuestion = () => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      timeRemaining: quiz?.questions[prev.currentQuestionIndex + 1].timeLimit || 30,
    }));
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const handleOptionSelect = (optionId: string) => {
    if (showFeedback || quizState.status !== 'active') return;
    
    setSelectedOption(optionId);
    const answer: ParticipantAnswer = {
      questionId: quiz!.questions[quizState.currentQuestionIndex].id,
      optionId,
      timeToAnswer: quiz!.questions[quizState.currentQuestionIndex].timeLimit - quizState.timeRemaining,
    };
    setQuizState(prev => ({
      ...prev,
      answers: [...prev.answers, answer],
    }));
    showAnswer();
  };

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
            <p className="text-gray-600">
              Welcome, {location.state?.participantName}! Click the button below when you're ready.
            </p>
            <button
              onClick={startQuiz}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Quiz
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
                  const showCorrect = showFeedback && option.isCorrect;
                  const showIncorrect = showFeedback && isSelected && !option.isCorrect;

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