import { useState } from "react";
import { Message, usePageTitle } from "../components/common.jsx";
import { useAuth } from "../lib/auth.jsx";
import { emailForUsername, supabase } from "../lib/supabase.js";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function ChangePassword() {
  usePageTitle("Change Password");
  const { profile } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    const fail = (text) => {
      setForm(EMPTY);
      setMessage({ type: "error", text });
    };
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) return fail("All password fields are required.");
    if (form.newPassword !== form.confirmPassword) return fail("New password and confirm password must match.");

    setSaving(true);
    // Supabase does not check the old password on update, so confirm it by signing in again.
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: emailForUsername(profile.username),
      password: form.currentPassword,
    });
    if (verifyError) {
      setSaving(false);
      return fail("Current password is incorrect.");
    }
    const { error } = await supabase.auth.updateUser({ password: form.newPassword });
    setSaving(false);
    if (error) return fail(error.message);
    setForm(EMPTY);
    setMessage({ type: "success", text: "Password updated successfully." });
  }

  return (
    <section className="user-create-page" aria-labelledby="change-password-heading">
      <div className="page-heading">
        <h1 id="change-password-heading">Change Password</h1>
      </div>

      <Message type={message.type}>{message.text}</Message>

      <form className="create-user-form" onSubmit={submit}>
        <div className="field-group">
          <label htmlFor="current-password">Current Password</label>
          <input id="current-password" className="form-control" type="password" autoComplete="current-password" required
            value={form.currentPassword} onChange={set("currentPassword")} />
        </div>
        <div className="field-group">
          <label htmlFor="new-password">New Password</label>
          <input id="new-password" className="form-control" type="password" autoComplete="new-password" required
            value={form.newPassword} onChange={set("newPassword")} />
        </div>
        <div className="field-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input id="confirm-password" className="form-control" type="password" autoComplete="new-password" required
            value={form.confirmPassword} onChange={set("confirmPassword")} />
        </div>
        <div className="form-actions">
          <button className="toolbar-button create-button" type="submit" disabled={saving}>Change Password</button>
        </div>
      </form>
    </section>
  );
}
