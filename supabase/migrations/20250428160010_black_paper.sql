/*
  # Create courses and related tables

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text)
      - `description` (text)
      - `teacher_id` (uuid, references profiles)
      - `schedule` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `course_students`
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `student_id` (uuid, references profiles)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for teachers to manage their courses
    - Add policies for students to view their enrolled courses
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  description text,
  teacher_id uuid NOT NULL REFERENCES profiles(id),
  schedule text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create course_students table (junction table)
CREATE TABLE IF NOT EXISTS course_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  -- Each student can only be enrolled once per course
  UNIQUE(course_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_students ENABLE ROW LEVEL SECURITY;

-- Course policies
CREATE POLICY "Teachers can manage their own courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view available courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (role = 'student');

-- Course students policies
CREATE POLICY "Teachers can manage students in their courses"
  ON course_students
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_students.course_id
    AND courses.teacher_id = auth.uid()
  ));

CREATE POLICY "Students can view their course enrollments"
  ON course_students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Create a trigger to update the updated_at column for courses
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courses_updated_at_trigger
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_courses_updated_at();