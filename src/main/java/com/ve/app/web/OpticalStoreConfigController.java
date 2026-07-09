package com.ve.app.web;

import com.ve.app.service.OpticalStoreConfigService;
import com.ve.app.web.form.FrameDiscountOptionForm;
import com.ve.app.web.form.LensOptionChargeForm;
import com.ve.app.web.form.LensPriceForm;
import com.ve.app.web.form.LensProtectionCoatingForm;
import com.ve.app.web.form.OpticalStoreConfigForm;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/optical-store/config")
public class OpticalStoreConfigController {

	private final OpticalStoreConfigService configService;

	public OpticalStoreConfigController(OpticalStoreConfigService configService) {
		this.configService = configService;
	}

	@GetMapping
	public String config(Model model) {
		model.addAttribute("opticalStoreConfigForm", configService.getConfigForm());
		return "optical-store-config";
	}

	@PostMapping
	public String updateConfig(
			@ModelAttribute OpticalStoreConfigForm opticalStoreConfigForm,
			BindingResult bindingResult,
			Model model) {
		validate(opticalStoreConfigForm, bindingResult);
		if (bindingResult.hasErrors()) {
			model.addAttribute("opticalStoreConfigForm", opticalStoreConfigForm);
			return "optical-store-config";
		}
		configService.updateConfig(opticalStoreConfigForm);
		return "redirect:/optical-store/config?saved";
	}

	private void validate(OpticalStoreConfigForm form, BindingResult bindingResult) {
		rejectNegative(bindingResult, "eyeExamPrice", form.getEyeExamPrice(), "Eye exam price cannot be negative.");
		rejectNegative(bindingResult, "examDiscountWithCompleteGlasses", form.getExamDiscountWithCompleteGlasses(), "Exam discount cannot be negative.");
		rejectNegative(bindingResult, "outsidePrescriptionDiscount", form.getOutsidePrescriptionDiscount(), "Outside prescription discount cannot be negative.");
		rejectNegative(bindingResult, "lensDiscountWithoutInsurance", form.getLensDiscountWithoutInsurance(), "Lens discount cannot be negative.");
		rejectNegative(bindingResult, "pofCharge", form.getPofCharge(), "POF charge cannot be negative.");

		List<FrameDiscountOptionForm> frameDiscountOptions = nullToList(form.getFrameDiscountOptions());
		for (int index = 0; index < frameDiscountOptions.size(); index++) {
			FrameDiscountOptionForm option = frameDiscountOptions.get(index);
			String field = "frameDiscountOptions[" + index + "].percent";
			rejectNegative(bindingResult, field, option.getPercent(), "Frame discount cannot be negative.");
			if (option.getPercent() != null && option.getPercent().compareTo(new BigDecimal("100")) > 0) {
				bindingResult.rejectValue(field, "discount.tooLarge", "Frame discount cannot be more than 100%.");
			}
		}
		List<LensOptionChargeForm> lensOptionCharges = nullToList(form.getLensOptionCharges());
		for (int index = 0; index < lensOptionCharges.size(); index++) {
			LensOptionChargeForm option = lensOptionCharges.get(index);
			rejectNegative(bindingResult, "lensOptionCharges[" + index + "].charge", option.getCharge(), option.getName() + " charge cannot be negative.");
		}
		List<LensProtectionCoatingForm> lensProtectionCoatings = nullToList(form.getLensProtectionCoatings());
		for (int index = 0; index < lensProtectionCoatings.size(); index++) {
			LensProtectionCoatingForm coating = lensProtectionCoatings.get(index);
			boolean hasName = coating.getName() != null && !coating.getName().isBlank();
			boolean hasPrice = coating.getPrice() != null;
			if (hasName || hasPrice) {
				if (!hasName) {
					bindingResult.rejectValue("lensProtectionCoatings[" + index + "].name", "coating.name.required", "Coating name is required.");
				}
				if (!hasPrice) {
					bindingResult.rejectValue("lensProtectionCoatings[" + index + "].price", "coating.price.required", "Coating price is required.");
				}
				rejectNegative(bindingResult, "lensProtectionCoatings[" + index + "].price", coating.getPrice(), "Coating price cannot be negative.");
			}
		}
		List<LensPriceForm> lensPrices = nullToList(form.getLensPrices());
		for (int index = 0; index < lensPrices.size(); index++) {
			LensPriceForm lens = lensPrices.get(index);
			boolean hasName = lens.getName() != null && !lens.getName().isBlank();
			boolean hasPrice = lens.getPrice() != null;
			if (hasName || hasPrice) {
				if (!hasName) {
					bindingResult.rejectValue("lensPrices[" + index + "].name", "lens.name.required", "Lens type name is required.");
				}
				if (!hasPrice) {
					bindingResult.rejectValue("lensPrices[" + index + "].price", "lens.price.required", "Lens price is required.");
				}
				rejectNegative(bindingResult, "lensPrices[" + index + "].price", lens.getPrice(), "Lens price cannot be negative.");
			}
		}
	}

	private void rejectNegative(BindingResult bindingResult, String field, BigDecimal value, String message) {
		if (value != null && value.compareTo(BigDecimal.ZERO) < 0) {
			bindingResult.rejectValue(field, "money.negative", message);
		}
	}

	private <T> List<T> nullToList(List<T> value) {
		return value == null ? Collections.emptyList() : value;
	}
}
