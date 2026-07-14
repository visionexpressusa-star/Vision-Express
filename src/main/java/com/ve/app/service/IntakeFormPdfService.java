package com.ve.app.service;

import com.ve.app.model.IntakeForm;
import com.ve.app.web.form.CreatePrescriptionForm;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import org.openpdf.text.Chunk;
import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.Element;
import org.openpdf.text.Font;
import org.openpdf.text.FontFactory;
import org.openpdf.text.Image;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.Phrase;
import org.openpdf.text.Rectangle;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class IntakeFormPdfService {

	private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MM/dd/yyyy");
	private static final java.awt.Color NAVY = new java.awt.Color(25, 48, 34);
	private static final java.awt.Color MUTED = new java.awt.Color(94, 108, 99);
	private static final java.awt.Color LIGHT_GREEN = new java.awt.Color(237, 243, 234);
	private static final java.awt.Color HEADER_GREEN = new java.awt.Color(225, 239, 221);
	private static final java.awt.Color BORDER = new java.awt.Color(190, 211, 188);

	private final Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, NAVY);
	private final Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, NAVY);
	private final Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, MUTED);
	private final Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 8, NAVY);
	private final Font selectedValueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, NAVY);
	private final Font tableHeadFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, MUTED);
	private final Font prescribedFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, java.awt.Color.BLACK);

	public byte[] generate(
			IntakeForm intakeForm,
			CreatePrescriptionForm prescriptionForm,
			String prescribedBy,
			LocalDateTime prescribedOn) {
		try {
			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			Document document = new Document(PageSize.LETTER, 42, 42, 32, 32);
			PdfWriter.getInstance(document, outputStream);
			document.open();

			addHeader(document);
			addIntakeSection(document, intakeForm);
			addNct(document, prescriptionForm);
			addManifest(document, prescriptionForm);
			addContactLens(document, prescriptionForm);
			addRecommendation(document, prescriptionForm);
			addPrescriptionMeta(document, prescribedBy, prescribedOn);

			document.close();
			return outputStream.toByteArray();
		}
		catch (DocumentException | IOException exception) {
			throw new IllegalStateException("Unable to generate intake form PDF.", exception);
		}
	}

	private void addHeader(Document document) throws IOException, DocumentException {
		PdfPTable header = new PdfPTable(1);
		header.setWidthPercentage(100);

		Image logo = Image.getInstance(new ClassPathResource("static/images/ve-logo.png").getContentAsByteArray());
		logo.scaleToFit(112, 42);
		logo.setAlignment(Image.ALIGN_CENTER);
		PdfPCell logoCell = plainCell();
		logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
		logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
		logoCell.addElement(logo);
		header.addCell(logoCell);
		document.add(header);
	}

	private void addIntakeSection(Document document, IntakeForm intakeForm) throws DocumentException {
		PdfPTable section = sectionTable("Intake Form", 8, 8);
		PdfPTable table = new PdfPTable(4);
		table.setWidthPercentage(100);
		addSummaryRow(table,
				"Account ID", value(intakeForm.getAccountId()),
				"Patient Name", value(intakeForm.getFullName()),
				"PD Right", value(intakeForm.getPdRight()),
				"PD Left", value(intakeForm.getPdLeft()));
		addSummaryRow(table,
				"Retinal Imaging", yesNo(intakeForm.isRetinalImagingRequired()),
				"Eyeglasses", yesNo(intakeForm.isDoingEyeglasses()),
				"Contact Lens", yesNo(intakeForm.isDoingContactLens()),
				"", "");
		addSummaryRow(table,
				"Has Insurance", yesNo(intakeForm.isHasInsurance()),
				"Insurance Name", intakeForm.isHasInsurance() ? value(intakeForm.getInsuranceName()) : "",
				"", "",
				"", "");
		addSummaryRow(table,
				"Aided", yesNo(intakeForm.isAided()),
				"Right (OD)", value(intakeForm.getVaRight()),
				"Left (OS)", value(intakeForm.getVaLeft()),
				"Both (OU)", value(intakeForm.getVaBoth()));
		addWideKeyValue(table, "Referral Source", value(intakeForm.getReferralSource().getName()));
		section.addCell(contentCell(table));
		document.add(section);
	}

	private void addNct(Document document, CreatePrescriptionForm form) throws DocumentException {
		PdfPTable table = new PdfPTable(1);
		table.setWidthPercentage(100);
		table.setSpacingBefore(4);
		table.setSpacingAfter(6);

		PdfPCell nct = plainCell();
		nct.addElement(new Paragraph("NCT: " + value(form.getNctRight()) + " / " + value(form.getNctLeft()), sectionFont));
		table.addCell(nct);
		document.add(table);
	}

	private void addPrescriptionMeta(
			Document document,
			String prescribedBy,
			LocalDateTime prescribedOn) throws DocumentException {
		PdfPTable table = new PdfPTable(1);
		table.setWidthPercentage(100);
		table.setSpacingBefore(6);

		PdfPCell prescribed = plainCell();
		Paragraph by = new Paragraph("Refraction By: " + value(prescribedBy), prescribedFont);
		Paragraph on = new Paragraph("Refraction On: " + (prescribedOn == null ? "-" : DATE_FORMATTER.format(prescribedOn)), prescribedFont);
		prescribed.addElement(by);
		prescribed.addElement(on);
		table.addCell(prescribed);
		document.add(table);
	}

	private PdfPTable sectionTable(String title, float spacingBefore, float spacingAfter) throws DocumentException {
		PdfPTable section = new PdfPTable(1);
		section.setWidthPercentage(100);
		section.setSpacingBefore(spacingBefore);
		section.setSpacingAfter(spacingAfter);

		PdfPCell titleCell = new PdfPCell(new Phrase(title, sectionFont));
		titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
		titleCell.setBackgroundColor(HEADER_GREEN);
		titleCell.setBorderColor(BORDER);
		titleCell.setPadding(4);
		section.addCell(titleCell);
		return section;
	}

	private PdfPCell contentCell(PdfPTable table) {
		PdfPCell cell = new PdfPCell(table);
		cell.setBorderColor(BORDER);
		cell.setPadding(5);
		return cell;
	}

	private void addManifest(Document document, CreatePrescriptionForm form) throws DocumentException {
		PdfPTable section = sectionTable("Manifest", 6, 7);
		PdfPTable table = table(new float[] {0.6f, 1f, 1f, 1f, 1f, 1.2f});
		addHeaderRow(table, "", "SPH", "CYL", "AXIS", "ADD", "REMARKS");
		addRow(table, "OD", value(form.getOdSph()), value(form.getOdCyl()), value(form.getOdAxis()), value(form.getOdAdd()), "20/" + value(form.getOdRemarks()));
		addRow(table, "OS", value(form.getOsSph()), value(form.getOsCyl()), value(form.getOsAxis()), value(form.getOsAdd()), "20/" + value(form.getOsRemarks()));
		addRow(table, "OU", "", "", "", "", "20/" + value(form.getOuRemarks()));
		section.addCell(contentCell(table));
		document.add(section);
	}

	private void addContactLens(Document document, CreatePrescriptionForm form) throws DocumentException {
		PdfPTable section = sectionTable("Contact Lens Rx", 7, 7);
		PdfPTable table = table(new float[] {0.6f, 1f, 1f, 1f, 1f, 1f, 1f, 1.3f});
		addHeaderRow(table, "", "SPH", "CYL", "AXIS", "ADD", "BC", "DIS", "LENS MO");
		addRow(table, "OD", value(form.getCOdSph()), value(form.getCOdCyl()), value(form.getCOdAxis()), value(form.getCOdAdd()), value(form.getCOdBc()), value(form.getCOdDia()), value(form.getCOdLensMo()));
		addRow(table, "OS", value(form.getCOsSph()), value(form.getCOsCyl()), value(form.getCOsAxis()), value(form.getCOsAdd()), value(form.getCOsBc()), value(form.getCOsDia()), value(form.getCOsLensMo()));
		section.addCell(contentCell(table));
		document.add(section);
	}

	private void addRecommendation(Document document, CreatePrescriptionForm form) throws DocumentException {
		PdfPTable section = sectionTable("Recommendation", 7, 6);
		PdfPTable table = table(new float[] {1.25f, 5f});
		addRecommendationLine(table, "Type", selectedValues(
				recommended(form.isSv(), "Single Vision"),
				recommended(form.isBifocal(), "Bifocal"),
				recommended(form.isBlendedBifocal(), "Blended Bifocal"),
				recommended(form.isProgressive(), "Progressive")));
		addRecommendationLine(table, "Lens Type", selectedValues(
				recommended(form.isPlastic(), "Plastic"),
				recommended(form.isPoly(), "Poly"),
				recommended(form.isPolyAspheric(), "Poly Aspheric"),
				recommended(form.isHighIndex167(), "High Index 1.67"),
				recommended(form.isUltraHiIndex174(), "Ultra High Index 1.74")));
		addRecommendationLine(table, "Lens Treatment", selectedValues(
				recommended(form.isScUvAr(), "SC/UV/AR"),
				recommended(form.isBlueShield(), "Blue Shield Protection")));
		addRecommendationLine(table, "Transition", yesNo(form.isTransition()));
		addRecommendationLine(table, "Dry Eye Drop", yesNo(form.isDryEyeDrop()));
		section.addCell(contentCell(table));
		document.add(section);
	}

	private void addSectionTitle(Document document, String title) throws DocumentException {
		PdfPTable table = new PdfPTable(1);
		table.setWidthPercentage(100);
		table.setSpacingBefore(1);
		table.setSpacingAfter(1);
		PdfPCell cell = new PdfPCell(new Phrase(title, sectionFont));
		cell.setBackgroundColor(HEADER_GREEN);
		cell.setBorder(Rectangle.NO_BORDER);
		cell.setPadding(2);
		table.addCell(cell);
		document.add(table);
	}

	private PdfPTable table(float[] widths) throws DocumentException {
		PdfPTable table = new PdfPTable(widths);
		table.setWidthPercentage(100);
		table.setSpacingAfter(1);
		return table;
	}

	private void addHeaderRow(PdfPTable table, String... values) {
		for (String value : values) {
			PdfPCell cell = new PdfPCell(new Phrase(value, tableHeadFont));
			cell.setBackgroundColor(HEADER_GREEN);
			cell.setBorderColor(BORDER);
			cell.setPadding(4);
			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
			table.addCell(cell);
		}
	}

	private void addRow(PdfPTable table, String... values) {
		for (String value : values) {
			PdfPCell cell = new PdfPCell(new Phrase(value, valueFont));
			cell.setBorderColor(BORDER);
			cell.setPadding(4);
			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
			table.addCell(cell);
		}
	}

	private void addRecommendationRow(PdfPTable table, String... values) {
		for (String value : values) {
			PdfPCell cell = new PdfPCell(new Phrase(value, value.isBlank() ? valueFont : selectedValueFont));
			cell.setBorder(Rectangle.BOTTOM);
			cell.setBorderColor(BORDER);
			cell.setPadding(3);
			table.addCell(cell);
		}
	}

	private void addRecommendationLine(PdfPTable table, String label, String value) {
		if (value.isBlank()) {
			return;
		}
		PdfPCell labelCell = new PdfPCell(new Phrase(label + ":", labelFont));
		labelCell.setBorder(Rectangle.BOTTOM);
		labelCell.setBorderColor(BORDER);
		labelCell.setPadding(5);
		table.addCell(labelCell);

		PdfPCell valueCell = new PdfPCell(new Phrase(value, selectedValueFont));
		valueCell.setBorder(Rectangle.BOTTOM);
		valueCell.setBorderColor(BORDER);
		valueCell.setPadding(5);
		table.addCell(valueCell);
	}

	private void addSummaryRow(PdfPTable table, String... values) {
		for (int index = 0; index < values.length; index += 2) {
			String label = values[index];
			String value = values[index + 1];
			if (label.isBlank()) {
				addEmpty(table);
			}
			else {
				addKeyValue(table, label, value);
			}
		}
	}

	private void addKeyValue(PdfPTable table, String label, String value) {
		PdfPCell cell = new PdfPCell();
		if (!value.isBlank() && !"No".equalsIgnoreCase(value)) {
			cell.setBackgroundColor(LIGHT_GREEN);
		}
		cell.setBorderColor(BORDER);
		cell.setPadding(4);
		cell.setMinimumHeight(22);
		cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
		Paragraph paragraph = new Paragraph();
		paragraph.setLeading(10);
		paragraph.setAlignment(Element.ALIGN_LEFT);
		paragraph.add(new Chunk(label + ": ", labelFont));
		paragraph.add(new Chunk(value, valueFont));
		cell.addElement(paragraph);
		table.addCell(cell);
	}

	private void addWideKeyValue(PdfPTable table, String label, String value) {
		PdfPCell cell = new PdfPCell();
		cell.setColspan(4);
		cell.setBackgroundColor(LIGHT_GREEN);
		cell.setBorderColor(BORDER);
		cell.setPadding(4);
		cell.setMinimumHeight(22);
		cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
		Paragraph paragraph = new Paragraph();
		paragraph.setLeading(10);
		paragraph.setAlignment(Element.ALIGN_LEFT);
		paragraph.add(new Chunk(label + ": ", labelFont));
		paragraph.add(new Chunk(value, valueFont));
		cell.addElement(paragraph);
		table.addCell(cell);
	}

	private void addEmpty(PdfPTable table) {
		PdfPCell cell = new PdfPCell(new Phrase(""));
		cell.setBorder(Rectangle.NO_BORDER);
		table.addCell(cell);
	}

	private PdfPCell plainCell() {
		PdfPCell cell = new PdfPCell();
		cell.setBorder(Rectangle.NO_BORDER);
		return cell;
	}

	private String recommended(boolean checked, String label) {
		return checked ? label : "";
	}

	private String selectedValues(String... values) {
		List<String> selected = new ArrayList<>();
		for (String value : values) {
			if (value != null && !value.isBlank()) {
				selected.add(value);
			}
		}
		return String.join(", ", selected);
	}

	private String yesNo(boolean value) {
		return value ? "Yes" : "No";
	}

	private boolean hasText(String value) {
		return value != null && !value.isBlank();
	}

	private String value(Object value) {
		if (value == null) {
			return "-";
		}
		if (value instanceof BigDecimal decimal) {
			return decimal.stripTrailingZeros().toPlainString();
		}
		String text = value.toString();
		return text.isBlank() ? "-" : text;
	}
}
