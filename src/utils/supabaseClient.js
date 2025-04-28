import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// Auth functions
export const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

// Attendance functions
export const getStudentAttendance = async (studentId) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const markAttendance = async (attendanceData) => {
  const { data, error } = await supabase
    .from('attendance')
    .insert([attendanceData]);
  return { data, error };
};

export const createAttendanceCode = async (teacherId, courseId, validityMinutes = 5) => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + validityMinutes);
  
  const { data, error } = await supabase
    .from('attendance_codes')
    .insert([{
      teacher_id: teacherId,
      course_id: courseId,
      expires_at: expiresAt,
    }])
    .select();
  return { data, error };
};

export const validateAttendanceCode = async (code) => {
  const now = new Date();
  
  const { data, error } = await supabase
    .from('attendance_codes')
    .select('*')
    .eq('code', code)
    .gt('expires_at', now.toISOString())
    .single();
  
  return { data, error };
};

export const getTeacherCourses = async (teacherId) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('teacher_id', teacherId);
  return { data, error };
};

export const getStudentsByCourse = async (courseId) => {
  const { data, error } = await supabase
    .from('course_students')
    .select(`
      *,
      profiles:student_id(*)
    `)
    .eq('course_id', courseId);
  return { data, error };
};

export const getStudentAttendanceByCourse = async (courseId) => {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      *,
      profiles:student_id(*)
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });
  return { data, error };
};