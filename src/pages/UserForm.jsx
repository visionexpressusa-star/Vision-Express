import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loading, Message, usePageTitle } from "../components/common.jsx";
import { useToast } from "../components/Toast.jsx";
import { callAdminUsers, supabase } from "../lib/supabase.js";

// Create a user (/users/create) or edit one (/users/:id/edit).
export default function UserForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  usePageTitle(editing ? "Edit User" : "Create User");
  const navigate = useNavigate();
  const toast = useToast();
  const [permissions, setPermissions] = useState([]);
  const [form, setForm] = useState({ displayName: "", username: "", password: "", permissionIds: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      // "users" can only be granted by an admin in the database, never from this page.
      const { data: available } = await supabase
        .from("permissions")
        .select("id, name, description")
        .neq("name", "users")
        .order("name");
      setPermissions(available ?? []);
      if (editing) {
        const { data: user } = await supabase
          .from("profiles")
          .select("username, display_name, user_permissions(permission_id)")
          .eq("id", id)
          .maybeSingle();
        if (!user) {
          setError("User was not found.");
        } else {
          const availableIds = new Set((available ?? []).map((permission) => permission.id));
          setForm({
            displayName: user.display_name,
            username: user.username,
            password: "",
            permissionIds: user.user_permissions.map((row) => row.permission_id).filter((pid) => availableIds.has(pid)),
          });
        }
      }
      setLoading(false);
    }
    load();
  }, [editing, id]);

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const togglePermission = (permissionId) =>
    setForm((current) => ({
      ...current,
      permissionIds: current.permissionIds.includes(permissionId)
        ? current.permissionIds.filter((existing) => existing !== permissionId)
        : [...current.permissionIds, permissionId],
    }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (editing ? !form.displayName.trim() : !form.displayName.trim() || !form.username.trim() || !form.password) {
      setError(editing ? "Display name is required." : "Display name, username, and password are required.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await callAdminUsers({ action: "update", userId: id, displayName: form.displayName, permissionIds: form.permissionIds });
      } else {
        await callAdminUsers({
          action: "create",
          displayName: form.displayName,
          username: form.username,
          password: form.password,
          permissionIds: form.permissionIds,
        });
      }
      toast(editing ? "User updated." : "User created.");
      navigate("/users");
    } catch (saveError) {
      setError(saveError.message);
      setForm((current) => ({ ...current, password: "" }));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <section className="user-create-page" aria-labelledby="user-form-heading">
      <div className="page-heading">
        <h1 id="user-form-heading">{editing ? "Edit User" : "Create User"}</h1>
        <Link className="back-link" to="/users">Back to users</Link>
      </div>

      <Message type="error">{error}</Message>

      <form className="create-user-form" onSubmit={submit}>
        <div className="field-group">
          <label htmlFor="display-name">Display Name</label>
          <input id="display-name" className="form-control" type="text" autoComplete="name" required
            value={form.displayName} onChange={set("displayName")} />
        </div>
        <div className="field-group">
          <label htmlFor="username">Username</label>
          <input id="username" className={"form-control" + (editing ? " readonly-field" : "")} type="text"
            autoComplete="username" required readOnly={editing} value={form.username} onChange={set("username")} />
        </div>
        {!editing && (
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" className="form-control" type="password" autoComplete="new-password" required minLength={6}
              value={form.password} onChange={set("password")} />
          </div>
        )}

        <fieldset className="permission-fieldset">
          <legend>Permissions</legend>
          <p>{editing ? "Select the permissions this user can access." : "Select the permissions the new user can access."}</p>
          <div className="permission-options">
            {permissions.map((permission) => (
              <label className="permission-option" key={permission.id}>
                <input type="checkbox" checked={form.permissionIds.includes(permission.id)}
                  onChange={() => togglePermission(permission.id)} />
                <span>
                  <strong>{permission.name}</strong>
                  <small>{permission.description}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {!editing && <p className="default-role-note">New users are assigned the NON_ADMIN role.</p>}

        <div className="form-actions">
          <Link className="cancel-button" to="/users">Cancel</Link>
          <button className="toolbar-button create-button" type="submit" disabled={saving}>
            {editing ? "Save User" : "Create User"}
          </button>
        </div>
      </form>
    </section>
  );
}
