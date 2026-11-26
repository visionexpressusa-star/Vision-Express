import { Fragment, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export function usePageTitle(title) {
  useEffect(() => {
    document.title = `${title} | Vision Express`;
  }, [title]);
}

export function Message({ type = "success", children }) {
  if (!children) return null;
  return <div className={`users-message ${type}`}>{children}</div>;
}

export function Loading() {
  return <p className="result-count">Loading…</p>;
}

export function AccessDenied() {
  usePageTitle("Access Denied");
  return (
    <section className="user-create-page">
      <div className="page-heading"><h1>Access denied</h1></div>
      <Message type="error">You do not have permission to view this page.</Message>
      <Link className="back-link" to="/">Back to dashboard</Link>
    </section>
  );
}

// Renders the page only when the user is ADMIN or holds one of the permissions.
// The database enforces the same rules with row level security.
export function RequirePermission({ anyOf, children }) {
  const { hasPermission } = useAuth();
  return anyOf.some(hasPermission) ? children : <AccessDenied />;
}

export function EmptyPage({ title }) {
  usePageTitle(title);
  return <section className="empty-page" aria-label={`${title} content`}></section>;
}

// Page numbers with ellipses, matching the old Thymeleaf pagination.
export function Pagination({ page, totalPages, onPage, label }) {
  if (totalPages <= 1) return null;
  const lastPage = totalPages - 1;
  const startPage = totalPages <= 7 || page <= 3 ? 0 : page >= lastPage - 3 ? lastPage - 4 : page - 1;
  const endPage = totalPages <= 7 || page >= lastPage - 3 ? lastPage : page <= 3 ? 4 : page + 1;
  const numbers = [];
  for (let number = startPage; number <= endPage; number += 1) numbers.push(number);

  const link = (target, text, extra = {}) => (
    <a
      href="#"
      className={"page-link" + (extra.className ?? "")}
      aria-disabled={extra.disabled || undefined}
      aria-current={extra.current ? "page" : undefined}
      onClick={(event) => {
        event.preventDefault();
        if (!extra.disabled) onPage(target);
      }}
    >
      {text}
    </a>
  );

  return (
    <nav className="page-navigation" aria-label={label}>
      {link(page - 1, "Previous", { disabled: page === 0, className: page === 0 ? " disabled" : "" })}
      {startPage > 0 && link(0, "1")}
      {startPage > 1 && <span className="page-ellipsis" aria-hidden="true">…</span>}
      {numbers.map((number) => (
        <Fragment key={number}>
          {link(number, number + 1, { current: number === page, className: number === page ? " current" : "" })}
        </Fragment>
      ))}
      {endPage < lastPage - 1 && <span className="page-ellipsis" aria-hidden="true">…</span>}
      {endPage < lastPage && link(lastPage, lastPage + 1)}
      {link(page + 1, "Next", { disabled: page >= lastPage, className: page >= lastPage ? " disabled" : "" })}
    </nav>
  );
}

export function ResultCount({ page, pageSize, shown, total, noun }) {
  if (total === 0) return <p className="result-count">0 {noun}</p>;
  return (
    <p className="result-count">
      Showing {page * pageSize + 1}-{page * pageSize + shown} of {total} {noun}
    </p>
  );
}
