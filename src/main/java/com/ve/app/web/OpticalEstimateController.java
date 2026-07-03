package com.ve.app.web;

import com.ve.app.service.OpticalEstimateService;
import com.ve.app.service.OpticalStoreConfig;
import com.ve.app.service.OpticalStoreConfigService;
import com.ve.app.web.form.OpticalEstimateForm;
import java.math.BigDecimal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/optical-store/estimate")
public class OpticalEstimateController {

	private final OpticalStoreConfigService configService;
	private final OpticalEstimateService estimateService;

	public OpticalEstimateController(
			OpticalStoreConfigService configService,
			OpticalEstimateService estimateService) {
		this.configService = configService;
		this.estimateService = estimateService;
	}

	@GetMapping
	public String estimate(Model model) {
		populate(model, new OpticalEstimateForm(), null);
		return "optical-estimate";
	}

	@PostMapping
	public String calculate(
			@ModelAttribute OpticalEstimateForm opticalEstimateForm,
			BindingResult bindingResult,
			Model model) {
		OpticalStoreConfig config = configService.getConfig();
		validate(opticalEstimateForm, bindingResult);
		if (bindingResult.hasErrors()) {
			populate(model, opticalEstimateForm, null);
			return "optical-estimate";
		}
		populate(model, opticalEstimateForm, estimateService.calculate(opticalEstimateForm, config));
		return "optical-estimate";
	}

	private void populate(Model model, OpticalEstimateForm form, Object result) {
		OpticalStoreConfig config = configService.getConfig();
		model.addAttribute("opticalEstimateForm", form);
		model.addAttribute("config", config);
		model.addAttribute("estimateResult", result);
	}

	private void validate(OpticalEstimateForm form, BindingResult bindingResult) {
		rejectNegative(bindingResult, "insuranceDiscount", form.getInsuranceDiscount(), "Insurance discount cannot be negative.");
		rejectNegative(bindingResult, "framePrice", form.getFramePrice(), "Frame price cannot be negative.");
		rejectNegative(bindingResult, "selectedFrameDiscountPercent", form.getSelectedFrameDiscountPercent(), "Frame discount cannot be negative.");
		if (form.getSelectedFrameDiscountPercent() != null && form.getSelectedFrameDiscountPercent().compareTo(new BigDecimal("100")) > 0) {
			bindingResult.rejectValue("selectedFrameDiscountPercent", "discount.tooLarge", "Frame discount cannot be more than 100%.");
		}
		if (form.isBuyingLenses() && (form.getLensTypeName() == null || form.getLensTypeName().isBlank())) {
			bindingResult.rejectValue("lensTypeName", "lens.required", "Lens type is required when lenses are selected.");
		}
	}

	private void rejectNegative(BindingResult bindingResult, String field, BigDecimal value, String message) {
		if (value != null && value.compareTo(BigDecimal.ZERO) < 0) {
			bindingResult.rejectValue(field, "money.negative", message);
		}
	}
}
