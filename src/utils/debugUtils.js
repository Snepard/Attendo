// Save this as src/utils/debugUtils.js

import { supabase } from './supabaseClient';

// Utility to check the current auth status and profile
export const checkAuthStatus = async () => {
  try {
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return { success: false, error: sessionError.message };
    }
    
    if (!session) {
      return { success: false, message: 'No active session' };
    }
    
    // Get user data
    const user = session.user;
    console.log('Current user:', user);
    
    // Check user metadata
    console.log('User metadata:', user.user_metadata);
    
    // Fetch profile from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return { 
        success: false, 
        error: profileError.message,
        user,
        sessionValid: true
      };
    }
    
    console.log('Profile data:', profileData);
    
    // Return all relevant info
    return {
      success: true,
      user,
      profile: profileData,
      role: profileData?.role,
      isStudent: profileData?.role === 'student',
      isTeacher: profileData?.role === 'teacher'
    };
  } catch (error) {
    console.error('Auth status check failed:', error);
    return { success: false, error: error.message };
  }
};

// Utility to inspect database schema
export const checkDatabaseSchema = async () => {
  try {
    // List all tables that the current user has access to
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables');
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return { success: false, error: tablesError.message };
    }
    
    return { success: true, tables };
  } catch (error) {
    console.error('Schema check failed:', error);
    return { success: false, error: error.message };
  }
};

// Function to check if a specific profile exists and what its role is
export const checkProfileByEmail = async (email) => {
  try {
    // First get the user ID from auth
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('Error finding user by email:', userError);
      return { success: false, error: userError.message };
    }
    
    if (!userData) {
      return { success: false, message: 'No user found with this email' };
    }
    
    // Now fetch the profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { 
        success: false, 
        error: profileError.message,
        userId: userData.id
      };
    }
    
    return {
      success: true,
      userId: userData.id,
      profile: profileData,
      role: profileData?.role
    };
  } catch (error) {
    console.error('Profile check failed:', error);
    return { success: false, error: error.message };
  }
};