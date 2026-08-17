import { createContext, useContext, useEffect, useMemo, useState } from "react";
import supabase from "../lib/supabaseClient";

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const activateSession = async (nextSession) => {
      if (!nextSession) {
        if (mounted) {
          setSession(null);
          setLoading(false);
        }
        return;
      }

      const { error } = await supabase.rpc("ensure_my_profile");
      if (error) console.error("Could not prepare user profile:", error);
      if (mounted) {
        setSession(error ? null : nextSession);
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) activateSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Defer Supabase calls until the auth callback has released its internal lock.
      setTimeout(() => activateSession(nextSession), 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: () =>
        supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo:
              typeof window === "undefined"
                ? undefined
                : `${window.location.origin}/auth/callback`,
          },
        }),
      signOut: () => supabase.auth.signOut(),
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
