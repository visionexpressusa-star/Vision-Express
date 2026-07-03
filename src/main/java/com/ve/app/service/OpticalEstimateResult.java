package com.ve.app.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class OpticalEstimateResult {

	private final List<EstimateLineItem> lineItems = new ArrayList<>();
	private BigDecimal total = BigDecimal.ZERO;

	public List<EstimateLineItem> getLineItems() {
		return lineItems;
	}

	public BigDecimal getTotal() {
		return total;
	}

	public void setTotal(BigDecimal total) {
		this.total = total;
	}

	public boolean hasLineItems() {
		return !lineItems.isEmpty();
	}
}
