import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Message, usePageTitle } from "../components/common.jsx";
import { supabase } from "../lib/supabase.js";

const CHART_COLORS = ["#ee3925", "#5ba356", "#ffbf20", "#276fbf", "#8f5aa8", "#24a6a6", "#d56b1f"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = MONTHS_LONG.map((name) => name.slice(0, 3));
const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const monthValue = (year, month) => `${year}-${String(month).padStart(2, "0")}`;
const monthLabel = (year, month) => `${MONTHS_LONG[month - 1]}, ${year}`;

function chartBackground(items, total) {
  if (total === 0) return "#edf3ea";
  let start = 0;
  const segments = [];
  for (const item of items) {
    if (item.count === 0) continue;
    const end = start + (item.count * 100) / total;
    segments.push(`${item.color} ${start}% ${end}%`);
    start = end;
  }
  return `conic-gradient(${segments.join(", ")})`;
}

export default function ReferralSource() {
  usePageTitle("Referral Source");
  const [params, setParams] = useSearchParams();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = monthValue(currentYear, now.getMonth() + 1);

  const period = params.get("period") === "yearly" ? "yearly" : "monthly";
  const [sources, setSources] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([{ year: currentYear, month: now.getMonth() + 1 }]);
  const [counts, setCounts] = useState([]);
  const [error, setError] = useState("");

  const availableYears = useMemo(
    () => [...new Set(availableMonths.map((entry) => entry.year))].sort((a, b) => b - a),
    [availableMonths]
  );
  const requestedMonth = params.get("month") ?? currentMonth;
  const selectedMonth = availableMonths.some((entry) => monthValue(entry.year, entry.month) === requestedMonth)
    ? requestedMonth
    : currentMonth;
  const requestedYear = Number(params.get("year")) || currentYear;
  const selectedYear = availableYears.includes(requestedYear) ? requestedYear : currentYear;

  useEffect(() => {
    Promise.all([
      supabase.from("referral_sources").select("id, name").order("sort_number"),
      supabase.rpc("referral_months", { time_zone: TIME_ZONE }),
    ]).then(([sourceResult, monthResult]) => {
      setSources(sourceResult.data ?? []);
      const merged = new Map([[currentMonth, { year: currentYear, month: now.getMonth() + 1 }]]);
      for (const row of monthResult.data ?? []) merged.set(monthValue(row.year, row.month), row);
      setAvailableMonths([...merged.values()].sort((a, b) => b.year - a.year || b.month - a.month));
      setError(sourceResult.error?.message || monthResult.error?.message || "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let start;
    let end;
    if (period === "monthly") {
      const [year, month] = selectedMonth.split("-").map(Number);
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 1);
    } else {
      start = new Date(selectedYear, 0, 1);
      end = new Date(selectedYear + 1, 0, 1);
    }
    supabase
      .rpc("referral_counts", { period_start: start.toISOString(), period_end: end.toISOString(), time_zone: TIME_ZONE })
      .then(({ data, error: countError }) => {
        setCounts(data ?? []);
        if (countError) setError(countError.message);
      });
  }, [period, selectedMonth, selectedYear]);

  const itemsFor = (rows) =>
    sources.map((source, index) => ({
      name: source.name,
      color: CHART_COLORS[index % CHART_COLORS.length],
      count: rows.filter((row) => row.referral_source_id === source.id).reduce((sum, row) => sum + Number(row.total), 0),
    }));

  const items = itemsFor(counts);
  const total = items.reduce((sum, item) => sum + item.count, 0);

  const yearMonths = [];
  for (let month = 1; month <= 12; month += 1) {
    const rows = counts.filter((row) => row.month === month);
    if (rows.length === 0) continue;
    const monthItems = itemsFor(rows);
    const monthTotal = monthItems.reduce((sum, item) => sum + item.count, 0);
    yearMonths.push({
      label: MONTHS_SHORT[month - 1],
      total: monthTotal,
      tooltip: [`${monthLabel(selectedYear, month)}: ${monthTotal} total`, ...monthItems.map((item) => `${item.name}: ${item.count}`)].join("\n"),
    });
  }
  const maxMonthTotal = Math.max(0, ...yearMonths.map((month) => month.total));

  function update(next) {
    const merged = { period, month: selectedMonth, year: String(selectedYear), ...next };
    setParams(merged.period === "yearly" ? { period: "yearly", year: merged.year } : { period: "monthly", month: merged.month });
  }

  return (
    <section className="referral-report-page" aria-labelledby="referral-report-heading">
      <div className="referral-report-heading">
        <h1 id="referral-report-heading">Referral Source</h1>
        <form className="referral-report-filter" onSubmit={(event) => event.preventDefault()}>
          <div className="referral-period-options" role="radiogroup" aria-label="Report period">
            {["monthly", "yearly"].map((option) => (
              <label key={option}>
                <input type="radio" name="period" value={option} checked={period === option}
                  onChange={() => update({ period: option })} />
                <span>{option === "monthly" ? "Monthly" : "Yearly"}</span>
              </label>
            ))}
          </div>
          {period === "monthly" ? (
            <div className="referral-filter-field">
              <label htmlFor="report-month">Month</label>
              <select id="report-month" className="form-control" value={selectedMonth} onChange={(event) => update({ month: event.target.value })}>
                {availableMonths.map((entry) => (
                  <option key={monthValue(entry.year, entry.month)} value={monthValue(entry.year, entry.month)}>
                    {monthLabel(entry.year, entry.month)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="referral-filter-field">
              <label htmlFor="report-year">Year</label>
              <select id="report-year" className="form-control" value={selectedYear} onChange={(event) => update({ year: event.target.value })}>
                {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
          )}
        </form>
      </div>

      <Message type="error">{error}</Message>

      {period === "monthly" ? (
        <div className="referral-report-grid">
          <section className="referral-report-panel" aria-labelledby="referral-counts-heading">
            <div className="referral-panel-heading">
              <h2 id="referral-counts-heading">Referral Sources</h2>
              <span className="referral-total">{total} total</span>
            </div>
            <ul className="referral-source-list">
              {items.map((item) => (
                <li key={item.name}>
                  <span className="referral-source-name">
                    <span className="referral-color-swatch" style={{ backgroundColor: item.color }} aria-hidden="true"></span>
                    <span>{item.name}</span>
                  </span>
                  <strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="referral-report-panel referral-chart-panel" aria-labelledby="referral-chart-heading">
            <div className="referral-panel-heading">
              <h2 id="referral-chart-heading">Referral Distribution</h2>
            </div>
            <div className="referral-chart-area">
              <div className="referral-pie-chart" style={{ background: chartBackground(items, total) }} role="img"
                aria-label={`Referral source distribution with ${total} total referrals`}>
                <div className="referral-chart-center">
                  <strong>{total}</strong>
                  <span>Referrals</span>
                </div>
              </div>
              {total === 0 && <p className="referral-empty-chart">No referrals recorded for this month.</p>}
            </div>
          </section>
        </div>
      ) : (
        <section className="referral-report-panel referral-yearly-panel" aria-labelledby="referral-yearly-heading">
          <div className="referral-panel-heading">
            <h2 id="referral-yearly-heading">Monthly Intake Forms - {selectedYear}</h2>
            <span className="referral-total">{total} total</span>
          </div>
          {total > 0 ? (
            <div className="referral-yearly-chart">
              {yearMonths.map((month) => (
                <div className="referral-yearly-bar" key={month.label} title={month.tooltip} aria-label={month.tooltip} role="img">
                  <div className="referral-yearly-bar-track">
                    <div className="referral-yearly-bar-fill"
                      style={{ height: `${maxMonthTotal === 0 ? 0 : Math.max(8, Math.round((month.total * 100) / maxMonthTotal))}%` }}>
                      <span>{month.total}</span>
                    </div>
                  </div>
                  <span className="referral-yearly-month">{month.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="referral-empty-chart">No referrals recorded for this year.</p>
          )}
        </section>
      )}
    </section>
  );
}
