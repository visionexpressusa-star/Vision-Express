package com.ve.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "intake_form")
public class IntakeForm {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "account_id", nullable = false)
	private Long accountId;

	@Column(name = "full_name", nullable = false)
	private String fullName;

	@Column(name = "is_retinal_imaging_required", nullable = false)
	private boolean retinalImagingRequired;

	@Column(name = "is_doing_eyeglasses", nullable = false)
	private boolean doingEyeglasses;

	@Column(name = "is_doing_contact_lens", nullable = false)
	private boolean doingContactLens;

	@Column(name = "has_insurance", nullable = false)
	private boolean hasInsurance;

	@Column(name = "is_aided", nullable = false)
	private boolean aided;

	@Column(name = "pd_left", nullable = false, precision = 3, scale = 1)
	private BigDecimal pdLeft;

	@Column(name = "pd_right", nullable = false, precision = 3, scale = 1)
	private BigDecimal pdRight;

	@Column(name = "va_right", nullable = false, columnDefinition = "TEXT")
	private String vaRight;

	@Column(name = "va_left", nullable = false, columnDefinition = "TEXT")
	private String vaLeft;

	@Column(name = "va_both", nullable = false, columnDefinition = "TEXT")
	private String vaBoth;

	@Column(name = "insurance_name", columnDefinition = "TEXT")
	private String insuranceName;

	@ManyToOne(optional = false)
	@JoinColumn(name = "referral_source_id", nullable = false)
	private ReferralSource referralSource;

	@Column(name = "created_by", columnDefinition = "TEXT")
	private String createdBy;

	@Column(name = "created_on")
	private LocalDateTime createdOn;

	@Column(name = "created_by_user_id")
	private Long createdByUserId;

	public Long getCreatedByUserId() {
		return createdByUserId;
	}

	public void setCreatedByUserId(Long createdByUserId) {
		this.createdByUserId = createdByUserId;
	}

	protected IntakeForm() {
	}

	public IntakeForm(
			Long accountId,
			String fullName,
			boolean retinalImagingRequired,
			boolean doingEyeglasses,
			boolean doingContactLens,
			boolean hasInsurance,
			boolean aided,
			BigDecimal pdLeft,
			BigDecimal pdRight,
			String vaRight,
			String vaLeft,
			String vaBoth,
			String insuranceName,
			ReferralSource referralSource,
			String createdBy,
			LocalDateTime createdOn) {
		this.accountId = accountId;
		this.fullName = fullName;
		this.retinalImagingRequired = retinalImagingRequired;
		this.doingEyeglasses = doingEyeglasses;
		this.doingContactLens = doingContactLens;
		this.hasInsurance = hasInsurance;
		this.aided = aided;
		this.pdLeft = pdLeft;
		this.pdRight = pdRight;
		this.vaRight = vaRight;
		this.vaLeft = vaLeft;
		this.vaBoth = vaBoth;
		this.insuranceName = insuranceName;
		this.referralSource = referralSource;
		this.createdBy = createdBy;
		this.createdOn = createdOn;
	}

	public void updateIntakeDetails(IntakeForm details) {
		this.accountId = details.accountId;
		this.fullName = details.fullName;
		this.retinalImagingRequired = details.retinalImagingRequired;
		this.doingEyeglasses = details.doingEyeglasses;
		this.doingContactLens = details.doingContactLens;
		this.hasInsurance = details.hasInsurance;
		this.aided = details.aided;
		this.pdLeft = details.pdLeft;
		this.pdRight = details.pdRight;
		this.vaRight = details.vaRight;
		this.vaLeft = details.vaLeft;
		this.vaBoth = details.vaBoth;
		this.insuranceName = details.insuranceName;
		this.referralSource = details.referralSource;
	}

	public Long getId() {
		return id;
	}

	public Long getAccountId() {
		return accountId;
	}

	public String getFullName() {
		return fullName;
	}

	public boolean isRetinalImagingRequired() {
		return retinalImagingRequired;
	}

	public boolean isDoingEyeglasses() {
		return doingEyeglasses;
	}

	public boolean isDoingContactLens() {
		return doingContactLens;
	}

	public boolean isHasInsurance() {
		return hasInsurance;
	}

	public boolean isAided() {
		return aided;
	}

	public BigDecimal getPdLeft() {
		return pdLeft;
	}

	public BigDecimal getPdRight() {
		return pdRight;
	}

	public String getVaRight() {
		return vaRight;
	}

	public String getVaLeft() {
		return vaLeft;
	}

	public String getVaBoth() {
		return vaBoth;
	}

	public String getInsuranceName() {
		return insuranceName;
	}

	public ReferralSource getReferralSource() {
		return referralSource;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public LocalDateTime getCreatedOn() {
		return createdOn;
	}
}
