import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Message, Pagination, ResultCount, usePageTitle } from "../components/common.jsx";
import { safeSearch } from "../lib/format.js";
import { callAdminUsers, supabase } from "../lib/supabase.js";
import { useToast } from "../components/Toast.jsx";

const PAGE_SIZE = 10;

export default function Users() {
  usePageTitle("Users");
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const page = Math.max(0, Number(params.get("page")) || 0);
  const [searchInput, setSearchInput] = useState(search);
  const [result, setResult] = useState({ rows: [], total: 0, loading: true });
  const toast = useToast();
  const [message, setMessage] = useState({ type: "error", text: "" });

  const load = useCallback(async () => {
    let query = supabase
      .from("profiles")
      .select("id, username, display_name, role, active", { count: "exact" })
      .order("created_at")
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    const term = safeSearch(search);
    if (term) query = query.or(`username.ilike.*${term}*,display_name.ilike.*${term}*`);
    const { data, count, error } = await query;
    if (error) setMessage({ type: "error", text: error.message });
    setResult({ rows: data ?? [], total: count ?? 0, loading: false });
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(user) {
    try {
      await callAdminUsers({ action: "setActive", userId: user.id, active: !user.active });
      toast(user.active ? `${user.display_name} deactivated.` : `${user.display_name} activated.`);
      setMessage({ type: "error", text: "" });
      load();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  function submitSearch(event) {
    event.preventDefault();
    setParams(searchInput.trim() ? { search: searchInput.trim() } : {});
  }

  return (
    <section className="users-page" aria-labelledby="users-heading">
      <h1 id="users-heading">Users</h1>
      <Message type={message.type}>{message.text}</Message>

      <div className="users-toolbar">
        <form className="user-search" onSubmit={submitSearch} role="search">
          <label className="visually-hidden" htmlFor="user-search">Search users</label>
          <input id="user-search" className="form-control" type="search" value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by username or display name" />
          <button className="toolbar-button search-button" type="submit">Search</button>
        </form>
        <Link className="toolbar-button create-button" to="/users/create">+ Create</Link>
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th scope="col">Username</th>
              <th scope="col">Display Name</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col" className="actions-heading">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.display_name}</td>
                <td>{user.role}</td>
                <td>{user.active ? "Active" : "Inactive"}</td>
                <td className="row-actions">
                  <Link className="table-action edit" to={`/users/${user.id}/edit`}>Edit</Link>
                  {user.role !== "ADMIN" && (
                    <button className={`table-action status ${user.active ? "deactivate" : "activate"}`} type="button"
                      onClick={() => toggleActive(user)}>
                      {user.active ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!result.loading && result.rows.length === 0 && (
              <tr><td className="empty-results" colSpan={5}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-bar">
        <ResultCount page={page} pageSize={PAGE_SIZE} shown={result.rows.length} total={result.total} noun="users" />
        <Pagination page={page} totalPages={Math.ceil(result.total / PAGE_SIZE)} label="User results pages"
          onPage={(target) => setParams({ ...(search ? { search } : {}), page: String(target) })} />
      </div>
    </section>
  );
}
