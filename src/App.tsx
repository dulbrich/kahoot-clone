import React from 'react';
import { Routes, Route } from 'react-router-dom';
import QuizForm from './components/QuizForm';
import JoinQuiz from './components/JoinQuiz';
import QuizParticipation from './components/QuizParticipation';
import QuizResults from './components/QuizResults';

// Mock data for demonstration
const mockQuiz = {
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
    {
      id: '2',
      text: 'Which planet is known as the Red Planet?',
      timeLimit: 20,
      options: [
        { id: 'a', text: 'Venus', isCorrect: false },
        { id: 'b', text: 'Mars', isCorrect: true },
        { id: 'c', text: 'Jupiter', isCorrect: false },
        { id: 'd', text: 'Saturn', isCorrect: false },
      ],
    },
  ],
  status: 'published',
  createdAt: new Date(),
  updatedAt: new Date(),
  shareCode: 'ABC123',
};

const mockResults = [
  {
    participantId: '1',
    participantName: 'John Doe',
    answers: [
      { questionId: '1', optionId: 'b', timeToAnswer: 15 },
      { questionId: '2', optionId: 'b', timeToAnswer: 12 },
    ],
    score: 100,
    totalTime: 27,
  },
  {
    participantId: '2',
    participantName: 'Jane Smith',
    answers: [
      { questionId: '1', optionId: 'a', timeToAnswer: 20 },
      { questionId: '2', optionId: 'b', timeToAnswer: 18 },
    ],
    score: 50,
    totalTime: 38,
  },
  {
    participantId: '3',
    participantName: 'Bob Wilson',
    answers: [
      { questionId: '1', optionId: 'b', timeToAnswer: 25 },
      { questionId: '2', optionId: 'c', timeToAnswer: 15 },
    ],
    score: 50,
    totalTime: 40,
  },
];

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                  <h1 className="text-2xl font-bold text-gray-900">Create Quiz</h1>
                </div>
              </header>
              <main className="py-8">
                <QuizForm />
              </main>
            </>
          }
        />
        <Route path="/join/:code?" element={<JoinQuiz />} />
        <Route path="/quiz/:code" element={<QuizParticipation />} />
        <Route
          path="/results/:code"
          element={<QuizResults quiz={mockQuiz} results={mockResults} />}
        />
      </Routes>
    </div>
  );
}

export default App;