// Customer-facing price estimate PDF built from calculateEstimate()'s result.
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate, formatMoney } from "./format.js";

const NAVY = [25, 48, 34];
const MUTED = [94, 108, 99];
const HEADER_GREEN = [225, 239, 221];
const LIGHT_GREEN = [237, 243, 234];
const BORDER = [190, 211, 188];
const RED = [238, 57, 37];
const MARGIN = 48;

async function loadLogo() {
  const blob = await (await fetch("/images/ve-logo.png")).blob();
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

/**
 * @param estimate result of calculateEstimate()
 * @param details { customerName, preparedBy, insurance: "true" | "false" }
 */
export async function generateEstimatePdf(estimate, details) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 40;

  try {
    const logo = await loadLogo();
    const scale = Math.min(130 / logo.width, 48 / logo.height);
    doc.addImage(logo.dataUrl, "PNG", MARGIN, y, logo.width * scale, logo.height * scale);
  } catch {
    // The estimate is still useful without the logo.
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...NAVY);
  doc.text("Price Estimate", pageWidth - MARGIN, y + 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Date: ${formatDate(new Date())}`, pageWidth - MARGIN, y + 38, { align: "right" });
  y += 72;

  const info = [
    ["Customer", details.customerName?.trim() || "—"],
    ["Insurance", details.insurance === "true" ? "Yes" : "No"],
    ["Prepared by", details.preparedBy || "—"],
  ];
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "plain",
    body: info,
    styles: { font: "helvetica", fontSize: 10, textColor: NAVY, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", textColor: MUTED, cellWidth: 90 } },
  });
  y = doc.lastAutoTable.finalY + 16;

  const money = (amount) => formatMoney(amount);
  const body = [
    ...estimate.chargeLines.map((line) => [line.label, money(line.amount)]),
    ...estimate.discountLines.map((line) => [
      { content: line.label, styles: { textColor: RED } },
      { content: money(line.amount), styles: { textColor: RED } },
    ]),
  ];
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "grid",
    head: [["Item", "Amount"]],
    body,
    foot: [
      ["Subtotal", money(estimate.subtotal)],
      ["Total discount", money(-estimate.totalDiscount)],
      [{ content: "Estimated total", styles: { fontSize: 12 } }, { content: money(estimate.total), styles: { fontSize: 12 } }],
    ],
    styles: { font: "helvetica", fontSize: 10, textColor: NAVY, lineColor: BORDER, lineWidth: 0.5, cellPadding: 7 },
    headStyles: { fillColor: HEADER_GREEN, textColor: MUTED, fontStyle: "bold" },
    footStyles: { fillColor: LIGHT_GREEN, textColor: NAVY, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right", cellWidth: 120 } },
    didParseCell: (data) => {
      if (data.section !== "body" && data.column.index === 1) data.cell.styles.halign = "right";
    },
  });
  y = doc.lastAutoTable.finalY + 24;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    "This is an estimate, not an invoice. Final prices may change with your prescription, insurance and frame choice.",
    MARGIN, y, { maxWidth: pageWidth - MARGIN * 2 }
  );

  const fileName = (details.customerName?.trim() || "customer").replace(/[^A-Za-z0-9-]+/g, "-");
  doc.save(`estimate-${fileName}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
