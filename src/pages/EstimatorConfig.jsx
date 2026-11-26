import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loading, Message, usePageTitle } from "../components/common.jsx";
import { loadEstimatorConfig } from "../lib/config.js";
import { supabase } from "../lib/supabase.js";

const MONEY_FIELDS = [
  ["eye_exam_price", "Eye exam price", "Eye exam price cannot be negative."],
  ["exam_discount_with_complete_glasses", "Exam discount with complete glasses", "Exam discount cannot be negative."],
  ["outside_prescription_discount", "Outside prescription discount", "Outside prescription discount cannot be negative."],
  ["lens_discount_without_insurance", "Lens discount without insurance", "Lens discount cannot be negative."],
  ["pof_charge", "POF charge", "POF charge cannot be negative."],
];

// Editable name/price lists: [config key, legend, column title, price key, item noun].
const PRICE_LISTS = [
  ["lens_protection_coatings", "Lens Protection Coatings", "Coating", "price", "Coating"],
  ["lens_transition_options", "Transition / Tint / Polorized Options", "Transition", "price", "Transition"],
  ["lens_prices", "Lens Price List", "Lens type", "price", "Lens"],
];

const asText = (value) => (value === null || value === undefined ? "" : String(value));
const toNumber = (text) => (String(text).trim() === "" ? null : Number(text));

function toForm(config) {
  const form = {};
  for (const [key] of MONEY_FIELDS) form[key] = asText(config[key]);
  form.frame_discount_options = config.frame_discount_options.map(asText);
  form.lens_option_charges = config.lens_option_charges.map((item) => ({ name: item.name, charge: asText(item.charge) }));
  for (const [key] of PRICE_LISTS) form[key] = config[key].map((item) => ({ name: item.name, price: asText(item.price) }));
  return form;
}

// Returns { errors, row }. Mirrors OpticalStoreConfigController.validate and the service's filtering.
function validate(form) {
  const errors = {};
  const negative = (key, text, message) => {
    if (toNumber(text) !== null && (Number.isNaN(toNumber(text)) || toNumber(text) < 0)) errors[key] = message;
  };
  for (const [key, , message] of MONEY_FIELDS) negative(key, form[key], message);
  form.frame_discount_options.forEach((percent, index) => {
    const key = `frame_discount_options.${index}`;
    negative(key, percent, "Frame discount cannot be negative.");
    if (toNumber(percent) > 100) errors[key] = "Frame discount cannot be more than 100%.";
  });
  form.lens_option_charges.forEach((item, index) =>
    negative(`lens_option_charges.${index}`, item.charge, `${item.name} charge cannot be negative.`));
  for (const [key, , , , noun] of PRICE_LISTS) {
    form[key].forEach((item, index) => {
      const hasName = item.name.trim() !== "";
      const hasPrice = item.price.trim() !== "";
      if (!hasName && !hasPrice) return;
      if (!hasName) errors[`${key}.${index}.name`] = `${noun === "Lens" ? "Lens type" : noun} name is required.`;
      if (!hasPrice) errors[`${key}.${index}.price`] = `${noun} price is required.`;
      negative(`${key}.${index}.price`, item.price, `${noun} price cannot be negative.`);
    });
  }

  const money = (text) => toNumber(text) ?? 0;
  const row = {};
  for (const [key] of MONEY_FIELDS) row[key] = money(form[key]);
  row.frame_discount_options = form.frame_discount_options.filter((text) => text.trim() !== "").map(Number);
  row.lens_option_charges = form.lens_option_charges
    .filter((item) => item.name.trim())
    .map((item) => ({ name: item.name.trim(), charge: money(item.charge) }));
  for (const [key] of PRICE_LISTS) {
    row[key] = form[key].filter((item) => item.name.trim()).map((item) => ({ name: item.name.trim(), price: money(item.price) }));
  }
  row.updated_at = new Date().toISOString();
  return { errors, row };
}

export default function EstimatorConfig() {
  usePageTitle("Estimator Configuration");
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEstimatorConfig()
      .then((config) => setForm(toForm(config)))
      .catch((error) => setMessage({ type: "error", text: error.message }));
  }, []);

  if (!form) return message.text ? <Message type="error">{message.text}</Message> : <Loading />;

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setListItem = (key, index, patch) =>
    setForm((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => (itemIndex === index ? (typeof item === "object" ? { ...item, ...patch } : patch) : item)),
    }));

  async function submit(event) {
    event.preventDefault();
    const { errors: found, row } = validate(form);
    setErrors(found);
    window.scrollTo(0, 0);
    if (Object.keys(found).length > 0) {
      setMessage({ type: "error", text: "Please fix the highlighted configuration values." });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.from("optical_store_config").update(row).eq("id", 1).select().single();
    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setForm(toForm(data));
    setMessage({ type: "success", text: "Configuration saved successfully." });
  }

  return (
    <section className="user-create-page optical-page" aria-labelledby="optical-config-heading">
      <div className="page-heading">
        <h1 id="optical-config-heading">Estimator Configuration</h1>
        <Link className="back-link" to="/optical-store/estimate">Open estimator</Link>
      </div>

      <Message type={message.type}>{message.text}</Message>

      <form className="optical-config-form" onSubmit={submit}>
        <div className="optical-config-grid">
          {MONEY_FIELDS.map(([key, label]) => (
            <div className="field-group" key={key}>
              <label htmlFor={key}>{label}</label>
              <input id={key} className="form-control" type="number" step="0.01" min="0"
                value={form[key]} onChange={(event) => setField(key, event.target.value)} />
              <div className="field-error">{errors[key]}</div>
            </div>
          ))}
        </div>

        <fieldset className="optical-fieldset">
          <legend>Frame Discount Options</legend>
          <div className="optical-discount-list">
            {form.frame_discount_options.map((percent, index) => (
              <div className="field-group optical-inline-field" key={index}>
                <label htmlFor={`frame-discount-${index}`}>Discount %</label>
                <input id={`frame-discount-${index}`} className="form-control" type="number" step="0.01" min="0" max="100"
                  value={percent} onChange={(event) => setListItem("frame_discount_options", index, event.target.value)} />
                <div className="field-error">{errors[`frame_discount_options.${index}`]}</div>
              </div>
            ))}
          </div>
          <button className="table-action edit optical-add-row" type="button"
            onClick={() => setField("frame_discount_options", [...form.frame_discount_options, ""])}>Add discount option</button>
        </fieldset>

        <fieldset className="optical-fieldset">
          <legend>Lens Option Charges</legend>
          <div className="users-table-wrapper">
            <table className="users-table optical-table">
              <thead><tr><th scope="col">Option</th><th scope="col">Charge</th></tr></thead>
              <tbody>
                {form.lens_option_charges.map((item, index) => (
                  <tr key={item.name}>
                    <td><span>{item.name}</span></td>
                    <td>
                      <input className="form-control" type="number" step="0.01" min="0" value={item.charge}
                        onChange={(event) => setListItem("lens_option_charges", index, { charge: event.target.value })} />
                      <div className="field-error">{errors[`lens_option_charges.${index}`]}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>

        {PRICE_LISTS.map(([key, legend, column, , noun]) => (
          <fieldset className="optical-fieldset" key={key}>
            <legend>{legend}</legend>
            <div className="users-table-wrapper">
              <table className="users-table optical-table">
                <thead><tr><th scope="col">{column}</th><th scope="col">Price</th></tr></thead>
                <tbody>
                  {form[key].map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input className="form-control" type="text" value={item.name}
                          onChange={(event) => setListItem(key, index, { name: event.target.value })} />
                        <div className="field-error">{errors[`${key}.${index}.name`]}</div>
                      </td>
                      <td>
                        <input className="form-control" type="number" step="0.01" min="0" value={item.price}
                          onChange={(event) => setListItem(key, index, { price: event.target.value })} />
                        <div className="field-error">{errors[`${key}.${index}.price`]}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="table-action edit optical-add-row" type="button"
              onClick={() => setField(key, [...form[key], { name: "", price: "" }])}>
              Add {noun.toLowerCase()} row
            </button>
          </fieldset>
        ))}

        <div className="form-actions">
          <button className="toolbar-button create-button" type="submit" disabled={saving}>Save configuration</button>
        </div>
      </form>
    </section>
  );
}
