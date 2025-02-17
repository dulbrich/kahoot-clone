import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Share2, Eye, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import type { Quiz } from '../types';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const { data: quizData, error } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          status,
          share_code,
          created_at,
          updated_at,
          questions (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuizzes(quizData || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId: string) => {
    try {
      setDeleteQuizId(quizId);
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      toast.success('Quiz deleted successfully');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    } finally {
      setDeleteQuizId(null);
    }
  };

  const handleShare = (quiz: Quiz) => {
    if (quiz.status !== 'published') {
      toast.error('Quiz must be published before sharing');
      return;
    }
    
    const shareUrl = `${window.location.origin}/join/${quiz.share_code}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success('Share link copied to clipboard'))
      .catch(() => toast.error('Failed to copy share link'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">My Quizzes</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all your quizzes including their status and sharing options.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Quiz
          </Link>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new quiz.</p>
          <div className="mt-6">
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Quiz
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Title
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Questions
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Created
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {quizzes.map((quiz) => (
                      <tr key={quiz.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="font-medium text-gray-900">{quiz.title}</div>
                          {quiz.description && (
                            <div className="text-gray-500">{quiz.description}</div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {quiz.questions.count} questions
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              quiz.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {quiz.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end gap-2">
                            {quiz.status === 'published' && (
                              <button
                                onClick={() => navigate(`/results/${quiz.share_code}`)}
                                className="text-gray-400 hover:text-gray-500"
                                title="View Results"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleShare(quiz)}
                              className={`${
                                quiz.status === 'published'
                                  ? 'text-blue-400 hover:text-blue-500'
                                  : 'text-gray-300 cursor-not-allowed'
                              }`}
                              disabled={quiz.status !== 'published'}
                              title="Share Quiz"
                            >
                              <Share2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => navigate(`/edit/${quiz.id}`)}
                              className="text-indigo-400 hover:text-indigo-500"
                              title="Edit Quiz"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(quiz.id)}
                              disabled={deleteQuizId === quiz.id}
                              className="text-red-400 hover:text-red-500 disabled:opacity-50"
                              title="Delete Quiz"
                            >
                              {deleteQuizId === quiz.id ? (
                                <Loader className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toaster position="bottom-center" />
    </div>
  );
}