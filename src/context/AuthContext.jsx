import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Initialize role flags with false explicitly
  const [isStudent, setIsStudent] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

  // Update role flags when profile changes
  useEffect(() => {
    if (profile) {
      console.log('Setting role flags based on profile:', profile);
      setIsStudent(profile.role === 'student');
      setIsTeacher(profile.role === 'teacher');
    } else {
      console.log('Resetting role flags - no profile');
      setIsStudent(false);
      setIsTeacher(false);
    }
  }, [profile]);

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Session found:', session);
          setUser(session.user);
          
          // Fetch profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Profile fetch error:', profileError);
            throw profileError;
          }
          
          console.log('Profile data fetched:', profileData);
          setProfile(profileData);
          console.log('User role from profile:', profileData?.role);
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
        
        if (session) {
          setUser(session.user);
          
          // Fetch profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching profile on auth state change:', profileError);
          } else {
            console.log('Profile fetched on auth state change:', profileData);
            setProfile(profileData);
            console.log('User role from profile on auth state change:', profileData?.role);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email, password, userProfile) => {
    try {
      console.log('Signing up with role:', userProfile.role);
      
      // Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userProfile.role,
            first_name: userProfile.first_name,
            last_name: userProfile.last_name,
          }
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        throw signUpError;
      }

      console.log('User created:', data);

      // Create profile record
      const profileData = {
        id: data.user.id,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        role: userProfile.role,
        roll_number: userProfile.roll_number,
        department: userProfile.department,
      };
      
      console.log('Creating profile with data:', profileData);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      console.log('Signing in with email:', email);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      console.log('Sign in successful:', data);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile during sign in:', profileError);
        throw profileError;
      }

      console.log('Profile data retrieved during sign in:', profileData);
      console.log('Role from profile:', profileData?.role);
      
      setProfile(profileData);
      return { session: data.session, profile: profileData };
    } catch (error) {
      console.error('Sign in process failed:', error);
      setError(error.message);
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      if (!user) throw new Error('No user logged in');

      console.log('Updating profile with data:', profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      console.log('Profile updated successfully:', data);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Profile update failed:', error);
      setError(error.message);
      throw error;
    }
  };

  // Debug log current role status
  console.log('Current role status - isStudent:', isStudent, 'isTeacher:', isTeacher);

  const value = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    updateProfile,
    isStudent,
    isTeacher,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}