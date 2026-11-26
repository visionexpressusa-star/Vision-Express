import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Message, Pagination, ResultCount, usePageTitle } from "../components/common.jsx";
import { useAuth } from "../lib/auth.jsx";
import { formatDate, safeSearch } from "../lib/format.js";
import { supabase } from "../lib/supabase.js";

const PAGE_SIZE = 10;

export default function IntakeFormList() {
  usePageTitle("Intake Forms");
  const { session, hasPermission } = useAuth();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const page = Math.max(0, Number(params.get("page")) || 0);
  const [searchInput, setSearchInput] = useState(search);
  const [result, setResult] = useState({ rows: [], total: 0, loading: true, error: "" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let query = supabase
        .from("intake_form_list")
        .select("*", { count: "exact" })
        .order("created_on", { ascending: false })
        .order("id", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      const term = safeSearch(search);
      if (term) {
        query = query.or(`account_id_text.ilike.*${term}*,full_name.ilike.*${term}*`);
      }
      const { data, count, error } = await query;
      if (!cancelled) {
        setResult({ rows: data ?? [], total: count ?? 0, loading: false, error: error?.message ?? "" });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [search, page]);

  function submitSearch(event) {
    event.preventDefault();
    setParams(searchInput.trim() ? { search: searchInput.trim() } : {});
  }

  const canPrescribe = hasPermission("provide_prescription");
  const totalPages = Math.ceil(result.total / PAGE_SIZE);

  return (
    <section className="users-page" aria-labelledby="intake-form-heading">
      <h1 id="intake-form-heading">Intake Forms</h1>
      <Message>{location.state?.flash}</Message>
      <Message type="error">{result.error}</Message>

      <div className="users-toolbar">
        <form className="user-search" onSubmit={submitSearch} role="search">
          <label className="visually-hidden" htmlFor="intake-form-search">Search intake forms</label>
          <input id="intake-form-search" className="form-control" type="search" value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by account ID or patient name" />
          <button className="toolbar-button search-button" type="submit">Search</button>
        </form>
        <Link className="toolbar-button create-button" to="/intake-form/create">+ Create</Link>
      </div>

      <div className="users-table-wrapper">
        <table className="users-table intake-list-table">
          <thead>
            <tr>
              <th scope="col">Account ID</th>
              <th scope="col">Patient Name</th>
              <th scope="col">Created By</th>
              <th scope="col" className="created-on-column">Created On</th>
              <th scope="col">Refraction By</th>
              <th scope="col" className="actions-heading">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.id}>
                <td>{row.account_id}</td>
                <td>{row.full_name}</td>
                <td>{row.created_by}</td>
                <td className="created-on-column">{formatDate(row.created_on)}</td>
                <td>{row.prescribed_by}</td>
                <td className="row-actions">
                  <Link className="table-action edit" to={`/intake-form/${row.id}/view`}>View</Link>
                  {row.created_by_user_id && row.created_by_user_id === session.user.id && (
                    <Link className="table-action edit" to={`/intake-form/${row.id}/edit`}>Edit</Link>
                  )}
                  {canPrescribe && (
                    <Link className="table-action prescription" to={`/intake-form/${row.id}/prescription/create`}>Refraction</Link>
                  )}
                </td>
              </tr>
            ))}
            {!result.loading && result.rows.length === 0 && (
              <tr><td className="empty-results" colSpan={6}>No intake forms found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-bar intake-pagination">
        <ResultCount page={page} pageSize={PAGE_SIZE} shown={result.rows.length} total={result.total} noun="intake forms" />
        <Pagination page={page} totalPages={totalPages} label="Intake form results pages"
          onPage={(target) => setParams({ ...(search ? { search } : {}), page: String(target) })} />
      </div>
    </section>
  );
}
