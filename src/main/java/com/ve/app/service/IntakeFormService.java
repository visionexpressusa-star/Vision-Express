package com.ve.app.service;

import com.ve.app.model.ChecklistItem;
import com.ve.app.model.IntakeForm;
import com.ve.app.model.LensRecommendation;
import com.ve.app.model.Prescription;
import com.ve.app.model.ReferralSource;
import com.ve.app.repository.ChecklistItemRepository;
import com.ve.app.repository.IntakeFormRepository;
import com.ve.app.repository.LensRecommendationRepository;
import com.ve.app.repository.PrescriptionRepository;
import com.ve.app.repository.ReferralSourceRepository;
import com.ve.app.web.form.CreateIntakeFormForm;
import com.ve.app.web.form.CreatePrescriptionForm;
import com.ve.app.web.view.IntakeFormListItem;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IntakeFormService {

	private static final int PAGE_SIZE = 10;
	private static final Set<String> VALID_VISUAL_ACUITIES =
			Set.of("20/20", "20/25", "20/30", "20/40", "20/50", "20/60", "20/70", "20/80");

	private final IntakeFormRepository intakeFormRepository;
	private final ChecklistItemRepository checklistItemRepository;
	private final PrescriptionRepository prescriptionRepository;
	private final LensRecommendationRepository lensRecommendationRepository;
	private final ReferralSourceRepository referralSourceRepository;

	public IntakeFormService(
			IntakeFormRepository intakeFormRepository,
			ChecklistItemRepository checklistItemRepository,
			PrescriptionRepository prescriptionRepository,
			LensRecommendationRepository lensRecommendationRepository,
			ReferralSourceRepository referralSourceRepository) {
		this.intakeFormRepository = intakeFormRepository;
		this.checklistItemRepository = checklistItemRepository;
		this.prescriptionRepository = prescriptionRepository;
		this.lensRecommendationRepository = lensRecommendationRepository;
		this.referralSourceRepository = referralSourceRepository;
	}

	@Transactional(readOnly = true)
	public Page<IntakeFormListItem> findIntakeForms(String search, int page) {
		return intakeFormRepository.searchListItems(
				search.trim(),
				PageRequest.of(Math.max(0, page), PAGE_SIZE));
	}

	@Transactional(readOnly = true)
	public List<ChecklistItem> findChecklistItems() {
		return checklistItemRepository.findAllByOrderBySortNumberAsc();
	}

	@Transactional(readOnly = true)
	public List<ReferralSource> findReferralSources() {
		return referralSourceRepository.findAllByOrderByIdAsc();
	}

	@Transactional(readOnly = true)
	public IntakeForm findIntakeForm(long intakeFormId) {
		return intakeFormRepository.findById(intakeFormId)
				.orElseThrow(() -> new IllegalArgumentException("Intake form was not found."));
	}

	@Transactional(readOnly = true)
	public CreatePrescriptionForm findPrescriptionForm(long intakeFormId) {
		return prescriptionRepository.findFirstByIntakeFormIdOrderByIdDesc(intakeFormId)
				.map(prescription -> CreatePrescriptionForm.from(
						prescription,
						lensRecommendationRepository.findByPrescriptionId(prescription.getId()).orElse(null)))
				.orElseGet(CreatePrescriptionForm::new);
	}

	@Transactional(readOnly = true)
	public Optional<String> findPrescriptionPrescribedBy(long intakeFormId) {
		return prescriptionRepository.findFirstByIntakeFormIdOrderByIdDesc(intakeFormId)
				.map(Prescription::getPrescribedBy);
	}

	@Transactional(readOnly = true)
	public Optional<LocalDateTime> findPrescriptionPrescribedOn(long intakeFormId) {
		return prescriptionRepository.findFirstByIntakeFormIdOrderByIdDesc(intakeFormId)
				.map(Prescription::getPrescribedOn);
	}

	@Transactional
	public void createIntakeForm(CreateIntakeFormForm form, String createdBy) {
		Long accountId = requiredAccountId(form.getAccountId());
		String fullName = requiredText(form.getFullName(), "Patient name is required.");
		BigDecimal pdRight = requiredPd(form.getPdRight(), "PD Right");
		BigDecimal pdLeft = requiredPd(form.getPdLeft(), "PD Left");
		String vaRight = requiredVisualAcuity(form.getVaRight(), "Right");
		String vaLeft = requiredVisualAcuity(form.getVaLeft(), "Left");
		String vaBoth = requiredVisualAcuity(form.getVaBoth(), "Both");
		ReferralSource referralSource = requiredReferralSource(form.getReferralSourceId());
		List<ChecklistItem> checklistItems = findChecklistItems();
		if (!form.getCheckedChecklistItemIds().containsAll(checklistItems.stream().map(ChecklistItem::getId).toList())) {
			throw new IllegalArgumentException("All checklist items must be checked before saving.");
		}

		intakeFormRepository.save(new IntakeForm(
				accountId,
				fullName,
				form.isRetinalImagingRequired(),
				form.isDoingEyeglasses(),
				form.isDoingContactLens(),
				form.isHasInsurance(),
				form.isAided(),
				pdLeft,
				pdRight,
				vaRight,
				vaLeft,
				vaBoth,
				nullIfBlank(form.getInsuranceName()),
				referralSource,
				createdBy,
				LocalDateTime.now()));
	}

	@Transactional
	public void createPrescription(long intakeFormId, CreatePrescriptionForm form, String prescribedBy) {
		IntakeForm intakeForm = findIntakeForm(intakeFormId);
		Prescription prescription = prescriptionRepository.findFirstByIntakeFormIdOrderByIdDesc(intakeFormId)
				.orElseGet(() -> new Prescription(intakeForm));
		prescription.update(
				optionalDecimal(form.getNctRight(), "NCT Right"),
				optionalDecimal(form.getNctLeft(), "NCT Left"),
				nullIfBlank(form.getOdSph()),
				nullIfBlank(form.getOdCyl()),
				nullIfBlank(form.getOdAxis()),
				nullIfBlank(form.getOdAdd()),
				optionalRemarks(form.getOdRemarks(), "OD remarks"),
				nullIfBlank(form.getOsSph()),
				nullIfBlank(form.getOsCyl()),
				nullIfBlank(form.getOsAxis()),
				nullIfBlank(form.getOsAdd()),
				optionalRemarks(form.getOsRemarks(), "OS remarks"),
				optionalRemarks(form.getOuRemarks(), "OU remarks"),
				nullIfBlank(form.getCOdSph()),
				nullIfBlank(form.getCOdCyl()),
				nullIfBlank(form.getCOdAxis()),
				nullIfBlank(form.getCOdAdd()),
				nullIfBlank(form.getCOdBc()),
				nullIfBlank(form.getCOdDia()),
				nullIfBlank(form.getCOdLensMo()),
				nullIfBlank(form.getCOsSph()),
				nullIfBlank(form.getCOsCyl()),
				nullIfBlank(form.getCOsAxis()),
				nullIfBlank(form.getCOsAdd()),
				nullIfBlank(form.getCOsBc()),
				nullIfBlank(form.getCOsDia()),
				nullIfBlank(form.getCOsLensMo()),
				prescribedBy,
				LocalDateTime.now());
		Prescription savedPrescription = prescriptionRepository.save(prescription);

		LensRecommendation recommendation = lensRecommendationRepository.findByPrescriptionId(savedPrescription.getId())
				.orElseGet(() -> new LensRecommendation(
						savedPrescription,
						false,
						false,
						false,
						false,
						false,
						false,
						false,
						false,
						false,
						false,
						false,
						false,
						false));
		recommendation.update(
				form.isSv(),
				form.isBifocal(),
				form.isBlendedBifocal(),
				form.isProgressive(),
				form.isPlastic(),
				form.isPoly(),
				form.isPolyAspheric(),
				form.isHighIndex167(),
				form.isUltraHiIndex174(),
				form.isScUvAr(),
				form.isBlueShield(),
				form.isTransition(),
				form.isDryEyeDrop());
		lensRecommendationRepository.save(recommendation);
	}

	private Long requiredAccountId(String input) {
		try {
			return Long.valueOf(requiredText(input, "Account ID is required."));
		}
		catch (NumberFormatException exception) {
			throw new IllegalArgumentException("Account ID must be a number.");
		}
	}

	private BigDecimal requiredPd(String input, String fieldName) {
		try {
			BigDecimal value = new BigDecimal(requiredText(input, fieldName + " is required."));
			if (value.signum() < 0 || value.precision() - value.scale() > 2 || value.scale() > 1) {
				throw new IllegalArgumentException(fieldName + " must be a number in the format XX.X.");
			}
			return value;
		}
		catch (NumberFormatException exception) {
			throw new IllegalArgumentException(fieldName + " must be a number in the format XX.X.");
		}
	}

	private BigDecimal optionalDecimal(String input, String fieldName) {
		if (input == null || input.isBlank()) {
			return null;
		}
		try {
			BigDecimal value = new BigDecimal(input.trim());
			if (value.signum() < 0 || value.precision() - value.scale() > 2 || value.scale() > 1) {
				throw new IllegalArgumentException(fieldName + " must be a number in the format XX.X.");
			}
			return value;
		}
		catch (NumberFormatException exception) {
			throw new IllegalArgumentException(fieldName + " must be a number in the format XX.X.");
		}
	}

	private Integer optionalRemarks(String input, String fieldName) {
		if (input == null || input.isBlank()) {
			return null;
		}
		try {
			int value = Integer.parseInt(input.trim());
			if (value < 20 || value > 80) {
				throw new IllegalArgumentException(fieldName + " must be between 20 and 80.");
			}
			return value;
		}
		catch (NumberFormatException exception) {
			throw new IllegalArgumentException(fieldName + " must be a number between 20 and 80.");
		}
	}

	private String requiredVisualAcuity(String value, String eyeName) {
		if (!VALID_VISUAL_ACUITIES.contains(value)) {
			throw new IllegalArgumentException("Visual acuity is required for " + eyeName + ".");
		}
		return value;
	}

	private ReferralSource requiredReferralSource(Long referralSourceId) {
		if (referralSourceId == null) {
			throw new IllegalArgumentException("Referral source is required.");
		}
		return referralSourceRepository.findById(referralSourceId)
				.orElseThrow(() -> new IllegalArgumentException("Please select a valid referral source."));
	}

	private String requiredText(String input, String message) {
		if (input == null || input.isBlank()) {
			throw new IllegalArgumentException(message);
		}
		return input.trim();
	}

	private String nullIfBlank(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
