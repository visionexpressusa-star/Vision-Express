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

@Entity
@Table(name = "lens_recommendation")
public class LensRecommendation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "prescription_id", nullable = false)
	private Prescription prescription;

	@Column(name = "is_sv", nullable = false)
	private boolean sv;

	@Column(name = "is_bifocal", nullable = false)
	private boolean bifocal;

	@Column(name = "is_blended_bifocal", nullable = false)
	private boolean blendedBifocal;

	@Column(name = "is_progressive", nullable = false)
	private boolean progressive;

	@Column(name = "is_plastic", nullable = false)
	private boolean plastic;

	@Column(name = "is_poly", nullable = false)
	private boolean poly;

	@Column(name = "is_poly_aspheric", nullable = false)
	private boolean polyAspheric;

	@Column(name = "is_high_index_160", nullable = false)
	private boolean highIndex160;

	@Column(name = "is_high_index_167", nullable = false)
	private boolean highIndex167;

	@Column(name = "is_ultra_hi_index_174", nullable = false)
	private boolean ultraHiIndex174;

	@Column(name = "is_sc_uv_ar", nullable = false)
	private boolean scUvAr;

	@Column(name = "is_blue_shield", nullable = false)
	private boolean blueShield;

	@Column(name = "is_transition", nullable = false)
	private boolean transition;

	protected LensRecommendation() {
	}

	public LensRecommendation(
			Prescription prescription,
			boolean sv,
			boolean bifocal,
			boolean blendedBifocal,
			boolean progressive,
			boolean plastic,
			boolean poly,
			boolean polyAspheric,
			boolean highIndex160,
			boolean highIndex167,
			boolean ultraHiIndex174,
			boolean scUvAr,
			boolean blueShield,
			boolean transition) {
		this.prescription = prescription;
		this.sv = sv;
		this.bifocal = bifocal;
		this.blendedBifocal = blendedBifocal;
		this.progressive = progressive;
		this.plastic = plastic;
		this.poly = poly;
		this.polyAspheric = polyAspheric;
		this.highIndex160 = highIndex160;
		this.highIndex167 = highIndex167;
		this.ultraHiIndex174 = ultraHiIndex174;
		this.scUvAr = scUvAr;
		this.blueShield = blueShield;
		this.transition = transition;
	}

	public boolean isSv() {
		return sv;
	}

	public boolean isBifocal() {
		return bifocal;
	}

	public boolean isBlendedBifocal() {
		return blendedBifocal;
	}

	public boolean isProgressive() {
		return progressive;
	}

	public boolean isPlastic() {
		return plastic;
	}

	public boolean isPoly() {
		return poly;
	}

	public boolean isPolyAspheric() {
		return polyAspheric;
	}

	public boolean isHighIndex160() {
		return highIndex160;
	}

	public boolean isHighIndex167() {
		return highIndex167;
	}

	public boolean isUltraHiIndex174() {
		return ultraHiIndex174;
	}

	public boolean isScUvAr() {
		return scUvAr;
	}

	public boolean isBlueShield() {
		return blueShield;
	}

	public boolean isTransition() {
		return transition;
	}

	public void update(
			boolean sv,
			boolean bifocal,
			boolean blendedBifocal,
			boolean progressive,
			boolean plastic,
			boolean poly,
			boolean polyAspheric,
			boolean highIndex160,
			boolean highIndex167,
			boolean ultraHiIndex174,
			boolean scUvAr,
			boolean blueShield,
			boolean transition) {
		this.sv = sv;
		this.bifocal = bifocal;
		this.blendedBifocal = blendedBifocal;
		this.progressive = progressive;
		this.plastic = plastic;
		this.poly = poly;
		this.polyAspheric = polyAspheric;
		this.highIndex160 = highIndex160;
		this.highIndex167 = highIndex167;
		this.ultraHiIndex174 = ultraHiIndex174;
		this.scUvAr = scUvAr;
		this.blueShield = blueShield;
		this.transition = transition;
	}
}
