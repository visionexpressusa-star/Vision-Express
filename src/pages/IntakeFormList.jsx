import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ageFrom, Message, Pagination, RefractionBadge, ResultCount, usePageTitle } from "../components/common.jsx";
import { useToast } from "../components/Toast.jsx";
import { useAuth } from "../lib/auth.jsx";
import { formatDate, formatDateOnly, safeSearch } from "../lib/format.js";
import { supabase } from "../lib/supabase.js";

const PAGE_SIZE = 10;
const EXPORT_LIMIT = 5000;

const FILTERS = [
  ["all", "All"],
  ["today", "Today"],
  ["week", "This week"],
  ["waiting", "Waiting for refraction"],
];

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfWeek() {
  const today = startOfToday();
  const mondayOffset = (today.getDay() + 6) % 7;
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset);
}

// Applies the search box and filter chip to an intake_form_list query.
function applyFilters(query, search, filter) {
  const term = safeSearch(search);
  if (term) query = query.or(`account_id_text.ilike.*${term}*,full_name.ilike.*${term}*`);
  if (filter === "today") query = query.gte("created_on", startOfToday().toISOString());
  if (filter === "week") query = query.gte("created_on", startOfWeek().toISOString());
  if (filter === "waiting") query = query.eq("has_refraction", false);
  return query;
}

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  // Quote everything; neutralise spreadsheet formulas.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export default function IntakeFormList() {
  usePageTitle("Intake Forms");
  const { session, hasPermission } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const filter = FILTERS.some(([key]) => key === params.get("filter")) ? params.get("filter") : "all";
  const page = Math.max(0, Number(params.get("page")) || 0);
  const [searchInput, setSearchInput] = useState(search);
  const [result, setResult] = useState({ rows: [], total: 0, loading: true, error: "" });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setResult((current) => ({ ...current, loading: true }));
    applyFilters(supabase.from("intake_form_list").select("*", { count: "exact" }), search, filter)
      .order("created_on", { ascending: false })
      .order("id", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
      .then(({ data, count, error }) => {
        if (!cancelled) setResult({ rows: data ?? [], total: count ?? 0, loading: false, error: error?.message ?? "" });
      });
    return () => {
      cancelled = true;
    };
  }, [search, filter, page]);

  function update(next) {
    const merged = { search, filter, ...next };
    const query = {};
    if (merged.search) query.search = merged.search;
    if (merged.filter && merged.filter !== "all") query.filter = merged.filter;
    if (next.page) query.page = String(next.page);
    setParams(query);
  }

  async function exportCsv() {
    setExporting(true);
    const { data, error } = await applyFilters(supabase.from("intake_form_list").select("*"), search, filter)
      .order("created_on", { ascending: false })
      .limit(EXPORT_LIMIT);
    setExporting(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    const header = ["Account ID", "Patient Name", "Date of Birth", "Age", "Created On", "Created By",
      "Referral Source", "Insurance", "Refraction", "Refraction By", "Refraction On"];
    const lines = (data ?? []).map((row) => [
      row.account_id, row.full_name, formatDateOnly(row.date_of_birth), ageFrom(row.date_of_birth) ?? "",
      formatDate(row.created_on), row.created_by, row.referral_source,
      row.has_insurance ? row.insurance_name || "Yes" : "No",
      row.has_refraction ? "Done" : "Waiting", row.prescribed_by, formatDate(row.prescribed_on),
    ]);
    const csv = [header, ...lines].map((line) => line.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `intake-forms-${filter}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${lines.length} intake form${lines.length === 1 ? "" : "s"}.`);
  }

  const canPrescribe = hasPermission("provide_prescription");
  const totalPages = Math.ceil(result.total / PAGE_SIZE);

  return (
    <section className="users-page" aria-labelledby="intake-form-heading">
      <div className="page-heading">
        <div>
          <h1 id="intake-form-heading">Intake Forms</h1>
          <p className="page-subtitle">Find a patient, check refraction status, or start a new form.</p>
        </div>
        <div className="toolbar-group">
          <button className="toolbar-button secondary-button" type="button" onClick={exportCsv}
            disabled={exporting || result.total === 0}>
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
          <Link className="toolbar-button create-button" to="/intake-form/create">+ New intake form</Link>
        </div>
      </div>

      <Message type="error">{result.error}</Message>

      <div className="users-toolbar">
        <form className="user-search" role="search"
          onSubmit={(event) => {
            event.preventDefault();
            update({ search: searchInput.trim() });
          }}>
          <label className="visually-hidden" htmlFor="intake-form-search">Search intake forms</label>
          <input id="intake-form-search" className="form-control" type="search" value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by account ID or patient name" />
          <button className="toolbar-button search-button" type="submit">Search</button>
        </form>
      </div>

      <div className="filter-chips" role="group" aria-label="Filter intake forms">
        {FILTERS.map(([key, label]) => (
          <button key={key} type="button" className={`chip ${filter === key ? "active" : ""}`}
            aria-pressed={filter === key} onClick={() => update({ filter: key })}>
            {label}
            {filter === key && !result.loading && <span className="chip-count">{result.total}</span>}
          </button>
        ))}
      </div>

      <div className="users-table-wrapper">
        <table className="users-table intake-list-table">
          <thead>
            <tr>
              <th scope="col">Account ID</th>
              <th scope="col">Patient</th>
              <th scope="col" className="created-on-column">Created</th>
              <th scope="col">Refraction</th>
              <th scope="col" className="actions-heading">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => {
              const age = ageFrom(row.date_of_birth);
              return (
                <tr key={row.id}>
                  <td>{row.account_id}</td>
                  <td className="patient-cell">
                    <strong>{row.full_name}</strong>
                    <span>
                      {row.date_of_birth ? `${formatDateOnly(row.date_of_birth)} · ${age} yrs` : "No date of birth"}
                    </span>
                  </td>
                  <td className="created-on-column">
                    {formatDate(row.created_on)}
                    <div className="muted small">{row.created_by}</div>
                  </td>
                  <td><RefractionBadge done={row.has_refraction} by={row.prescribed_by} /></td>
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
              );
            })}
            {!result.loading && result.rows.length === 0 && (
              <tr>
                <td className="empty-results" colSpan={5}>
                  {filter === "waiting" ? "Nobody is waiting for a refraction." : "No intake forms found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-bar intake-pagination">
        <ResultCount page={page} pageSize={PAGE_SIZE} shown={result.rows.length} total={result.total} noun="intake forms" />
        <Pagination page={page} totalPages={totalPages} label="Intake form results pages"
          onPage={(target) => update({ page: target })} />
      </div>
    </section>
  );
}
