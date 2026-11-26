import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import IntakeSummary from "../components/IntakeSummary.jsx";
import PrescriptionFields from "../components/PrescriptionFields.jsx";
import { Loading, Message, usePageTitle } from "../components/common.jsx";
import { prescriptionFormFromRow, single } from "../lib/prescription.js";
import { supabase } from "../lib/supabase.js";

export default function IntakeFormView() {
  usePageTitle("View Intake Form");
  const { id } = useParams();
  const [intake, setIntake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    supabase
      .from("intake_forms")
      .select("*, referral_sources(name), prescriptions(*)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error: loadError }) => {
        if (loadError || !data) setError(loadError?.message ?? "Intake form was not found.");
        else setIntake(data);
        setLoading(false);
      });
  }, [id]);

  async function downloadPdf() {
    setGenerating(true);
    try {
      // Loaded on demand so the PDF library is not in the main bundle.
      const { generateIntakeFormPdf } = await import("../lib/pdf.js");
      await generateIntakeFormPdf(intake, single(intake.prescriptions));
    } catch (pdfError) {
      setError(`Unable to generate intake form PDF. ${pdfError.message}`);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <Loading />;
  const prescription = intake ? single(intake.prescriptions) : null;

  return (
    <section className="user-create-page" aria-labelledby="view-intake-form-heading">
      <div className="page-heading">
        <h1 id="view-intake-form-heading">View Intake Form</h1>
        <div className="view-page-actions">
          {intake && (
            <button className="toolbar-button create-button" type="button" onClick={downloadPdf} disabled={generating}>
              {generating ? "Generating…" : "Generate PDF"}
            </button>
          )}
          <Link className="back-link" to="/intake-form">Back to intake forms</Link>
        </div>
      </div>

      <Message type="error">{error}</Message>

      {intake && (
        <>
          <IntakeSummary intake={intake} referralHeading="How did you hear from us?" />
          <div className="manifest-form readonly-prescription-form">
            <PrescriptionFields form={prescriptionFormFromRow(prescription)} readOnly
              prescribedBy={prescription?.prescribed_by} prescribedOn={prescription?.prescribed_on} />
          </div>
        </>
      )}
    </section>
  );
}
