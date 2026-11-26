// Intake form PDF, generated in the browser. Mirrors IntakeFormPdfService.java.
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate, plainNumber } from "./format.js";
import { prescriptionFormFromRow } from "./prescription.js";

const NAVY = [25, 48, 34];
const MUTED = [94, 108, 99];
const LIGHT_GREEN = [237, 243, 234];
const HEADER_GREEN = [225, 239, 221];
const BORDER = [190, 211, 188];
const MARGIN = 42;

const value = (input) => {
  if (input === null || input === undefined) return "-";
  const text = String(input);
  return text.trim() === "" ? "-" : text;
};
const yesNo = (flag) => (flag ? "Yes" : "No");

async function loadLogo() {
  const response = await fetch("/images/ve-logo.png");
  const blob = await response.blob();
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
  const size = await new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.src = dataUrl;
  });
  return { dataUrl, ...size };
}

const baseStyles = {
  font: "helvetica",
  fontSize: 8,
  textColor: NAVY,
  lineColor: BORDER,
  lineWidth: 0.5,
  cellPadding: 4,
};

function sectionTitle(doc, title, y) {
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "plain",
    body: [[title]],
    styles: { ...baseStyles, fontSize: 10, fontStyle: "bold", halign: "center", fillColor: HEADER_GREEN },
  });
  return doc.lastAutoTable.finalY;
}

function grid(doc, y, head, body, columnStyles = {}) {
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "grid",
    head: [head],
    body,
    styles: { ...baseStyles, halign: "center", valign: "middle" },
    headStyles: { fillColor: HEADER_GREEN, textColor: MUTED, fontStyle: "bold" },
    columnStyles,
  });
  return doc.lastAutoTable.finalY;
}

export async function generateIntakeFormPdf(intake, prescription) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const form = prescriptionFormFromRow(prescription);

  // Logo, centered, fitted into 112 x 42.
  let y = 32;
  try {
    const logo = await loadLogo();
    const scale = Math.min(112 / logo.width, 42 / logo.height);
    const width = logo.width * scale;
    const height = logo.height * scale;
    doc.addImage(logo.dataUrl, "PNG", (pageWidth - width) / 2, y, width, height);
    y += height + 8;
  } catch {
    y += 8;
  }

  // Intake section: label/value cells, highlighted when they carry a value.
  y = sectionTitle(doc, "Intake Form", y);
  const cell = (label, text) => {
    if (!label) return { content: "", styles: { lineWidth: 0 } };
    const highlighted = text && text !== "No";
    return { content: `${label}: ${text}`, styles: { fillColor: highlighted ? LIGHT_GREEN : [255, 255, 255] } };
  };
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "grid",
    styles: { ...baseStyles, minCellHeight: 22, valign: "middle" },
    body: [
      [cell("Account ID", value(intake.account_id)), cell("Patient Name", value(intake.full_name)),
        cell("PD Right", value(plainNumber(intake.pd_right))), cell("PD Left", value(plainNumber(intake.pd_left)))],
      [cell("Retinal Imaging", yesNo(intake.is_retinal_imaging_required)), cell("Eyeglasses", yesNo(intake.is_doing_eyeglasses)),
        cell("Contact Lens", yesNo(intake.is_doing_contact_lens)), cell("", "")],
      [cell("Has Insurance", yesNo(intake.has_insurance)),
        cell("Insurance Name", intake.has_insurance ? value(intake.insurance_name) : ""), cell("", ""), cell("", "")],
      [cell("Aided", yesNo(intake.is_aided)), cell("Right (OD)", value(intake.va_right)),
        cell("Left (OS)", value(intake.va_left)), cell("Both (OU)", value(intake.va_both))],
      [{ ...cell("Referral Source", value(intake.referral_sources?.name)), colSpan: 4 }],
    ],
  });
  y = doc.lastAutoTable.finalY + 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(`NCT: ${value(form.nctRight)} / ${value(form.nctLeft)}`, MARGIN, y + 4);
  y += 14;

  y = sectionTitle(doc, "Manifest", y);
  y = grid(doc, y, ["", "SPH", "CYL", "AXIS", "ADD", "REMARKS"], [
    ["OD", value(form.odSph), value(form.odCyl), value(form.odAxis), value(form.odAdd), `20/${value(form.odRemarks)}`],
    ["OS", value(form.osSph), value(form.osCyl), value(form.osAxis), value(form.osAdd), `20/${value(form.osRemarks)}`],
    ["OU", "", "", "", "", `20/${value(form.ouRemarks)}`],
  ]) + 10;

  y = sectionTitle(doc, "Contact Lens Rx", y);
  y = grid(doc, y, ["", "SPH", "CYL", "AXIS", "ADD", "BC", "DIS", "LENS MO"], [
    ["OD", value(form.cOdSph), value(form.cOdCyl), value(form.cOdAxis), value(form.cOdAdd), value(form.cOdBc), value(form.cOdDia), value(form.cOdLensMo)],
    ["OS", value(form.cOsSph), value(form.cOsCyl), value(form.cOsAxis), value(form.cOsAdd), value(form.cOsBc), value(form.cOsDia), value(form.cOsLensMo)],
  ]) + 10;

  const pick = (pairs) => pairs.filter(([flag]) => flag).map(([, label]) => label).join(", ");
  const recommendations = [
    ["Type", pick([[form.sv, "Single Vision"], [form.bifocal, "Bifocal"], [form.blendedBifocal, "Blended Bifocal"], [form.progressive, "Progressive"]])],
    ["Lens Type", pick([[form.plastic, "Plastic"], [form.poly, "Poly"], [form.polyAspheric, "Poly Aspheric"], [form.highIndex167, "High Index 1.67"], [form.ultraHiIndex174, "Ultra High Index 1.74"]])],
    ["Lens Treatment", pick([[form.scUvAr, "SC/UV/AR"], [form.blueShield, "Blue Shield Protection"]])],
    ["Transition", yesNo(form.transition)],
    ["Dry Eye Drop", yesNo(form.dryEyeDrop)],
  ].filter(([, text]) => text);

  y = sectionTitle(doc, "Recommendation", y);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "plain",
    body: recommendations.map(([label, text]) => [`${label}:`, text]),
    styles: { ...baseStyles, cellPadding: 5, lineWidth: { bottom: 0.5 }, fontStyle: "bold" },
    columnStyles: { 0: { textColor: MUTED, cellWidth: 100 } },
  });
  y = doc.lastAutoTable.finalY + 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Refraction By: ${value(prescription?.prescribed_by)}`, MARGIN, y);
  doc.text(`Refraction On: ${prescription?.prescribed_on ? formatDate(prescription.prescribed_on) : "-"}`, MARGIN, y + 13);

  doc.save(`intake-form-${intake.account_id}.pdf`);
}
