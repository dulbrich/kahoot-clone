import React, { useState } from 'react';
import { PlusCircle, Trash2, Clock, Save, Share2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import type { Quiz, QuizQuestion } from '../types';
import ShareModal from './ShareModal';

const initialQuiz: Quiz = {
  id: crypto.randomUUID(),
  title: '',
  description: '',
  questions: [],
  status: 'draft',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const initialQuestion: Omit<QuizQuestion, 'id'> = {
  text: '',
  timeLimit: 30,
  options: [
    { id: crypto.randomUUID(), text: '', isCorrect: false },
    { id: crypto.randomUUID(), text: '', isCorrect: false },
  ],
};

function generateShareCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export default function QuizForm() {
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz);
  const [showShareModal, setShowShareModal] = useState(false);

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { ...initialQuestion, id: crypto.randomUUID() }],
    }));
  };

  const removeQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, ...updates } : q)),
    }));
  };

  const addOption = (questionIndex: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: [...q.options, { id: crypto.randomUUID(), text: '', isCorrect: false }],
            }
          : q
      ),
    }));
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.filter((_, j) => j !== optionIndex),
            }
          : q
      ),
    }));
  };

  const saveQuiz = (status: 'draft' | 'published') => {
    const updatedQuiz = {
      ...quiz,
      status,
      updatedAt: new Date(),
      shareCode: status === 'published' ? generateShareCode() : undefined,
    };
    setQuiz(updatedQuiz);
    console.log('Saving quiz:', updatedQuiz);
    
    if (status === 'published') {
      setShowShareModal(true);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4">
          <input
            type="text"
            placeholder="Quiz Title"
            className="w-full text-2xl sm:text-3xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
            value={quiz.title}
            onChange={e => setQuiz(prev => ({ ...prev, title: e.target.value }))}
          />
          <textarea
            placeholder="Quiz Description"
            className="w-full text-gray-600 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2 resize-none min-h-[80px]"
            value={quiz.description}
            onChange={e => setQuiz(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="space-y-4">
          {quiz.questions.map((question, questionIndex) => (
            <div key={question.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4">
              <div className="flex items-start justify-between">
                <input
                  type="text"
                  placeholder="Question Text"
                  className="flex-1 text-lg sm:text-xl font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
                  value={question.text}
                  onChange={e =>
                    updateQuestion(questionIndex, { text: e.target.value })
                  }
                />
                <button
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-red-500 hover:text-red-700 p-2 touch-manipulation"
                  aria-label="Remove question"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <input
                  type="number"
                  min="5"
                  max="120"
                  className="w-20 border rounded-md p-2 touch-manipulation"
                  value={question.timeLimit}
                  onChange={e =>
                    updateQuestion(questionIndex, {
                      timeLimit: parseInt(e.target.value) || 30,
                    })
                  }
                />
                <span>seconds</span>
              </div>

              <div className="space-y-3">
                {question.options.map((option, optionIndex) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <div className="relative flex items-center touch-manipulation">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={e =>
                          updateQuestion(questionIndex, {
                            options: question.options.map((opt, idx) =>
                              idx === optionIndex
                                ? { ...opt, isCorrect: e.target.checked }
                                : opt
                            ),
                          })
                        }
                        className="w-6 h-6 text-green-500 rounded focus:ring-green-500 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder={`Option ${optionIndex + 1}`}
                      className="flex-1 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 touch-manipulation"
                      value={option.text}
                      onChange={e =>
                        updateQuestion(questionIndex, {
                          options: question.options.map((opt, idx) =>
                            idx === optionIndex
                              ? { ...opt, text: e.target.value }
                              : opt
                          ),
                        })
                      }
                    />
                    {question.options.length > 2 && (
                      <button
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        className="text-red-500 hover:text-red-700 p-2 touch-manipulation"
                        aria-label="Remove option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addOption(questionIndex)}
                  className="text-blue-500 hover:text-blue-700 flex items-center space-x-1 p-2 touch-manipulation"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Option</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addQuestion}
          className="w-full py-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center space-x-2 touch-manipulation"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Question</span>
        </button>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => saveQuiz('draft')}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2 touch-manipulation"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => saveQuiz('published')}
            className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2 touch-manipulation"
          >
            <Share2 className="w-4 h-4" />
            <span>Publish & Share</span>
          </button>
        </div>
      </div>

      {showShareModal && (
        <ShareModal quiz={quiz} onClose={() => setShowShareModal(false)} />
      )}
      
      <Toaster position="bottom-center" />
    </>
  );
}