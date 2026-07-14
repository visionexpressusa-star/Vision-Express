package com.ve.app.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class OpticalEstimateResult {

	private final List<EstimateLineItem> lineItems = new ArrayList<>();
	private BigDecimal subtotal = BigDecimal.ZERO;
	private BigDecimal totalDiscount = BigDecimal.ZERO;
	private BigDecimal total = BigDecimal.ZERO;

	public List<EstimateLineItem> getLineItems() {
		return lineItems;
	}

	public BigDecimal getSubtotal() {
		return subtotal;
	}

	public void setSubtotal(BigDecimal subtotal) {
		this.subtotal = subtotal;
	}

	public BigDecimal getTotalDiscount() {
		return totalDiscount;
	}

	public void setTotalDiscount(BigDecimal totalDiscount) {
		this.totalDiscount = totalDiscount;
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
