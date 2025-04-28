/*
  # Create attendance table

  1. New Tables
    - `attendance`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references profiles)
      - `course_id` (text)
      - `code` (text)
      - `session_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `attendance` table
    - Add policies for:
      - Students can read their own attendance records
      - Teachers can read all attendance records
      - Students can create attendance records for themselves
*/

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  code text NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating the updated_at column
CREATE TRIGGER update_attendance_updated_at_trigger
  BEFORE UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Policies
-- Students can read their own attendance records
CREATE POLICY "Students can view their own attendance records"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'student'
    )
  );

-- Teachers can read all attendance records
CREATE POLICY "Teachers can view all attendance records"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'teacher'
    )
  );

-- Students can create attendance records
CREATE POLICY "Students can create their own attendance records"
  ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'student'
    )
  );