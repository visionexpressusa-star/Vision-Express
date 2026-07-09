package com.ve.app.web.form;

import java.math.BigDecimal;

public class OpticalEstimateForm {

	private Boolean hasInsurance = false;
	private BigDecimal insuranceDiscount;
	private boolean buyingEyeExam;
	private boolean buyingFrame;
	private boolean buyingPof;
	private boolean buyingLenses;
	private BigDecimal framePrice;
	private BigDecimal selectedFrameDiscountPercent;
	private String lensTypeName;
	private String lensOptionName;
	private String lensProtectionCoatingName;
	private String prescriptionSource;

	public Boolean getHasInsurance() {
		return hasInsurance;
	}

	public void setHasInsurance(Boolean hasInsurance) {
		this.hasInsurance = hasInsurance;
	}

	public BigDecimal getInsuranceDiscount() {
		return insuranceDiscount;
	}

	public void setInsuranceDiscount(BigDecimal insuranceDiscount) {
		this.insuranceDiscount = insuranceDiscount;
	}

	public boolean isBuyingEyeExam() {
		return buyingEyeExam;
	}

	public void setBuyingEyeExam(boolean buyingEyeExam) {
		this.buyingEyeExam = buyingEyeExam;
	}

	public boolean isBuyingFrame() {
		return buyingFrame;
	}

	public void setBuyingFrame(boolean buyingFrame) {
		this.buyingFrame = buyingFrame;
	}

	public boolean isBuyingPof() {
		return buyingPof;
	}

	public void setBuyingPof(boolean buyingPof) {
		this.buyingPof = buyingPof;
	}

	public boolean isBuyingLenses() {
		return buyingLenses;
	}

	public void setBuyingLenses(boolean buyingLenses) {
		this.buyingLenses = buyingLenses;
	}

	public BigDecimal getFramePrice() {
		return framePrice;
	}

	public void setFramePrice(BigDecimal framePrice) {
		this.framePrice = framePrice;
	}

	public BigDecimal getSelectedFrameDiscountPercent() {
		return selectedFrameDiscountPercent;
	}

	public void setSelectedFrameDiscountPercent(BigDecimal selectedFrameDiscountPercent) {
		this.selectedFrameDiscountPercent = selectedFrameDiscountPercent;
	}

	public String getLensTypeName() {
		return lensTypeName;
	}

	public void setLensTypeName(String lensTypeName) {
		this.lensTypeName = lensTypeName;
	}

	public String getLensOptionName() {
		return lensOptionName;
	}

	public void setLensOptionName(String lensOptionName) {
		this.lensOptionName = lensOptionName;
	}

	public String getLensProtectionCoatingName() {
		return lensProtectionCoatingName;
	}

	public void setLensProtectionCoatingName(String lensProtectionCoatingName) {
		this.lensProtectionCoatingName = lensProtectionCoatingName;
	}

	public String getPrescriptionSource() {
		return prescriptionSource;
	}

	public void setPrescriptionSource(String prescriptionSource) {
		this.prescriptionSource = prescriptionSource;
	}
}
