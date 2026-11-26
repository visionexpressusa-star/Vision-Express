import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase.js";

const AuthContext = createContext(null);

async function loadAccount(userId) {
  const [{ data: profile }, { data: permissions }] = await Promise.all([
    supabase.from("profiles").select("id, username, display_name, role, active").eq("id", userId).maybeSingle(),
    supabase.rpc("my_permissions"),
  ]);
  return { profile, permissions: permissions ?? [] };
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, session: null, profile: null, permissions: [] });

  const refresh = useCallback(async (session) => {
    if (!session) {
      setState({ loading: false, session: null, profile: null, permissions: [] });
      return;
    }
    const { profile, permissions } = await loadAccount(session.user.id);
    if (!profile || !profile.active) {
      await supabase.auth.signOut();
      setState({ loading: false, session: null, profile: null, permissions: [], inactive: true });
      return;
    }
    setState({ loading: false, session, profile, permissions });
  }, []);

  useEffect(() => {
    if (!supabase) {
      setState((current) => ({ ...current, loading: false }));
      return undefined;
    }
    supabase.auth.getSession().then(({ data }) => refresh(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // Defer so Supabase can finish its own work before we query.
        setTimeout(() => refresh(session), 0);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [refresh]);

  const hasPermission = useCallback(
    (name) => state.profile?.role === "ADMIN" || state.permissions.includes(name),
    [state.profile, state.permissions]
  );

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  return (
    <AuthContext.Provider value={{ ...state, hasPermission, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
