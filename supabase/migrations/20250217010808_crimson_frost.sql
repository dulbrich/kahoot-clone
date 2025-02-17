/*
  # Initial Schema Setup for Quiz Platform

  1. New Tables
    - `quizzes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `status` (text)
      - `share_code` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, foreign key)

    - `questions`
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, foreign key)
      - `text` (text)
      - `time_limit` (integer)
      - `order` (integer)

    - `options`
      - `id` (uuid, primary key)
      - `question_id` (uuid, foreign key)
      - `text` (text)
      - `is_correct` (boolean)
      - `order` (integer)

    - `participants`
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, foreign key)
      - `name` (text)
      - `created_at` (timestamp)

    - `answers`
      - `id` (uuid, primary key)
      - `participant_id` (uuid, foreign key)
      - `question_id` (uuid, foreign key)
      - `option_id` (uuid, foreign key)
      - `time_to_answer` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their quizzes
    - Add policies for participants to submit answers
*/

-- Create tables
CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('draft', 'published')),
  share_code text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  text text NOT NULL,
  time_limit integer NOT NULL DEFAULT 30,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  option_id uuid REFERENCES options(id) ON DELETE CASCADE,
  time_to_answer integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Policies for quizzes
CREATE POLICY "Users can create quizzes"
  ON quizzes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own quizzes"
  ON quizzes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published quizzes"
  ON quizzes FOR SELECT TO anon
  USING (status = 'published');

CREATE POLICY "Users can update their own quizzes"
  ON quizzes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quizzes"
  ON quizzes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Policies for questions
CREATE POLICY "Questions inherit quiz access"
  ON questions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view questions of published quizzes"
  ON questions FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND quizzes.status = 'published'
    )
  );

-- Policies for options
CREATE POLICY "Options inherit question access"
  ON options FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = question_id
      AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view options of published quizzes"
  ON options FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = question_id
      AND quizzes.status = 'published'
    )
  );

-- Policies for participants
CREATE POLICY "Anyone can create participants"
  ON participants FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND quizzes.status = 'published'
    )
  );

CREATE POLICY "Quiz creators can view their quiz participants"
  ON participants FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

-- Policies for answers
CREATE POLICY "Participants can submit answers"
  ON answers FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants
      JOIN quizzes ON quizzes.id = participants.quiz_id
      WHERE participants.id = participant_id
      AND quizzes.status = 'published'
    )
  );

CREATE POLICY "Quiz creators can view answers"
  ON answers FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      JOIN quizzes ON quizzes.id = participants.quiz_id
      WHERE participants.id = participant_id
      AND quizzes.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quizzes_share_code ON quizzes(share_code);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_options_question_id ON options(question_id);
CREATE INDEX idx_participants_quiz_id ON participants(quiz_id);
CREATE INDEX idx_answers_participant_id ON answers(participant_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);