package com.ve.app.web.form;

import java.math.BigDecimal;

public class LensProtectionCoatingForm {

	private String name;
	private BigDecimal price;

	public LensProtectionCoatingForm() {
	}

	public LensProtectionCoatingForm(String name, BigDecimal price) {
		this.name = name;
		this.price = price;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}
}
