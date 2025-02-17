import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Download,
  Users,
  Timer,
  CheckCircle,
  BarChart2,
  PieChart as PieChartIcon,
} from 'lucide-react';
import type { Quiz, ParticipantResult, QuestionSummary } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface QuizResultsProps {
  quiz: Quiz;
  results: ParticipantResult[];
}

export default function QuizResults({ quiz, results }: QuizResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions'>('overview');
  const [selectedQuestion, setSelectedQuestion] = useState<string>(
    quiz.questions[0]?.id
  );
  const [questionSummaries, setQuestionSummaries] = useState<QuestionSummary[]>([]);

  useEffect(() => {
    // Calculate question summaries
    const summaries = quiz.questions.map((question) => {
      const answers = results.flatMap((r) =>
        r.answers.filter((a) => a.questionId === question.id)
      );
      
      const totalResponses = answers.length;
      const correctResponses = answers.filter((answer) => {
        const option = question.options.find((opt) => opt.id === answer.optionId);
        return option?.isCorrect;
      }).length;

      const averageTime =
        answers.reduce((sum, answer) => sum + answer.timeToAnswer, 0) /
        totalResponses;

      const optionBreakdown = question.options.map((option) => {
        const count = answers.filter((a) => a.optionId === option.id).length;
        return {
          optionId: option.id,
          optionText: option.text,
          count,
          percentage: (count / totalResponses) * 100,
        };
      });

      return {
        questionId: question.id,
        questionText: question.text,
        totalResponses,
        correctResponses,
        averageTime,
        optionBreakdown,
      };
    });

    setQuestionSummaries(summaries);
  }, [quiz, results]);

  const overallStats = {
    totalParticipants: results.length,
    averageScore:
      results.reduce((sum, r) => sum + r.score, 0) / results.length,
    averageTime:
      results.reduce((sum, r) => sum + r.totalTime, 0) / results.length,
  };

  const exportResults = () => {
    const csvContent = [
      // Header
      ['Participant', 'Score', 'Total Time', ...quiz.questions.map((q) => q.text)],
      // Data rows
      ...results.map((result) => [
        result.participantName,
        result.score,
        result.totalTime,
        ...quiz.questions.map((question) => {
          const answer = result.answers.find(
            (a) => a.questionId === question.id
          );
          const option = question.options.find(
            (opt) => opt.id === answer?.optionId
          );
          return option?.text || 'No answer';
        }),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title}-results.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const selectedQuestionSummary = questionSummaries.find(
    (q) => q.questionId === selectedQuestion
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
          <button
            onClick={exportResults}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Results</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Total Participants</p>
                <p className="text-2xl font-bold text-blue-900">
                  {overallStats.totalParticipants}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">Average Score</p>
                <p className="text-2xl font-bold text-green-900">
                  {overallStats.averageScore.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 rounded-full p-2">
                <Timer className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-orange-600">Average Time</p>
                <p className="text-2xl font-bold text-orange-900">
                  {overallStats.averageTime.toFixed(1)}s
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <div className="flex space-x-4 p-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'questions'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <PieChartIcon className="w-4 h-4" />
              <span>Question Analysis</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={results}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="participantName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#0088FE" name="Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result) => (
                      <tr key={result.participantId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {result.participantName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {result.score.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {result.totalTime.toFixed(1)}s
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex space-x-4">
                <select
                  value={selectedQuestion}
                  onChange={(e) => setSelectedQuestion(e.target.value)}
                  className="block w-full max-w-md rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {quiz.questions.map((question, index) => (
                    <option key={question.id} value={question.id}>
                      Question {index + 1}: {question.text}
                    </option>
                  ))}
                </select>
              </div>

              {selectedQuestionSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Response Distribution
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={selectedQuestionSummary.optionBreakdown}
                            dataKey="count"
                            nameKey="optionText"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {selectedQuestionSummary.optionBreakdown.map(
                              (entry, index) => (
                                <Cell
                                  key={entry.optionId}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600">Correct Responses</p>
                      <p className="text-2xl font-bold text-green-900">
                        {(
                          (selectedQuestionSummary.correctResponses /
                            selectedQuestionSummary.totalResponses) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600">Average Time</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {selectedQuestionSummary.averageTime.toFixed(1)}s
                      </p>
                    </div>

                    <div className="bg-white rounded-lg border p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Option Breakdown
                      </h4>
                      <div className="space-y-2">
                        {selectedQuestionSummary.optionBreakdown.map(
                          (option, index) => (
                            <div
                              key={option.optionId}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
                                  }}
                                />
                                <span className="text-sm text-gray-600">
                                  {option.optionText}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {option.percentage.toFixed(1)}%
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}