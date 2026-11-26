import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loading, Message, usePageTitle } from "../components/common.jsx";
import { useAuth } from "../lib/auth.jsx";
import { blankToNull, isPdValue, plainNumber, todayIso, VISUAL_ACUITIES } from "../lib/format.js";
import { supabase } from "../lib/supabase.js";

const EMPTY_FORM = {
  accountId: "",
  fullName: "",
  dateOfBirth: "",
  pdRight: "",
  pdLeft: "",
  retinalImagingRequired: false,
  doingEyeglasses: false,
  doingContactLens: false,
  hasInsurance: false,
  insuranceName: "",
  aided: false,
  vaRight: "",
  vaLeft: "",
  vaBoth: "",
  referralSourceId: "",
};

function fromRow(row) {
  return {
    accountId: String(row.account_id),
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth ?? "",
    pdRight: plainNumber(row.pd_right),
    pdLeft: plainNumber(row.pd_left),
    retinalImagingRequired: row.is_retinal_imaging_required,
    doingEyeglasses: row.is_doing_eyeglasses,
    doingContactLens: row.is_doing_contact_lens,
    hasInsurance: row.has_insurance,
    insuranceName: row.insurance_name ?? "",
    aided: row.is_aided,
    vaRight: row.va_right,
    vaLeft: row.va_left,
    vaBoth: row.va_both,
    referralSourceId: String(row.referral_source_id),
  };
}

// Returns the database row, or throws with the same messages the Java service used.
function validate(form) {
  if (!form.accountId.trim()) throw new Error("Account ID is required.");
  if (!/^\d+$/.test(form.accountId.trim())) throw new Error("Account ID must be a number.");
  if (!form.fullName.trim()) throw new Error("Patient name is required.");
  if (!form.dateOfBirth) throw new Error("Date of birth is required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth) || form.dateOfBirth < "1900-01-01" || form.dateOfBirth > todayIso()) {
    throw new Error("Date of birth must be a valid date and not in the future.");
  }
  for (const [value, name] of [[form.pdRight, "PD Right"], [form.pdLeft, "PD Left"]]) {
    if (!value.trim()) throw new Error(`${name} is required.`);
    if (!isPdValue(value)) throw new Error(`${name} must be a number in the format XX.X.`);
  }
  for (const [value, eye] of [[form.vaRight, "Right"], [form.vaLeft, "Left"], [form.vaBoth, "Both"]]) {
    if (!VISUAL_ACUITIES.includes(value)) throw new Error(`Visual acuity is required for ${eye}.`);
  }
  if (!form.referralSourceId) throw new Error("Referral source is required.");

  return {
    account_id: Number(form.accountId.trim()),
    full_name: form.fullName.trim(),
    date_of_birth: form.dateOfBirth,
    pd_right: Number(form.pdRight.trim()),
    pd_left: Number(form.pdLeft.trim()),
    is_retinal_imaging_required: form.retinalImagingRequired,
    is_doing_eyeglasses: form.doingEyeglasses,
    is_doing_contact_lens: form.doingContactLens,
    has_insurance: form.hasInsurance,
    insurance_name: blankToNull(form.insuranceName),
    is_aided: form.aided,
    va_right: form.vaRight,
    va_left: form.vaLeft,
    va_both: form.vaBoth,
    referral_source_id: Number(form.referralSourceId),
  };
}

export default function IntakeFormEdit() {
  const { id } = useParams();
  const editing = Boolean(id);
  usePageTitle(editing ? "Edit Intake Form" : "Create Intake Form");
  const { session } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [checklist, setChecklist] = useState([]);
  const [checked, setChecked] = useState(new Set());
  const [referralSources, setReferralSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [sources, items, existing] = await Promise.all([
        supabase.from("referral_sources").select("id, name").order("sort_number"),
        supabase.from("checklist_items").select("id, checklist_item").order("sort_number"),
        editing ? supabase.from("intake_forms").select("*").eq("id", id).maybeSingle() : Promise.resolve(null),
      ]);
      setReferralSources(sources.data ?? []);
      setChecklist(items.data ?? []);
      if (editing) {
        const row = existing.data;
        if (!row) setError("Intake form was not found.");
        else if (row.created_by_user_id !== session.user.id) setError("You can only edit intake forms you created.");
        else setForm(fromRow(row));
      }
      setLoading(false);
    }
    load();
  }, [editing, id, session.user.id]);

  const set = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  function toggleChecklist(itemId) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  const allChecked = checklist.length > 0 && checklist.every((item) => checked.has(item.id));

  async function submit(event) {
    event.preventDefault();
    setError("");
    let row;
    try {
      row = validate(form);
      if (!editing && !allChecked) throw new Error("All checklist items must be checked before saving.");
    } catch (validationError) {
      setError(validationError.message);
      window.scrollTo(0, 0);
      return;
    }
    setSaving(true);
    const { error: saveError } = editing
      ? await supabase.from("intake_forms").update(row).eq("id", id)
      : await supabase.from("intake_forms").insert(row);
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      window.scrollTo(0, 0);
      return;
    }
    navigate("/intake-form", {
      state: { flash: editing ? "Intake form updated successfully." : "Intake form created successfully." },
    });
  }

  if (loading) return <Loading />;
  const blocked = editing && !form.accountId;

  return (
    <section className="user-create-page" aria-labelledby="create-intake-form-heading">
      <div className="page-heading">
        <h1 id="create-intake-form-heading">{editing ? "Edit Intake Form" : "Create Intake Form"}</h1>
        <Link className="back-link" to="/intake-form">Back to intake forms</Link>
      </div>

      <Message type="error">{error}</Message>

      {!blocked && (
        <form className="intake-create-form" onSubmit={submit}>
          <div className="intake-field-row intake-identity-row">
            <div className="field-group">
              <label htmlFor="account-id">Account ID</label>
              <input id="account-id" className="form-control" type="text" required value={form.accountId} onChange={set("accountId")} />
            </div>
            <div className="field-group">
              <label htmlFor="patient-name">Patient Name</label>
              <input id="patient-name" className="form-control" type="text" required value={form.fullName} onChange={set("fullName")} />
            </div>
            <div className="field-group">
              <label htmlFor="date-of-birth">Date of Birth</label>
              <input id="date-of-birth" className="form-control" type="date" required
                min="1900-01-01" max={todayIso()} value={form.dateOfBirth} onChange={set("dateOfBirth")} />
            </div>
            <div className="field-group pd-field">
              <label htmlFor="pd-right">PD Right</label>
              <input id="pd-right" className="form-control" type="text" required value={form.pdRight} onChange={set("pdRight")} />
            </div>
            <div className="field-group pd-field">
              <label htmlFor="pd-left">PD Left</label>
              <input id="pd-left" className="form-control" type="text" required value={form.pdLeft} onChange={set("pdLeft")} />
            </div>
          </div>

          <div className="intake-checkbox-grid">
            <label className="intake-checkbox">
              <input type="checkbox" checked={form.retinalImagingRequired} onChange={set("retinalImagingRequired")} />
              <span>Required Retinal Imaging?</span>
            </label>
            <label className="intake-checkbox">
              <input type="checkbox" checked={form.doingEyeglasses} onChange={set("doingEyeglasses")} />
              <span>Required Eyeglasses?</span>
            </label>
            <label className="intake-checkbox">
              <input type="checkbox" checked={form.doingContactLens} onChange={set("doingContactLens")} />
              <span>Required Contact Lens?</span>
            </label>
          </div>

          <div className="insurance-row">
            <label className="intake-checkbox">
              <input type="checkbox" checked={form.hasInsurance} onChange={set("hasInsurance")} />
              <span>Has insurance?</span>
            </label>
            <div className="field-group insurance-name-field">
              <label className="visually-hidden" htmlFor="insurance-name">Insurance name</label>
              <input id="insurance-name" className="form-control" type="text" placeholder="Insurance name"
                value={form.insuranceName} onChange={set("insuranceName")} />
            </div>
          </div>

          <fieldset className="visual-acuity-fieldset">
            <legend>Visual Acuity</legend>
            <label className="intake-checkbox aided-checkbox">
              <input type="checkbox" checked={form.aided} onChange={set("aided")} />
              <span>Aided - is the patient wearing glasses or contacts?</span>
            </label>
            <div className="visual-acuity-table-wrapper">
              <table className="visual-acuity-table">
                <thead>
                  <tr>
                    <th scope="col">Eye</th>
                    {[8, 7, 6, 5, 4, 3, 2, 1].map((number) => <th scope="col" key={number}>{number}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[["vaRight", "Right (OD)"], ["vaLeft", "Left (OS)"], ["vaBoth", "Both (OU)"]].map(([field, label]) => (
                    <tr key={field}>
                      <th scope="row">{label}</th>
                      {VISUAL_ACUITIES.map((value) => (
                        <td className="visual-cell" key={value}>
                          <label>
                            <input type="radio" name={field} value={value} required
                              checked={form[field] === value} onChange={set(field)} />
                            <span>{value}</span>
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </fieldset>

          {!editing && (
            <fieldset className="intake-checklist">
              <legend>Checklist</legend>
              <div className="checklist-items">
                {checklist.map((item) => (
                  <div className="checklist-row" key={item.id}>
                    <label className="intake-checkbox">
                      <input type="checkbox" checked={checked.has(item.id)} onChange={() => toggleChecklist(item.id)} />
                      <span>{item.checklist_item}</span>
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          )}

          <div className="field-group intake-referral-source">
            <label htmlFor="referral-source">How did you hear about us?</label>
            <select id="referral-source" className="form-control" required value={form.referralSourceId} onChange={set("referralSourceId")}>
              <option value="">Select one</option>
              {referralSources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}
            </select>
          </div>

          <div className="form-actions">
            <Link className="cancel-button" to="/intake-form">Cancel</Link>
            {(editing || allChecked) && (
              <button className="toolbar-button create-button" type="submit" disabled={saving}>
                {editing ? "Save changes" : "Save"}
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
