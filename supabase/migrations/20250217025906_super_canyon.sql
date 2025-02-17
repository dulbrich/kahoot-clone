/*
  # Fix quiz access permissions

  1. Changes
    - Add policy to allow authenticated users to view published quizzes
    - Add policy to allow authenticated users to view questions and options of published quizzes
    - Update existing policies to be more permissive for quiz participation

  2. Security
    - Maintains RLS while allowing proper quiz participation
    - Ensures published quizzes are accessible to all authenticated users
*/

-- Update quiz access policies
CREATE POLICY "Authenticated users can view published quizzes"
  ON quizzes FOR SELECT TO authenticated
  USING (
    status = 'published'
    OR
    auth.uid() = user_id
  );

-- Update question access policies
CREATE POLICY "Authenticated users can view questions of published quizzes"
  ON questions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND (quizzes.status = 'published' OR quizzes.user_id = auth.uid())
    )
  );

-- Update option access policies
CREATE POLICY "Authenticated users can view options of published quizzes"
  ON options FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = question_id
      AND (quizzes.status = 'published' OR quizzes.user_id = auth.uid())
    )
  );