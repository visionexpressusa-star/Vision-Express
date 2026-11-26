import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usePageTitle } from "../components/common.jsx";
import { useAuth } from "../lib/auth.jsx";
import { emailForUsername, supabase } from "../lib/supabase.js";

export default function Login() {
  usePageTitle("Login");
  const { session, loading, inactive } = useAuth();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.body.classList.add("login-body");
    return () => document.body.classList.remove("login-body");
  }, []);

  if (!loading && session) {
    return <Navigate to={location.state?.from?.pathname ?? "/"} replace />;
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailForUsername(username),
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError("Invalid username or password.");
      setPassword("");
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-heading">
        <img className="login-logo" src="/images/ve-logo.png" alt="Vision Express" />
        <h1 id="login-heading">Sign in</h1>
        <p className="login-subheading">Log in to access the internal portal.</p>

        {error && <div className="login-message error">{error}</div>}
        {!error && inactive && <div className="login-message error">This account is not active.</div>}

        <form className="login-form" onSubmit={submit}>
          <div>
            <label htmlFor="username">Username</label>
            <input id="username" className="form-control" type="text" autoComplete="username" required autoFocus
              value={username} onChange={(event) => setUsername(event.target.value)} />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" className="form-control" type="password" autoComplete="current-password" required
              value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <button className="login-button" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
