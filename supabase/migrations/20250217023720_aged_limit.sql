/*
  # Update participants table policies

  1. Changes
    - Update the participants table policies to allow authenticated users to create participants
    - Add policy for authenticated users to view their own participation records

  2. Security
    - Enable RLS on participants table
    - Add policies for authenticated users
*/

-- Drop the existing policy that only allows anon access
DROP POLICY IF EXISTS "Anyone can create participants" ON participants;

-- Create new policy for authenticated users to create participants
CREATE POLICY "Users can create participants"
  ON participants FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND quizzes.status = 'published'
    )
  );

-- Add policy for users to view their own participation records
CREATE POLICY "Users can view their own participation records"
  ON participants FOR SELECT TO authenticated
  USING (
    name = auth.email()
  );