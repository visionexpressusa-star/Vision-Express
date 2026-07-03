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
@Table(name = "optical_lens_price")
public class OpticalLensPrice {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "config_id", nullable = false)
	private OpticalStoreConfigEntity config;

	@Column(name = "sort_number", nullable = false)
	private int sortNumber;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false)
	private BigDecimal price;

	protected OpticalLensPrice() {
	}

	public OpticalLensPrice(OpticalStoreConfigEntity config, int sortNumber, String name, BigDecimal price) {
		this.config = config;
		this.sortNumber = sortNumber;
		this.name = name;
		this.price = price;
	}

	public String getName() {
		return name;
	}

	public BigDecimal getPrice() {
		return price;
	}
}
