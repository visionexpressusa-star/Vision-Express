package com.ve.app.web.form;

import java.math.BigDecimal;

public class FrameDiscountOptionForm {

	private BigDecimal percent;

	public FrameDiscountOptionForm() {
	}

	public FrameDiscountOptionForm(BigDecimal percent) {
		this.percent = percent;
	}

	public BigDecimal getPercent() {
		return percent;
	}

	public void setPercent(BigDecimal percent) {
		this.percent = percent;
	}
}
