package com.ve.app.web.form;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class OpticalStoreConfigForm {

	private BigDecimal eyeExamPrice;
	private BigDecimal examDiscountWithCompleteGlasses;
	private BigDecimal outsidePrescriptionDiscount;
	private BigDecimal lensDiscountWithoutInsurance;
	private BigDecimal pofCharge;
	private List<FrameDiscountOptionForm> frameDiscountOptions = new ArrayList<>();
	private List<LensOptionChargeForm> lensOptionCharges = new ArrayList<>();
	private List<LensPriceForm> lensPrices = new ArrayList<>();

	public BigDecimal getEyeExamPrice() {
		return eyeExamPrice;
	}

	public void setEyeExamPrice(BigDecimal eyeExamPrice) {
		this.eyeExamPrice = eyeExamPrice;
	}

	public BigDecimal getExamDiscountWithCompleteGlasses() {
		return examDiscountWithCompleteGlasses;
	}

	public void setExamDiscountWithCompleteGlasses(BigDecimal examDiscountWithCompleteGlasses) {
		this.examDiscountWithCompleteGlasses = examDiscountWithCompleteGlasses;
	}

	public BigDecimal getOutsidePrescriptionDiscount() {
		return outsidePrescriptionDiscount;
	}

	public void setOutsidePrescriptionDiscount(BigDecimal outsidePrescriptionDiscount) {
		this.outsidePrescriptionDiscount = outsidePrescriptionDiscount;
	}

	public BigDecimal getLensDiscountWithoutInsurance() {
		return lensDiscountWithoutInsurance;
	}

	public void setLensDiscountWithoutInsurance(BigDecimal lensDiscountWithoutInsurance) {
		this.lensDiscountWithoutInsurance = lensDiscountWithoutInsurance;
	}

	public BigDecimal getPofCharge() {
		return pofCharge;
	}

	public void setPofCharge(BigDecimal pofCharge) {
		this.pofCharge = pofCharge;
	}

	public List<FrameDiscountOptionForm> getFrameDiscountOptions() {
		return frameDiscountOptions;
	}

	public void setFrameDiscountOptions(List<FrameDiscountOptionForm> frameDiscountOptions) {
		this.frameDiscountOptions = frameDiscountOptions;
	}

	public List<LensOptionChargeForm> getLensOptionCharges() {
		return lensOptionCharges;
	}

	public void setLensOptionCharges(List<LensOptionChargeForm> lensOptionCharges) {
		this.lensOptionCharges = lensOptionCharges;
	}

	public List<LensPriceForm> getLensPrices() {
		return lensPrices;
	}

	public void setLensPrices(List<LensPriceForm> lensPrices) {
		this.lensPrices = lensPrices;
	}
}
