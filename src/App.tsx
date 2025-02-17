import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { supabase } from './lib/supabase';
import QuizForm from './components/QuizForm';
import QuizList from './components/QuizList';
import JoinQuiz from './components/JoinQuiz';
import QuizParticipation from './components/QuizParticipation';
import QuizResults from './components/QuizResults';
import Auth from './components/Auth';
import { LogOut, PlusCircle, List } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                to="/"
                className="flex items-center px-2 py-2 text-gray-900 hover:text-gray-600"
              >
                <List className="w-5 h-5 mr-1" />
                My Quizzes
              </Link>
              <Link
                to="/create"
                className="flex items-center ml-8 px-2 py-2 text-gray-900 hover:text-gray-600"
              >
                <PlusCircle className="w-5 h-5 mr-1" />
                Create Quiz
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">{user.email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-8">
        <Routes>
          <Route path="/" element={<QuizList />} />
          <Route path="/create" element={<QuizForm />} />
          <Route path="/edit/:id" element={<QuizForm />} />
          <Route path="/join/:code?" element={<JoinQuiz />} />
          <Route path="/quiz/:code" element={<QuizParticipation />} />
          <Route path="/results/:code" element={<QuizResults />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;