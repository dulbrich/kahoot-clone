/*
  # Update answers table policies

  1. Changes
    - Update the answers table policies to allow authenticated users to create answers
    - Add policy for authenticated users to view their own answers

  2. Security
    - Enable RLS on answers table
    - Add policies for authenticated users
*/

-- Drop the existing policy that only allows anon access
DROP POLICY IF EXISTS "Participants can submit answers" ON answers;

-- Create new policy for authenticated users to create answers
CREATE POLICY "Users can submit answers"
  ON answers FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.id = participant_id
      AND participants.name = auth.email()
    )
  );

-- Add policy for users to view their own answers
CREATE POLICY "Users can view their own answers"
  ON answers FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.id = participant_id
      AND participants.name = auth.email()
    )
  );