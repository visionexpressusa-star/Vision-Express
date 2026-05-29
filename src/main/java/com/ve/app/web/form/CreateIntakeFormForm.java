package com.ve.app.web.form;

import java.util.ArrayList;
import java.util.List;

public class CreateIntakeFormForm {

	private String accountId = "";

	private String fullName = "";

	private String pdRight = "";

	private String pdLeft = "";

	private boolean retinalImagingRequired;

	private boolean doingEyeglasses;

	private boolean doingContactLens;

	private boolean hasInsurance;

	private String insuranceName = "";

	private boolean aided;

	private String vaRight = "";

	private String vaLeft = "";

	private String vaBoth = "";

	private String notes = "";

	private List<Long> checkedChecklistItemIds = new ArrayList<>();

	public String getAccountId() {
		return accountId;
	}

	public void setAccountId(String accountId) {
		this.accountId = accountId;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getPdRight() {
		return pdRight;
	}

	public void setPdRight(String pdRight) {
		this.pdRight = pdRight;
	}

	public String getPdLeft() {
		return pdLeft;
	}

	public void setPdLeft(String pdLeft) {
		this.pdLeft = pdLeft;
	}

	public boolean isRetinalImagingRequired() {
		return retinalImagingRequired;
	}

	public void setRetinalImagingRequired(boolean retinalImagingRequired) {
		this.retinalImagingRequired = retinalImagingRequired;
	}

	public boolean isDoingEyeglasses() {
		return doingEyeglasses;
	}

	public void setDoingEyeglasses(boolean doingEyeglasses) {
		this.doingEyeglasses = doingEyeglasses;
	}

	public boolean isDoingContactLens() {
		return doingContactLens;
	}

	public void setDoingContactLens(boolean doingContactLens) {
		this.doingContactLens = doingContactLens;
	}

	public boolean isHasInsurance() {
		return hasInsurance;
	}

	public void setHasInsurance(boolean hasInsurance) {
		this.hasInsurance = hasInsurance;
	}

	public String getInsuranceName() {
		return insuranceName;
	}

	public void setInsuranceName(String insuranceName) {
		this.insuranceName = insuranceName;
	}

	public boolean isAided() {
		return aided;
	}

	public void setAided(boolean aided) {
		this.aided = aided;
	}

	public String getVaRight() {
		return vaRight;
	}

	public void setVaRight(String vaRight) {
		this.vaRight = vaRight;
	}

	public String getVaLeft() {
		return vaLeft;
	}

	public void setVaLeft(String vaLeft) {
		this.vaLeft = vaLeft;
	}

	public String getVaBoth() {
		return vaBoth;
	}

	public void setVaBoth(String vaBoth) {
		this.vaBoth = vaBoth;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public List<Long> getCheckedChecklistItemIds() {
		return checkedChecklistItemIds;
	}

	public void setCheckedChecklistItemIds(List<Long> checkedChecklistItemIds) {
		this.checkedChecklistItemIds =
				checkedChecklistItemIds == null ? new ArrayList<>() : checkedChecklistItemIds;
	}
}
