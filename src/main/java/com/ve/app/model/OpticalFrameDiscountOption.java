package com.ve.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "optical_frame_discount_option")
public class OpticalFrameDiscountOption {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "config_id", nullable = false)
	private OpticalStoreConfigEntity config;

	@Column(name = "sort_number", nullable = false)
	private int sortNumber;

	@Column(nullable = false)
	private BigDecimal percent;

	protected OpticalFrameDiscountOption() {
	}

	public OpticalFrameDiscountOption(OpticalStoreConfigEntity config, int sortNumber, BigDecimal percent) {
		this.config = config;
		this.sortNumber = sortNumber;
		this.percent = percent;
	}

	public BigDecimal getPercent() {
		return percent;
	}
}
