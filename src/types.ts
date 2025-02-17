export interface QuizQuestion {
  id: string;
  text: string;
  timeLimit: number;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  shareCode?: string;
}

export interface ParticipantAnswer {
  questionId: string;
  optionId: string;
  timeToAnswer: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  timeRemaining: number;
  answers: ParticipantAnswer[];
  status: 'waiting' | 'active' | 'completed';
}

export interface ParticipantResult {
  participantId: string;
  participantName: string;
  answers: ParticipantAnswer[];
  score: number;
  totalTime: number;
}

export interface QuestionSummary {
  questionId: string;
  questionText: string;
  totalResponses: number;
  correctResponses: number;
  averageTime: number;
  optionBreakdown: {
    optionId: string;
    optionText: string;
    count: number;
    percentage: number;
  }[];
}