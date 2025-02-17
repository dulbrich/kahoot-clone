import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import QuizForm from './components/QuizForm';
import JoinQuiz from './components/JoinQuiz';
import QuizParticipation from './components/QuizParticipation';
import QuizResults from './components/QuizResults';
import Auth from './components/Auth';

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

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <>
                <header className="bg-white shadow-sm">
                  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Create Quiz</h1>
                    <button
                      onClick={() => supabase.auth.signOut()}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Sign Out
                    </button>
                  </div>
                </header>
                <main className="py-8">
                  <QuizForm />
                </main>
              </>
            ) : (
              <Auth />
            )
          }
        />
        <Route path="/join/:code?" element={<JoinQuiz />} />
        <Route path="/quiz/:code" element={<QuizParticipation />} />
        <Route path="/results/:code" element={<QuizResults />} />
      </Routes>
    </div>
  );
}

export default App;