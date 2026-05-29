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
import java.time.LocalDateTime;

@Entity
@Table(name = "prescription")
public class Prescription {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "intake_form_id", nullable = false)
	private IntakeForm intakeForm;

	@Column(name = "nct_righ", precision = 3, scale = 1)
	private BigDecimal nctRight;

	@Column(name = "nct_left", precision = 3, scale = 1)
	private BigDecimal nctLeft;

	@Column(name = "od_sph", columnDefinition = "TEXT")
	private String odSph;

	@Column(name = "od_cyl", columnDefinition = "TEXT")
	private String odCyl;

	@Column(name = "od_axis", columnDefinition = "TEXT")
	private String odAxis;

	@Column(name = "od_add", columnDefinition = "TEXT")
	private String odAdd;

	@Column(name = "od_remarks")
	private Integer odRemarks;

	@Column(name = "os_sph", columnDefinition = "TEXT")
	private String osSph;

	@Column(name = "os_cyl", columnDefinition = "TEXT")
	private String osCyl;

	@Column(name = "os_axis", columnDefinition = "TEXT")
	private String osAxis;

	@Column(name = "os_add", columnDefinition = "TEXT")
	private String osAdd;

	@Column(name = "os_remarks")
	private Integer osRemarks;

	@Column(name = "ou_remarks")
	private Integer ouRemarks;

	@Column(name = "c_od_sph", columnDefinition = "TEXT")
	private String cOdSph;

	@Column(name = "c_od_cyl", columnDefinition = "TEXT")
	private String cOdCyl;

	@Column(name = "c_od_axis", columnDefinition = "TEXT")
	private String cOdAxis;

	@Column(name = "c_od_add", columnDefinition = "TEXT")
	private String cOdAdd;

	@Column(name = "c_od_bc", columnDefinition = "TEXT")
	private String cOdBc;

	@Column(name = "c_od_dia", columnDefinition = "TEXT")
	private String cOdDia;

	@Column(name = "c_od_lens_mo", columnDefinition = "TEXT")
	private String cOdLensMo;

	@Column(name = "c_os_sph", columnDefinition = "TEXT")
	private String cOsSph;

	@Column(name = "c_os_cyl", columnDefinition = "TEXT")
	private String cOsCyl;

	@Column(name = "c_os_axis", columnDefinition = "TEXT")
	private String cOsAxis;

	@Column(name = "c_os_add", columnDefinition = "TEXT")
	private String cOsAdd;

	@Column(name = "c_os_bc", columnDefinition = "TEXT")
	private String cOsBc;

	@Column(name = "c_os_dia", columnDefinition = "TEXT")
	private String cOsDia;

	@Column(name = "c_os_lens_mo", columnDefinition = "TEXT")
	private String cOsLensMo;

	@Column(name = "prescribed_by", columnDefinition = "TEXT")
	private String prescribedBy;

	@Column(name = "prescribed_on")
	private LocalDateTime prescribedOn;

	protected Prescription() {
	}

	public Prescription(IntakeForm intakeForm) {
		this.intakeForm = intakeForm;
	}

	public Prescription(
			IntakeForm intakeForm,
			BigDecimal nctRight,
			BigDecimal nctLeft,
			String odSph,
			String odCyl,
			String odAxis,
			String odAdd,
			Integer odRemarks,
			String osSph,
			String osCyl,
			String osAxis,
			String osAdd,
			Integer osRemarks,
			Integer ouRemarks,
			String cOdSph,
			String cOdCyl,
			String cOdAxis,
			String cOdAdd,
			String cOdBc,
			String cOdDia,
			String cOdLensMo,
			String cOsSph,
			String cOsCyl,
			String cOsAxis,
			String cOsAdd,
			String cOsBc,
			String cOsDia,
			String cOsLensMo,
			String prescribedBy,
			LocalDateTime prescribedOn) {
		this.intakeForm = intakeForm;
		this.nctRight = nctRight;
		this.nctLeft = nctLeft;
		this.odSph = odSph;
		this.odCyl = odCyl;
		this.odAxis = odAxis;
		this.odAdd = odAdd;
		this.odRemarks = odRemarks;
		this.osSph = osSph;
		this.osCyl = osCyl;
		this.osAxis = osAxis;
		this.osAdd = osAdd;
		this.osRemarks = osRemarks;
		this.ouRemarks = ouRemarks;
		this.cOdSph = cOdSph;
		this.cOdCyl = cOdCyl;
		this.cOdAxis = cOdAxis;
		this.cOdAdd = cOdAdd;
		this.cOdBc = cOdBc;
		this.cOdDia = cOdDia;
		this.cOdLensMo = cOdLensMo;
		this.cOsSph = cOsSph;
		this.cOsCyl = cOsCyl;
		this.cOsAxis = cOsAxis;
		this.cOsAdd = cOsAdd;
		this.cOsBc = cOsBc;
		this.cOsDia = cOsDia;
		this.cOsLensMo = cOsLensMo;
		this.prescribedBy = prescribedBy;
		this.prescribedOn = prescribedOn;
	}

	public Long getId() {
		return id;
	}

	public BigDecimal getNctRight() {
		return nctRight;
	}

	public BigDecimal getNctLeft() {
		return nctLeft;
	}

	public String getOdSph() {
		return odSph;
	}

	public String getOdCyl() {
		return odCyl;
	}

	public String getOdAxis() {
		return odAxis;
	}

	public String getOdAdd() {
		return odAdd;
	}

	public Integer getOdRemarks() {
		return odRemarks;
	}

	public String getOsSph() {
		return osSph;
	}

	public String getOsCyl() {
		return osCyl;
	}

	public String getOsAxis() {
		return osAxis;
	}

	public String getOsAdd() {
		return osAdd;
	}

	public Integer getOsRemarks() {
		return osRemarks;
	}

	public Integer getOuRemarks() {
		return ouRemarks;
	}

	public String getCOdSph() {
		return cOdSph;
	}

	public String getCOdCyl() {
		return cOdCyl;
	}

	public String getCOdAxis() {
		return cOdAxis;
	}

	public String getCOdAdd() {
		return cOdAdd;
	}

	public String getCOdBc() {
		return cOdBc;
	}

	public String getCOdDia() {
		return cOdDia;
	}

	public String getCOdLensMo() {
		return cOdLensMo;
	}

	public String getCOsSph() {
		return cOsSph;
	}

	public String getCOsCyl() {
		return cOsCyl;
	}

	public String getCOsAxis() {
		return cOsAxis;
	}

	public String getCOsAdd() {
		return cOsAdd;
	}

	public String getCOsBc() {
		return cOsBc;
	}

	public String getCOsDia() {
		return cOsDia;
	}

	public String getCOsLensMo() {
		return cOsLensMo;
	}

	public String getPrescribedBy() {
		return prescribedBy;
	}

	public LocalDateTime getPrescribedOn() {
		return prescribedOn;
	}

	public void update(
			BigDecimal nctRight,
			BigDecimal nctLeft,
			String odSph,
			String odCyl,
			String odAxis,
			String odAdd,
			Integer odRemarks,
			String osSph,
			String osCyl,
			String osAxis,
			String osAdd,
			Integer osRemarks,
			Integer ouRemarks,
			String cOdSph,
			String cOdCyl,
			String cOdAxis,
			String cOdAdd,
			String cOdBc,
			String cOdDia,
			String cOdLensMo,
			String cOsSph,
			String cOsCyl,
			String cOsAxis,
			String cOsAdd,
			String cOsBc,
			String cOsDia,
			String cOsLensMo,
			String prescribedBy,
			LocalDateTime prescribedOn) {
		this.nctRight = nctRight;
		this.nctLeft = nctLeft;
		this.odSph = odSph;
		this.odCyl = odCyl;
		this.odAxis = odAxis;
		this.odAdd = odAdd;
		this.odRemarks = odRemarks;
		this.osSph = osSph;
		this.osCyl = osCyl;
		this.osAxis = osAxis;
		this.osAdd = osAdd;
		this.osRemarks = osRemarks;
		this.ouRemarks = ouRemarks;
		this.cOdSph = cOdSph;
		this.cOdCyl = cOdCyl;
		this.cOdAxis = cOdAxis;
		this.cOdAdd = cOdAdd;
		this.cOdBc = cOdBc;
		this.cOdDia = cOdDia;
		this.cOdLensMo = cOdLensMo;
		this.cOsSph = cOsSph;
		this.cOsCyl = cOsCyl;
		this.cOsAxis = cOsAxis;
		this.cOsAdd = cOsAdd;
		this.cOsBc = cOsBc;
		this.cOsDia = cOsDia;
		this.cOsLensMo = cOsLensMo;
		this.prescribedBy = prescribedBy;
		this.prescribedOn = prescribedOn;
	}
}
