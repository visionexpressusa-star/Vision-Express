import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import IntakeSummary from "../components/IntakeSummary.jsx";
import PrescriptionFields from "../components/PrescriptionFields.jsx";
import { Loading, Message, usePageTitle } from "../components/common.jsx";
import { useToast } from "../components/Toast.jsx";
import { useAuth } from "../lib/auth.jsx";
import { prescriptionFormFromRow, prescriptionRowFromForm, single } from "../lib/prescription.js";
import { supabase } from "../lib/supabase.js";

export default function Prescription() {
  usePageTitle("Refraction");
  const { id } = useParams();
  const { profile } = useAuth();
  const [intake, setIntake] = useState(null);
  const [form, setForm] = useState(null);
  const [meta, setMeta] = useState({ by: "", on: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error: loadError } = await supabase
        .from("intake_forms")
        .select("*, referral_sources(name), prescriptions(*)")
        .eq("id", id)
        .maybeSingle();
      if (loadError || !data) {
        setError(loadError?.message ?? "Intake form was not found.");
      } else {
        const prescription = single(data.prescriptions);
        setIntake(data);
        setForm(prescriptionFormFromRow(prescription));
        setMeta({ by: prescription?.prescribed_by || profile.display_name, on: prescription?.prescribed_on ?? new Date() });
      }
      setLoading(false);
    }
    load();
  }, [id, profile.display_name]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    let row;
    try {
      row = prescriptionRowFromForm(form);
    } catch (validationError) {
      setError(validationError.message);
      window.scrollTo(0, 0);
      return;
    }
    setSaving(true);
    const { data, error: saveError } = await supabase
      .from("prescriptions")
      .upsert({ ...row, intake_form_id: Number(id) }, { onConflict: "intake_form_id" })
      .select("prescribed_by, prescribed_on")
      .single();
    setSaving(false);
    window.scrollTo(0, 0);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setMeta({ by: data.prescribed_by, on: data.prescribed_on });
    toast(`Refraction saved for ${intake.full_name}.`);
  }

  if (loading) return <Loading />;

  return (
    <section className="user-create-page" aria-labelledby="prescription-heading">
      <div className="page-heading">
        <h1 id="prescription-heading">Refraction</h1>
        <Link className="back-link" to="/intake-form">Back to intake forms</Link>
      </div>

      <Message type="error">{error}</Message>

      {intake && (
        <>
          <IntakeSummary intake={intake} />
          <form className="manifest-form" onSubmit={submit}>
            <PrescriptionFields form={form} prescribedBy={meta.by} prescribedOn={meta.on}
              onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))} />
            <div className="form-actions manifest-actions">
              <button className="toolbar-button create-button" type="submit" tabIndex={41} disabled={saving}>Save</button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
