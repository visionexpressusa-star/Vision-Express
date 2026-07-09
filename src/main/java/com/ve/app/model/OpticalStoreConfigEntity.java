package com.ve.app.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "optical_store_config")
public class OpticalStoreConfigEntity {

	@Id
	private Long id;

	@Column(name = "eye_exam_price", nullable = false)
	private BigDecimal eyeExamPrice;

	@Column(name = "exam_discount_with_complete_glasses", nullable = false)
	private BigDecimal examDiscountWithCompleteGlasses;

	@Column(name = "outside_prescription_discount", nullable = false)
	private BigDecimal outsidePrescriptionDiscount;

	@Column(name = "lens_discount_without_insurance", nullable = false)
	private BigDecimal lensDiscountWithoutInsurance;

	@Column(name = "pof_charge", nullable = false)
	private BigDecimal pofCharge;

	@OneToMany(mappedBy = "config", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortNumber ASC, id ASC")
	private List<OpticalFrameDiscountOption> frameDiscountOptions = new ArrayList<>();

	@OneToMany(mappedBy = "config", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortNumber ASC, id ASC")
	private List<OpticalLensOptionCharge> lensOptionCharges = new ArrayList<>();

	@OneToMany(mappedBy = "config", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortNumber ASC, id ASC")
	private List<OpticalLensPrice> lensPrices = new ArrayList<>();

	@OneToMany(mappedBy = "config", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortNumber ASC, id ASC")
	private List<OpticalLensProtectionCoating> lensProtectionCoatings = new ArrayList<>();

	protected OpticalStoreConfigEntity() {
	}

	public OpticalStoreConfigEntity(
			Long id,
			BigDecimal eyeExamPrice,
			BigDecimal examDiscountWithCompleteGlasses,
			BigDecimal outsidePrescriptionDiscount,
			BigDecimal lensDiscountWithoutInsurance,
			BigDecimal pofCharge) {
		this.id = id;
		this.eyeExamPrice = eyeExamPrice;
		this.examDiscountWithCompleteGlasses = examDiscountWithCompleteGlasses;
		this.outsidePrescriptionDiscount = outsidePrescriptionDiscount;
		this.lensDiscountWithoutInsurance = lensDiscountWithoutInsurance;
		this.pofCharge = pofCharge;
	}

	public Long getId() {
		return id;
	}

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

	public List<OpticalFrameDiscountOption> getFrameDiscountOptions() {
		return frameDiscountOptions;
	}

	public List<OpticalLensOptionCharge> getLensOptionCharges() {
		return lensOptionCharges;
	}

	public List<OpticalLensPrice> getLensPrices() {
		return lensPrices;
	}

	public List<OpticalLensProtectionCoating> getLensProtectionCoatings() {
		return lensProtectionCoatings;
	}

}
