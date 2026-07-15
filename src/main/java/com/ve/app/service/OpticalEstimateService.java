package com.ve.app.service;

import com.ve.app.web.form.OpticalEstimateForm;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class OpticalEstimateService {

	private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

	public OpticalEstimateResult calculate(OpticalEstimateForm form, OpticalStoreConfig config) {
		normalizeSelections(form);
		OpticalEstimateResult result = new OpticalEstimateResult();
		boolean hasInsurance = Boolean.TRUE.equals(form.getHasInsurance());
		boolean completeGlasses = form.isBuyingLenses() && (form.isBuyingFrame() || form.isBuyingPof());
		boolean examDiscountEligible = form.isBuyingLenses() && form.isBuyingFrame();

		BigDecimal eyeExamPrice = moneyOrZero(config.getEyeExamPrice());
		BigDecimal framePrice = form.isBuyingFrame() ? moneyOrZero(form.getFramePrice()) : BigDecimal.ZERO;
		BigDecimal pofCharge = form.isBuyingPof() ? moneyOrZero(config.getPofCharge()) : BigDecimal.ZERO;
		LensPrice selectedLens = findLensPrice(form, config).orElse(null);
		BigDecimal lensPrice = selectedLens == null ? BigDecimal.ZERO : moneyOrZero(selectedLens.price());
		LensOptionCharge selectedLensOption = findLensOption(form, config).orElse(null);
		BigDecimal lensOptionCharge = selectedLensOption == null ? BigDecimal.ZERO : moneyOrZero(selectedLensOption.charge());
		LensProtectionCoating selectedCoating = findLensProtectionCoating(form, config).orElse(null);
		BigDecimal lensProtectionCoatingPrice = selectedCoating == null ? BigDecimal.ZERO : moneyOrZero(selectedCoating.price());
		LensTransitionOption selectedTransition = findLensTransitionOption(form, config).orElse(null);
		BigDecimal lensTransitionOptionPrice = selectedTransition == null ? BigDecimal.ZERO : moneyOrZero(selectedTransition.price());

		if (form.isBuyingEyeExam()) {
			add(result, "Eye exam", eyeExamPrice);
		}
		if (form.isBuyingFrame()) {
			add(result, "Frame", framePrice);
		}
		if (form.isBuyingPof()) {
			add(result, "POF", pofCharge);
		}
		if (form.isBuyingLenses() && selectedLens != null) {
			add(result, selectedLens.name(), lensPrice);
		}
		if (form.isBuyingLenses()
				&& completeGlasses
				&& selectedLensOption != null
				&& lensOptionCharge.compareTo(BigDecimal.ZERO) > 0) {
			add(result, selectedLensOption.name(), lensOptionCharge);
		}
		if (form.isBuyingLenses()
				&& selectedCoating != null
				&& lensProtectionCoatingPrice.compareTo(BigDecimal.ZERO) > 0) {
			add(result, selectedCoating.name(), lensProtectionCoatingPrice);
		}
		if (form.isBuyingLenses()
				&& selectedTransition != null
				&& lensTransitionOptionPrice.compareTo(BigDecimal.ZERO) > 0) {
			add(result, selectedTransition.name(), lensTransitionOptionPrice);
		}

		if (hasInsurance) {
			addDiscount(result, "Insurance discount", moneyOrZero(form.getInsuranceDiscount()));
			finish(result);
			return result;
		}

		if (form.isBuyingEyeExam() && examDiscountEligible) {
			addDiscount(result, "Exam discount", capped(config.getExamDiscountWithCompleteGlasses(), eyeExamPrice));
		}
		if (!form.isBuyingEyeExam()
				&& form.isBuyingLenses()
				&& "OUTSIDE_RX".equals(form.getPrescriptionSource())) {
			addDiscount(result, "Outside Rx discount", capped(config.getOutsidePrescriptionDiscount(), lensPrice));
		}
		if (form.isBuyingFrame()
				&& form.isBuyingLenses()
				&& hasPrescriptionSource(form)) {
			BigDecimal frameDiscount = framePrice
					.multiply(moneyOrZero(form.getSelectedFrameDiscountPercent()))
					.divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
			addDiscount(result, "Frame discount", capped(frameDiscount, framePrice));
		}
		if (form.isBuyingLenses()) {
			addDiscount(result, "Lens discount", capped(config.getLensDiscountWithoutInsurance(), lensPrice));
		}

		finish(result);
		return result;
	}

	private void normalizeSelections(OpticalEstimateForm form) {
		if (form.isBuyingFrame() && form.isBuyingPof()) {
			form.setBuyingPof(false);
		}
		if ("OUTSIDE_RX".equals(form.getPrescriptionSource())) {
			form.setBuyingEyeExam(false);
		}
		else if (form.isBuyingEyeExam() || "EXAM_HERE".equals(form.getPrescriptionSource())) {
			form.setBuyingEyeExam(true);
			form.setPrescriptionSource("EXAM_HERE");
		}
	}

	private Optional<LensPrice> findLensPrice(OpticalEstimateForm form, OpticalStoreConfig config) {
		if (form.getLensTypeName() == null || form.getLensTypeName().isBlank()) {
			return Optional.empty();
		}
		return config.getLensPrices().stream()
				.filter(lens -> lens.name().equals(form.getLensTypeName()))
				.findFirst();
	}

	private Optional<LensOptionCharge> findLensOption(OpticalEstimateForm form, OpticalStoreConfig config) {
		if (form.getLensOptionName() == null || form.getLensOptionName().isBlank()) {
			return Optional.empty();
		}
		return config.getLensOptionCharges().stream()
				.filter(option -> option.name().equals(form.getLensOptionName()))
				.findFirst();
	}

	private Optional<LensProtectionCoating> findLensProtectionCoating(OpticalEstimateForm form, OpticalStoreConfig config) {
		if (form.getLensProtectionCoatingName() == null || form.getLensProtectionCoatingName().isBlank()) {
			return Optional.empty();
		}
		return config.getLensProtectionCoatings().stream()
				.filter(coating -> coating.name().equals(form.getLensProtectionCoatingName()))
				.findFirst();
	}

	private Optional<LensTransitionOption> findLensTransitionOption(OpticalEstimateForm form, OpticalStoreConfig config) {
		if (form.getLensTransitionOptionName() == null || form.getLensTransitionOptionName().isBlank()) {
			return Optional.empty();
		}
		return config.getLensTransitionOptions().stream()
				.filter(option -> option.name().equals(form.getLensTransitionOptionName()))
				.findFirst();
	}

	private boolean hasPrescriptionSource(OpticalEstimateForm form) {
		return "EXAM_HERE".equals(form.getPrescriptionSource()) || "OUTSIDE_RX".equals(form.getPrescriptionSource());
	}

	private void add(OpticalEstimateResult result, String label, BigDecimal amount) {
		BigDecimal normalized = moneyOrZero(amount).setScale(2, RoundingMode.HALF_UP);
		result.getLineItems().add(new EstimateLineItem(label, normalized));
	}

	private void addDiscount(OpticalEstimateResult result, String label, BigDecimal amount) {
		BigDecimal normalized = moneyOrZero(amount).setScale(2, RoundingMode.HALF_UP);
		if (normalized.compareTo(BigDecimal.ZERO) > 0) {
			result.getLineItems().add(new EstimateLineItem(label, normalized.negate()));
		}
	}

	private void finish(OpticalEstimateResult result) {
		BigDecimal subtotal = result.getLineItems().stream()
				.map(EstimateLineItem::amount)
				.filter(amount -> amount.compareTo(BigDecimal.ZERO) > 0)
				.reduce(BigDecimal.ZERO, BigDecimal::add)
				.setScale(2, RoundingMode.HALF_UP);
		BigDecimal totalDiscount = result.getLineItems().stream()
				.map(EstimateLineItem::amount)
				.filter(amount -> amount.compareTo(BigDecimal.ZERO) < 0)
				.map(BigDecimal::abs)
				.reduce(BigDecimal.ZERO, BigDecimal::add)
				.setScale(2, RoundingMode.HALF_UP);
		BigDecimal total = result.getLineItems().stream()
				.map(EstimateLineItem::amount)
				.reduce(BigDecimal.ZERO, BigDecimal::add)
				.max(BigDecimal.ZERO)
				.setScale(2, RoundingMode.HALF_UP);
		result.setSubtotal(subtotal);
		result.setTotalDiscount(totalDiscount);
		result.setTotal(total);
	}

	private BigDecimal capped(BigDecimal amount, BigDecimal cap) {
		BigDecimal normalizedAmount = moneyOrZero(amount);
		BigDecimal normalizedCap = moneyOrZero(cap);
		return normalizedAmount.min(normalizedCap).max(BigDecimal.ZERO);
	}

	private BigDecimal moneyOrZero(BigDecimal value) {
		return value == null ? BigDecimal.ZERO : value;
	}
}
