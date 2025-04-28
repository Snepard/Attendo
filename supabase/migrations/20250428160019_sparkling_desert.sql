/*
  # Create attendance related tables

  1. New Tables
    - `attendance_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique code for attendance)
      - `teacher_id` (uuid, references profiles)
      - `course_id` (uuid, references courses)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)
    
    - `attendance`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references profiles)
      - `course_id` (uuid, references courses)
      - `code` (text, the attendance code used)
      - `session_id` (uuid, references attendance_codes)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for teachers to manage attendance for their courses
    - Add policies for students to mark and view their attendance
*/

-- Create attendance_codes table
CREATE TABLE IF NOT EXISTS attendance_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  teacher_id uuid NOT NULL REFERENCES profiles(id),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  code text NOT NULL,
  session_id uuid REFERENCES attendance_codes(id),
  created_at timestamptz DEFAULT now(),
  -- Each student can only mark attendance once per code
  UNIQUE(student_id, code)
);

-- Enable Row Level Security
ALTER TABLE attendance_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Attendance codes policies
CREATE POLICY "Teachers can manage attendance codes for their courses"
  ON attendance_codes
  FOR ALL
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view valid attendance codes"
  ON attendance_codes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT student_id FROM course_students
      WHERE course_students.course_id = attendance_codes.course_id
    )
    AND expires_at > now()
  );

-- Attendance policies
CREATE POLICY "Teachers can view attendance for their courses"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = attendance.course_id
    AND courses.teacher_id = auth.uid()
  ));

CREATE POLICY "Students can mark their own attendance"
  ON attendance
  FOR INSERT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can view their own attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);