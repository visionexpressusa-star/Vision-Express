import { formatDateOnly, plainNumber } from "../lib/format.js";

function Item({ label, value, empty, className = "" }) {
  return (
    <div className={`summary-item ${className} ${empty ? "summary-item-empty" : ""}`.trim()}>
      <span className="summary-label">{label}:</span> <span className="summary-value">{value}</span>
    </div>
  );
}

const yesNo = (value) => (value ? "Yes" : "No");

// Read-only intake details shown above the refraction form and on the view page.
export default function IntakeSummary({ intake, referralHeading = "Referral Source" }) {
  return (
    <div className="prescription-intake-summary" aria-label="Intake form details">
      <h2 className="intake-summary-heading">Intake form</h2>

      <div className="summary-row summary-identity-row">
        <Item label="Account ID" value={intake.account_id} />
        <Item label="Patient Name" value={intake.full_name} />
        <Item label="Date of Birth" value={formatDateOnly(intake.date_of_birth) || "-"} />
        <Item label="PD Right" value={plainNumber(intake.pd_right)} className="summary-item-pd" />
        <Item label="PD Left" value={plainNumber(intake.pd_left)} className="summary-item-pd" />
      </div>

      <div className="summary-row summary-three-row">
        <Item label="Retinal Imaging" value={yesNo(intake.is_retinal_imaging_required)} empty={!intake.is_retinal_imaging_required} />
        <Item label="Eyeglasses" value={yesNo(intake.is_doing_eyeglasses)} empty={!intake.is_doing_eyeglasses} />
        <Item label="Contact Lens" value={yesNo(intake.is_doing_contact_lens)} empty={!intake.is_doing_contact_lens} />
      </div>

      <div className="summary-row summary-insurance-row">
        <Item label="Has Insurance" value={yesNo(intake.has_insurance)} empty={!intake.has_insurance} />
        <Item label="Insurance Name" value={intake.insurance_name || "-"} empty={!intake.has_insurance} />
      </div>

      <div className="summary-row summary-acuity-row">
        <Item label="Aided" value={yesNo(intake.is_aided)} empty={!intake.is_aided} />
        <Item label="Right (OD)" value={intake.va_right} />
        <Item label="Left (OS)" value={intake.va_left} />
        <Item label="Both (OU)" value={intake.va_both} />
      </div>

      <div className="summary-section">
        <span className="summary-section-title">{referralHeading}</span>
        <p className="summary-referral-source">{intake.referral_sources?.name}</p>
      </div>
    </div>
  );
}
