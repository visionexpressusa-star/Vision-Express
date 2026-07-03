package com.ve.app.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class OpticalStoreConfig {

	private BigDecimal eyeExamPrice = new BigDecimal("95.00");
	private BigDecimal examDiscountWithCompleteGlasses = new BigDecimal("85.00");
	private BigDecimal outsidePrescriptionDiscount = new BigDecimal("45.00");
	private BigDecimal lensDiscountWithoutInsurance = new BigDecimal("100.00");
	private BigDecimal pofCharge = new BigDecimal("40.00");
	private List<BigDecimal> frameDiscountOptions = new ArrayList<>();
	private List<LensOptionCharge> lensOptionCharges = new ArrayList<>();
	private List<LensPrice> lensPrices = new ArrayList<>();

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

	public List<BigDecimal> getFrameDiscountOptions() {
		return frameDiscountOptions;
	}

	public void setFrameDiscountOptions(List<BigDecimal> frameDiscountOptions) {
		this.frameDiscountOptions = frameDiscountOptions;
	}

	public List<LensOptionCharge> getLensOptionCharges() {
		return lensOptionCharges;
	}

	public void setLensOptionCharges(List<LensOptionCharge> lensOptionCharges) {
		this.lensOptionCharges = lensOptionCharges;
	}

	public List<LensPrice> getLensPrices() {
		return lensPrices;
	}

	public void setLensPrices(List<LensPrice> lensPrices) {
		this.lensPrices = lensPrices;
	}
}
