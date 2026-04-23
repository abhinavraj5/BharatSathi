import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setUser(session?.user ?? null);

      if (session?.user) {
        await loadProfile(session.user.id);
      }

      setLoading(false);
    };

    getSession();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Profile error:", error);
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);