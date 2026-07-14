package com.ve.app.web.form;

import com.ve.app.model.LensRecommendation;
import com.ve.app.model.Prescription;
import java.math.BigDecimal;

public class CreatePrescriptionForm {

	private String nctRight = "";

	private String nctLeft = "";

	private String odSph = "";

	private String odCyl = "";

	private String odAxis = "";

	private String odAdd = "";

	private String odRemarks = "";

	private String osSph = "";

	private String osCyl = "";

	private String osAxis = "";

	private String osAdd = "";

	private String osRemarks = "";

	private String ouRemarks = "";

	private String cOdSph = "";

	private String cOdCyl = "";

	private String cOdAxis = "";

	private String cOdAdd = "";

	private String cOdBc = "";

	private String cOdDia = "";

	private String cOdLensMo = "";

	private String cOsSph = "";

	private String cOsCyl = "";

	private String cOsAxis = "";

	private String cOsAdd = "";

	private String cOsBc = "";

	private String cOsDia = "";

	private String cOsLensMo = "";

	private boolean sv;

	private boolean bifocal;

	private boolean blendedBifocal;

	private boolean progressive;

	private boolean plastic;

	private boolean poly;

	private boolean polyAspheric;

	private boolean highIndex167;

	private boolean ultraHiIndex174;

	private boolean scUvAr;

	private boolean blueShield;

	private boolean transition;

	private boolean dryEyeDrop;

	public static CreatePrescriptionForm from(Prescription prescription, LensRecommendation recommendation) {
		CreatePrescriptionForm form = new CreatePrescriptionForm();
		form.nctRight = formatDecimal(prescription.getNctRight());
		form.nctLeft = formatDecimal(prescription.getNctLeft());
		form.odSph = valueOrEmpty(prescription.getOdSph());
		form.odCyl = valueOrEmpty(prescription.getOdCyl());
		form.odAxis = valueOrEmpty(prescription.getOdAxis());
		form.odAdd = valueOrEmpty(prescription.getOdAdd());
		form.odRemarks = valueOrEmpty(prescription.getOdRemarks());
		form.osSph = valueOrEmpty(prescription.getOsSph());
		form.osCyl = valueOrEmpty(prescription.getOsCyl());
		form.osAxis = valueOrEmpty(prescription.getOsAxis());
		form.osAdd = valueOrEmpty(prescription.getOsAdd());
		form.osRemarks = valueOrEmpty(prescription.getOsRemarks());
		form.ouRemarks = valueOrEmpty(prescription.getOuRemarks());
		form.cOdSph = valueOrEmpty(prescription.getCOdSph());
		form.cOdCyl = valueOrEmpty(prescription.getCOdCyl());
		form.cOdAxis = valueOrEmpty(prescription.getCOdAxis());
		form.cOdAdd = valueOrEmpty(prescription.getCOdAdd());
		form.cOdBc = valueOrEmpty(prescription.getCOdBc());
		form.cOdDia = valueOrEmpty(prescription.getCOdDia());
		form.cOdLensMo = valueOrEmpty(prescription.getCOdLensMo());
		form.cOsSph = valueOrEmpty(prescription.getCOsSph());
		form.cOsCyl = valueOrEmpty(prescription.getCOsCyl());
		form.cOsAxis = valueOrEmpty(prescription.getCOsAxis());
		form.cOsAdd = valueOrEmpty(prescription.getCOsAdd());
		form.cOsBc = valueOrEmpty(prescription.getCOsBc());
		form.cOsDia = valueOrEmpty(prescription.getCOsDia());
		form.cOsLensMo = valueOrEmpty(prescription.getCOsLensMo());

		if (recommendation != null) {
			form.sv = recommendation.isSv();
			form.bifocal = recommendation.isBifocal();
			form.blendedBifocal = recommendation.isBlendedBifocal();
			form.progressive = recommendation.isProgressive();
			form.plastic = recommendation.isPlastic();
			form.poly = recommendation.isPoly();
			form.polyAspheric = recommendation.isPolyAspheric();
			form.highIndex167 = recommendation.isHighIndex167();
			form.ultraHiIndex174 = recommendation.isUltraHiIndex174();
			form.scUvAr = recommendation.isScUvAr();
			form.blueShield = recommendation.isBlueShield();
			form.transition = recommendation.isTransition();
			form.dryEyeDrop = recommendation.isDryEyeDrop();
		}
		return form;
	}

	private static String formatDecimal(BigDecimal value) {
		return value == null ? "" : value.stripTrailingZeros().toPlainString();
	}

	private static String valueOrEmpty(Object value) {
		return value == null ? "" : value.toString();
	}

	public String getNctRight() {
		return nctRight;
	}

	public void setNctRight(String nctRight) {
		this.nctRight = nctRight;
	}

	public String getNctLeft() {
		return nctLeft;
	}

	public void setNctLeft(String nctLeft) {
		this.nctLeft = nctLeft;
	}

	public String getOdSph() {
		return odSph;
	}

	public void setOdSph(String odSph) {
		this.odSph = odSph;
	}

	public String getOdCyl() {
		return odCyl;
	}

	public void setOdCyl(String odCyl) {
		this.odCyl = odCyl;
	}

	public String getOdAxis() {
		return odAxis;
	}

	public void setOdAxis(String odAxis) {
		this.odAxis = odAxis;
	}

	public String getOdAdd() {
		return odAdd;
	}

	public void setOdAdd(String odAdd) {
		this.odAdd = odAdd;
	}

	public String getOdRemarks() {
		return odRemarks;
	}

	public void setOdRemarks(String odRemarks) {
		this.odRemarks = odRemarks;
	}

	public String getOsSph() {
		return osSph;
	}

	public void setOsSph(String osSph) {
		this.osSph = osSph;
	}

	public String getOsCyl() {
		return osCyl;
	}

	public void setOsCyl(String osCyl) {
		this.osCyl = osCyl;
	}

	public String getOsAxis() {
		return osAxis;
	}

	public void setOsAxis(String osAxis) {
		this.osAxis = osAxis;
	}

	public String getOsAdd() {
		return osAdd;
	}

	public void setOsAdd(String osAdd) {
		this.osAdd = osAdd;
	}

	public String getOsRemarks() {
		return osRemarks;
	}

	public void setOsRemarks(String osRemarks) {
		this.osRemarks = osRemarks;
	}

	public String getOuRemarks() {
		return ouRemarks;
	}

	public void setOuRemarks(String ouRemarks) {
		this.ouRemarks = ouRemarks;
	}

	public String getCOdSph() {
		return cOdSph;
	}

	public void setCOdSph(String cOdSph) {
		this.cOdSph = cOdSph;
	}

	public String getCOdCyl() {
		return cOdCyl;
	}

	public void setCOdCyl(String cOdCyl) {
		this.cOdCyl = cOdCyl;
	}

	public String getCOdAxis() {
		return cOdAxis;
	}

	public void setCOdAxis(String cOdAxis) {
		this.cOdAxis = cOdAxis;
	}

	public String getCOdAdd() {
		return cOdAdd;
	}

	public void setCOdAdd(String cOdAdd) {
		this.cOdAdd = cOdAdd;
	}

	public String getCOdBc() {
		return cOdBc;
	}

	public void setCOdBc(String cOdBc) {
		this.cOdBc = cOdBc;
	}

	public String getCOdDia() {
		return cOdDia;
	}

	public void setCOdDia(String cOdDia) {
		this.cOdDia = cOdDia;
	}

	public String getCOdLensMo() {
		return cOdLensMo;
	}

	public void setCOdLensMo(String cOdLensMo) {
		this.cOdLensMo = cOdLensMo;
	}

	public String getCOsSph() {
		return cOsSph;
	}

	public void setCOsSph(String cOsSph) {
		this.cOsSph = cOsSph;
	}

	public String getCOsCyl() {
		return cOsCyl;
	}

	public void setCOsCyl(String cOsCyl) {
		this.cOsCyl = cOsCyl;
	}

	public String getCOsAxis() {
		return cOsAxis;
	}

	public void setCOsAxis(String cOsAxis) {
		this.cOsAxis = cOsAxis;
	}

	public String getCOsAdd() {
		return cOsAdd;
	}

	public void setCOsAdd(String cOsAdd) {
		this.cOsAdd = cOsAdd;
	}

	public String getCOsBc() {
		return cOsBc;
	}

	public void setCOsBc(String cOsBc) {
		this.cOsBc = cOsBc;
	}

	public String getCOsDia() {
		return cOsDia;
	}

	public void setCOsDia(String cOsDia) {
		this.cOsDia = cOsDia;
	}

	public String getCOsLensMo() {
		return cOsLensMo;
	}

	public void setCOsLensMo(String cOsLensMo) {
		this.cOsLensMo = cOsLensMo;
	}

	public boolean isSv() {
		return sv;
	}

	public void setSv(boolean sv) {
		this.sv = sv;
	}

	public boolean isBifocal() {
		return bifocal;
	}

	public void setBifocal(boolean bifocal) {
		this.bifocal = bifocal;
	}

	public boolean isBlendedBifocal() {
		return blendedBifocal;
	}

	public void setBlendedBifocal(boolean blendedBifocal) {
		this.blendedBifocal = blendedBifocal;
	}

	public boolean isProgressive() {
		return progressive;
	}

	public void setProgressive(boolean progressive) {
		this.progressive = progressive;
	}

	public boolean isPlastic() {
		return plastic;
	}

	public void setPlastic(boolean plastic) {
		this.plastic = plastic;
	}

	public boolean isPoly() {
		return poly;
	}

	public void setPoly(boolean poly) {
		this.poly = poly;
	}

	public boolean isPolyAspheric() {
		return polyAspheric;
	}

	public void setPolyAspheric(boolean polyAspheric) {
		this.polyAspheric = polyAspheric;
	}

	public boolean isHighIndex167() {
		return highIndex167;
	}

	public void setHighIndex167(boolean highIndex167) {
		this.highIndex167 = highIndex167;
	}

	public boolean isUltraHiIndex174() {
		return ultraHiIndex174;
	}

	public void setUltraHiIndex174(boolean ultraHiIndex174) {
		this.ultraHiIndex174 = ultraHiIndex174;
	}

	public boolean isScUvAr() {
		return scUvAr;
	}

	public void setScUvAr(boolean scUvAr) {
		this.scUvAr = scUvAr;
	}

	public boolean isBlueShield() {
		return blueShield;
	}

	public void setBlueShield(boolean blueShield) {
		this.blueShield = blueShield;
	}

	public boolean isTransition() {
		return transition;
	}

	public void setTransition(boolean transition) {
		this.transition = transition;
	}

	public boolean isDryEyeDrop() {
		return dryEyeDrop;
	}

	public void setDryEyeDrop(boolean dryEyeDrop) {
		this.dryEyeDrop = dryEyeDrop;
	}
}
