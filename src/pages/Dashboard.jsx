import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { firstName, greeting } from "../components/Layout.jsx";
import { ageFrom, Loading, Message, RefractionBadge, usePageTitle } from "../components/common.jsx";
import { useAuth } from "../lib/auth.jsx";
import { formatDate } from "../lib/format.js";
import { supabase } from "../lib/supabase.js";

const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StatCard({ label, value, note, to, accent }) {
  const body = (
    <>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value ?? "–"}</span>
      {note && <span className="stat-note">{note}</span>}
    </>
  );
  const className = `stat-card ${accent ? `accent-${accent}` : ""}`;
  return to ? <Link className={className} to={to}>{body}</Link> : <div className={className}>{body}</div>;
}

export default function Dashboard() {
  usePageTitle("Dashboard");
  const { profile, hasPermission } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");
  const canIntake = hasPermission("intake_form");
  const canPrescribe = hasPermission("provide_prescription");
  const canInventory = hasPermission("inventory_check");

  useEffect(() => {
    supabase.rpc("dashboard_stats", { time_zone: TIME_ZONE }).then(({ data, error: statsError }) => {
      if (statsError) setError(statsError.message);
      setStats(data ?? {});
    });
    if (canIntake || canPrescribe) {
      supabase
        .from("intake_form_list")
        .select("id, account_id, full_name, date_of_birth, created_on, has_refraction, prescribed_by")
        .order("created_on", { ascending: false })
        .limit(6)
        .then(({ data }) => setRecent(data ?? []));
    }
  }, [canIntake, canPrescribe]);

  const days = stats?.daily_intake ?? [];
  const maxDay = Math.max(1, ...days.map((day) => day.count));
  const top = stats?.top_referral_month;

  return (
    <section className="dashboard" aria-label="Dashboard">
      <div className="dashboard-hero">
        <div>
          <h1>{greeting()}, {firstName(profile?.display_name)}</h1>
          <p>Here's how the store is doing today.</p>
        </div>
        <div className="hero-actions">
          {canIntake && <Link className="primary" to="/intake-form/create">+ New intake form</Link>}
          <Link to="/optical-store/estimate">Price estimate</Link>
          {canInventory && <Link to="/inventory-tracking">Inventory</Link>}
        </div>
      </div>

      <Message type="error">{error}</Message>
      {!stats ? (
        <Loading />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Intake forms today" value={stats.intake_today} accent="green"
              note={`${stats.intake_week ?? 0} this week · ${stats.intake_month ?? 0} this month`}
              to={canIntake ? "/intake-form?filter=today" : undefined} />
            <StatCard label="Waiting for refraction" value={stats.waiting_refraction}
              accent={stats.waiting_refraction > 0 ? "yellow" : undefined} note="Intake done, no refraction yet"
              to={canIntake ? "/intake-form?filter=waiting" : undefined} />
            <StatCard label="Refractions today" value={stats.refractions_today} />
            <StatCard label="Top referral this month" value={top ? top.count : 0}
              note={top ? top.name : "No intake forms yet this month"} to="/referral-source" />
            {canInventory && (
              <StatCard label="Low-stock items" value={stats.low_stock}
                accent={stats.low_stock > 0 ? "red" : "green"}
                note={`${stats.inventory_units ?? 0} units in stock`} to="/inventory-tracking?low=1" />
            )}
          </div>

          <div className="dashboard-grid">
            <div className="panel">
              <div className="panel-heading">
                <h2>Intake forms – last 14 days</h2>
                <Link to="/referral-source">Referral report →</Link>
              </div>
              <div className="mini-bars" role="img"
                aria-label={`Intake forms per day for the last 14 days: ${days.map((day) => day.count).join(", ")}`}>
                {days.map((day, index) => {
                  const date = new Date(`${day.day}T12:00:00`);
                  return (
                    <div key={day.day} className={`mini-bar ${index === days.length - 1 ? "today" : ""}`}
                      title={`${formatDate(date)}: ${day.count}`}>
                      <span className="mini-bar-count">{day.count || ""}</span>
                      <div className="mini-bar-fill" style={{ height: `${(day.count / maxDay) * 100}%` }}></div>
                      <span className="mini-bar-label">{WEEKDAYS[date.getDay()].slice(0, 2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {(canIntake || canPrescribe) && (
              <div className="panel">
                <div className="panel-heading">
                  <h2>Recent patients</h2>
                  {canIntake && <Link to="/intake-form">View all →</Link>}
                </div>
                {recent.length === 0 ? (
                  <p className="empty-note">No intake forms yet.</p>
                ) : (
                  <ul className="recent-list">
                    {recent.map((row) => {
                      const age = ageFrom(row.date_of_birth);
                      return (
                        <li key={row.id}>
                          <div>
                            <Link to={canIntake ? `/intake-form/${row.id}/view` : `/intake-form/${row.id}/prescription/create`}>
                              {row.full_name}
                            </Link>
                            <div className="muted small">
                              #{row.account_id}{age !== null ? ` · ${age} yrs` : ""} · {formatDate(row.created_on)}
                            </div>
                          </div>
                          <RefractionBadge done={row.has_refraction} />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
