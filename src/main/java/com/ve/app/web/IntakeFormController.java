package com.ve.app.web;

import com.ve.app.model.IntakeForm;
import com.ve.app.service.IntakeFormPdfService;
import com.ve.app.service.IntakeFormService;
import com.ve.app.service.UserService;
import com.ve.app.web.form.CreateIntakeFormForm;
import com.ve.app.web.form.CreatePrescriptionForm;
import com.ve.app.web.view.IntakeFormListItem;
import java.security.Principal;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/intake-form")
public class IntakeFormController {

	private final IntakeFormService intakeFormService;
	private final UserService userService;
	private final IntakeFormPdfService intakeFormPdfService;

	public IntakeFormController(
			IntakeFormService intakeFormService,
			UserService userService,
			IntakeFormPdfService intakeFormPdfService) {
		this.intakeFormService = intakeFormService;
		this.userService = userService;
		this.intakeFormPdfService = intakeFormPdfService;
	}

	@GetMapping
	public String listIntakeForms(
			@RequestParam(defaultValue = "") String search,
			@RequestParam(defaultValue = "0") int page,
			Model model) {
		String normalizedSearch = search.trim();
		Page<IntakeFormListItem> intakeForms = intakeFormService.findIntakeForms(normalizedSearch, page);

		model.addAttribute("intakeForms", intakeForms);
		model.addAttribute("search", normalizedSearch);
		return "intake-form";
	}

	@GetMapping("/create")
	public String createIntakeForm(Model model) {
		populateCreateForm(model, new CreateIntakeFormForm());
		return "intake-form-create";
	}

	@PostMapping("/create")
	public String createIntakeForm(
			@ModelAttribute CreateIntakeFormForm form,
			Principal principal,
			Model model) {
		try {
			intakeFormService.createIntakeForm(
					form,
					userService.findDisplayNameByUsername(principal.getName()));
		}
		catch (IllegalArgumentException exception) {
			model.addAttribute("formError", exception.getMessage());
			populateCreateForm(model, form);
			return "intake-form-create";
		}
		return "redirect:/intake-form?created";
	}

	@GetMapping("/{intakeFormId}/view")
	public String viewIntakeForm(@PathVariable long intakeFormId, Model model) {
		model.addAttribute("intakeForm", intakeFormService.findIntakeForm(intakeFormId));
		model.addAttribute("prescriptionForm", intakeFormService.findPrescriptionForm(intakeFormId));
		model.addAttribute("prescribedBy", intakeFormService.findPrescriptionPrescribedBy(intakeFormId)
				.filter(value -> !value.isBlank())
				.orElse("-"));
		model.addAttribute("prescribedOn", intakeFormService.findPrescriptionPrescribedOn(intakeFormId).orElse(null));
		return "intake-form-view";
	}

	@GetMapping("/{intakeFormId}/view/pdf")
	public ResponseEntity<byte[]> viewIntakeFormPdf(@PathVariable long intakeFormId) {
		IntakeForm intakeForm = intakeFormService.findIntakeForm(intakeFormId);
		CreatePrescriptionForm prescriptionForm = intakeFormService.findPrescriptionForm(intakeFormId);
		String prescribedBy = intakeFormService.findPrescriptionPrescribedBy(intakeFormId)
				.filter(value -> !value.isBlank())
				.orElse("-");
		LocalDateTime prescribedOn = intakeFormService.findPrescriptionPrescribedOn(intakeFormId).orElse(null);
		byte[] pdf = intakeFormPdfService.generate(intakeForm, prescriptionForm, prescribedBy, prescribedOn);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"intake-form-" + intakeForm.getAccountId() + ".pdf\"")
				.contentType(MediaType.APPLICATION_PDF)
				.body(pdf);
	}

	@GetMapping("/{intakeFormId}/prescription/create")
	public String addPrescription(@PathVariable long intakeFormId, Principal principal, Model model) {
		populatePrescriptionForm(model, intakeFormId, intakeFormService.findPrescriptionForm(intakeFormId), principal);
		return "prescription-create";
	}

	@PostMapping("/{intakeFormId}/prescription/create")
	public String createPrescription(
			@PathVariable long intakeFormId,
			@ModelAttribute("prescriptionForm") CreatePrescriptionForm form,
			Principal principal,
			Model model) {
		try {
			intakeFormService.createPrescription(
					intakeFormId,
					form,
					userService.findDisplayNameByUsername(principal.getName()));
		}
		catch (IllegalArgumentException exception) {
			model.addAttribute("formError", exception.getMessage());
			populatePrescriptionForm(model, intakeFormId, form, principal);
			return "prescription-create";
		}
		return "redirect:/intake-form/" + intakeFormId + "/prescription/create?saved";
	}

	private void populateCreateForm(Model model, CreateIntakeFormForm form) {
		model.addAttribute("createIntakeFormForm", form);
		model.addAttribute("checklistItems", intakeFormService.findChecklistItems());
	}

	private void populatePrescriptionForm(Model model, long intakeFormId, CreatePrescriptionForm form, Principal principal) {
		String currentDisplayName = userService.findDisplayNameByUsername(principal.getName());
		model.addAttribute("intakeForm", intakeFormService.findIntakeForm(intakeFormId));
		model.addAttribute("prescriptionForm", form);
		model.addAttribute("prescribedBy", intakeFormService.findPrescriptionPrescribedBy(intakeFormId)
				.filter(value -> !value.isBlank())
				.orElse(currentDisplayName));
		model.addAttribute("prescribedOn", intakeFormService.findPrescriptionPrescribedOn(intakeFormId)
				.orElseGet(LocalDateTime::now));
	}
}
