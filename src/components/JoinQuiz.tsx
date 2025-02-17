import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export default function JoinQuiz() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { code: urlCode } = useParams();

  useEffect(() => {
    if (urlCode) {
      setCode(urlCode.toUpperCase());
      verifyQuiz(urlCode.toUpperCase()).catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to verify quiz');
      });
    }
  }, [urlCode]);

  const verifyQuiz = async (quizCode: string) => {
    setIsVerifying(true);
    try {
      // Verify the quiz exists and is published first
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('id, status, share_code')
        .eq('share_code', quizCode)
        .eq('status', 'published')
        .maybeSingle();

      if (quizError) {
        console.error('Quiz verification error:', quizError);
        throw new Error('Failed to verify quiz');
      }

      if (!quiz) {
        throw new Error('Invalid quiz code');
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error('Authentication error');
      }

      if (!user) {
        throw new Error('Please sign in to participate');
      }

      // Check if user is already a participant
      const { data: existingParticipant, error: participantError } = await supabase
        .from('participants')
        .select('id')
        .eq('quiz_id', quiz.id)
        .eq('name', user.email)
        .maybeSingle();

      if (participantError) {
        console.error('Participant check error:', participantError);
        throw new Error('Failed to verify participation status');
      }

      if (existingParticipant) {
        throw new Error('You have already participated in this quiz');
      }

      return quiz;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to verify quiz');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      toast.error('Please enter a quiz code');
      return;
    }

    setIsLoading(true);
    try {
      const quiz = await verifyQuiz(code.toUpperCase());
      navigate(`/quiz/${quiz.share_code}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Join Quiz</h2>
          <p className="mt-2 text-gray-600">Enter the quiz code to participate</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Quiz Code
            </label>
            <input
              id="code"
              type="text"
              maxLength={6}
              value={code}
              onChange={handleCodeChange}
              placeholder="Enter 6-digit code"
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-lg tracking-widest font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase text-center"
              disabled={isLoading || isVerifying}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isVerifying}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || isVerifying ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{isVerifying ? 'Verifying...' : 'Joining...'}</span>
              </div>
            ) : (
              'Join Quiz'
            )}
          </button>
        </form>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}