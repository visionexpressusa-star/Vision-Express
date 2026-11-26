import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loading, Message, usePageTitle } from "../components/common.jsx";
import { useAuth } from "../lib/auth.jsx";
import { loadEstimatorConfig } from "../lib/config.js";
import { calculateEstimate } from "../lib/estimate.js";
import { formatMoney } from "../lib/format.js";

const INITIAL = {
  insurance: "false",
  insuranceDiscount: "",
  eyeExam: false,
  outsideRx: false,
  frame: false,
  pof: false,
  lenses: false,
  sunglasses: false,
  framePrice: "",
  frameDiscountPercent: "0",
  lensType: "",
  lensOption: "",
  coating: "",
  transition: "",
};

// Checking one of these clears its partner, as on the original page.
const EXCLUSIVE = { eyeExam: "outsideRx", outsideRx: "eyeExam", frame: "pof", pof: "frame" };

function priced(name, amount) {
  return `${name} - ${formatMoney(Number(amount))}`;
}

export default function PriceEstimator() {
  usePageTitle("Price Estimator");
  const { hasPermission } = useAuth();
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(INITIAL);

  useEffect(() => {
    loadEstimatorConfig().then(setConfig).catch((loadError) => setError(loadError.message));
  }, []);

  const set = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (value === true && EXCLUSIVE[field]) next[EXCLUSIVE[field]] = false;
      return next;
    });
  };

  if (error) return <Message type="error">{error}</Message>;
  if (!config) return <Loading />;

  const fieldErrors = {};
  if (Number(form.insuranceDiscount) < 0) fieldErrors.insuranceDiscount = "Insurance discount cannot be negative.";
  if (Number(form.framePrice) < 0) fieldErrors.framePrice = "Frame price cannot be negative.";

  const completeGlasses = form.lenses && (form.frame || form.pof);
  const estimate = calculateEstimate(form, config);
  const rowCount = estimate ? Math.max(estimate.chargeLines.length, estimate.discountLines.length) : 0;

  return (
    <section className="user-create-page optical-page" aria-labelledby="optical-estimate-heading">
      <div className="page-heading">
        <h1 id="optical-estimate-heading">Price Estimator</h1>
        {hasPermission("optical_store_config") && (
          <Link className="back-link" to="/optical-store/config">Estimator configuration</Link>
        )}
      </div>

      {Object.keys(fieldErrors).length > 0 && <Message type="error">Please fix the highlighted estimate values.</Message>}

      <div className="optical-estimate-layout">
        <form className="intake-create-form optical-estimate-form" onSubmit={(event) => event.preventDefault()}>
          <fieldset className="optical-fieldset">
            <legend>Do you have insurance?</legend>
            <div className="optical-choice-row">
              <label className="intake-checkbox">
                <input type="radio" name="insurance" value="true" checked={form.insurance === "true"} onChange={set("insurance")} />
                <span>Yes</span>
              </label>
              <label className="intake-checkbox">
                <input type="radio" name="insurance" value="false" checked={form.insurance === "false"} onChange={set("insurance")} />
                <span>No</span>
              </label>
            </div>
            {form.insurance === "true" && (
              <div className="field-group optical-insurance-discount">
                <label htmlFor="insurance-discount">Insurance discount</label>
                <input id="insurance-discount" className="form-control" type="number" step="0.01" min="0"
                  value={form.insuranceDiscount} onChange={set("insuranceDiscount")} />
                <div className="field-error">{fieldErrors.insuranceDiscount}</div>
              </div>
            )}
          </fieldset>

          <fieldset className="optical-fieldset">
            <legend>What is the customer buying?</legend>
            <div className="intake-checkbox-grid optical-purchase-grid">
              <div className="optical-purchase-row">
                <label className="intake-checkbox">
                  <input type="checkbox" checked={form.eyeExam} onChange={set("eyeExam")} />
                  <span>Eye exam</span>
                </label>
                <label className="intake-checkbox">
                  <input type="checkbox" checked={form.outsideRx} onChange={set("outsideRx")} />
                  <span>Outside Rx</span>
                </label>
              </div>
              <div className="optical-purchase-row">
                <label className="intake-checkbox">
                  <input type="checkbox" checked={form.frame} onChange={set("frame")} />
                  <span>Frame</span>
                </label>
                <label className="intake-checkbox">
                  <input type="checkbox" checked={form.pof} onChange={set("pof")} />
                  <span>POF</span>
                </label>
              </div>
              <div className="optical-purchase-row optical-purchase-row-single">
                <label className="intake-checkbox">
                  <input type="checkbox" checked={form.lenses} onChange={set("lenses")} />
                  <span>Lenses</span>
                </label>
              </div>
            </div>

            <div className="optical-dependent-grid">
              {form.frame && (
                <>
                  <div className="field-group">
                    <label htmlFor="frame-price">Frame price</label>
                    <input id="frame-price" className="form-control" type="number" step="0.01" min="0"
                      value={form.framePrice} onChange={set("framePrice")} />
                    <div className="field-error">{fieldErrors.framePrice}</div>
                  </div>
                  <div className="field-group">
                    <label htmlFor="frame-discount">Frame discount</label>
                    <div className="optical-frame-discount-row">
                      <select id="frame-discount" className="form-control" value={form.frameDiscountPercent} onChange={set("frameDiscountPercent")}>
                        <option value="0">0%</option>
                        {config.frame_discount_options.map((percent) => (
                          <option key={percent} value={percent}>{percent}%</option>
                        ))}
                      </select>
                      <label className="intake-checkbox">
                        <input type="checkbox" checked={form.sunglasses} onChange={set("sunglasses")} />
                        <span>Sunglasses</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
              {form.lenses && (
                <div className="field-group optical-wide-field">
                  <label htmlFor="lens-type">Lens type</label>
                  <select id="lens-type" className="form-control" value={form.lensType} onChange={set("lensType")}>
                    <option value="">Select lens type</option>
                    {config.lens_prices.map((lens) => <option key={lens.name} value={lens.name}>{priced(lens.name, lens.price)}</option>)}
                  </select>
                </div>
              )}
              {completeGlasses && (
                <div className="field-group">
                  <label htmlFor="lens-option">Lens option</label>
                  <select id="lens-option" className="form-control" value={form.lensOption} onChange={set("lensOption")}>
                    <option value="">Select lens option</option>
                    {config.lens_option_charges.map((option) => <option key={option.name} value={option.name}>{priced(option.name, option.charge)}</option>)}
                  </select>
                </div>
              )}
              {form.lenses && (
                <>
                  <div className="field-group">
                    <label htmlFor="lens-protection-coating">Lens protection coating</label>
                    <select id="lens-protection-coating" className="form-control" value={form.coating} onChange={set("coating")}>
                      <option value="">None</option>
                      {config.lens_protection_coatings.map((coating) => <option key={coating.name} value={coating.name}>{priced(coating.name, coating.price)}</option>)}
                    </select>
                  </div>
                  <div className="field-group optical-wide-field">
                    <label htmlFor="lens-transition-option">Transition / Tint / Polorized</label>
                    <select id="lens-transition-option" className="form-control" value={form.transition} onChange={set("transition")}>
                      <option value="">None</option>
                      {config.lens_transition_options.map((option) => <option key={option.name} value={option.name}>{priced(option.name, option.price)}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
          </fieldset>
        </form>

        <aside className="optical-summary" aria-labelledby="estimate-summary-heading">
          <h2 id="estimate-summary-heading">Estimate Summary</h2>
          {estimate ? (
            <div className="users-table-wrapper">
              <table className="users-table optical-summary-table">
                <tbody>
                  {Array.from({ length: rowCount }, (_, index) => {
                    const charge = estimate.chargeLines[index];
                    const discount = estimate.discountLines[index];
                    return (
                      <tr key={index}>
                        <th scope="row" className="optical-summary-label optical-summary-charge-label">{charge?.label ?? ""}</th>
                        <td className="optical-summary-amount optical-summary-charge-amount">{charge ? formatMoney(charge.amount) : ""}</td>
                        <th scope="row" className="optical-summary-label optical-summary-discount-label">{discount?.label ?? ""}</th>
                        <td className="optical-summary-amount optical-summary-discount-amount">{discount ? formatMoney(discount.amount) : ""}</td>
                      </tr>
                    );
                  })}
                  <tr className="optical-subtotal-row">
                    <th scope="row" className="optical-summary-label optical-summary-charge-label">Subtotal</th>
                    <td className="optical-summary-amount optical-summary-charge-amount">{formatMoney(estimate.subtotal)}</td>
                    <th scope="row" className="optical-summary-label optical-summary-discount-label">Total discount</th>
                    <td className="optical-summary-amount optical-summary-discount-amount">{formatMoney(-estimate.totalDiscount)}</td>
                  </tr>
                  <tr className="optical-total-row">
                    <th scope="row" colSpan={3}>Total</th>
                    <td>{formatMoney(estimate.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-results optical-empty-summary">No estimate calculated.</div>
          )}
        </aside>
      </div>
    </section>
  );
}
