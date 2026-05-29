package com.ve.app.web;

import com.ve.app.service.UserService;
import com.ve.app.web.form.ChangePasswordForm;
import java.security.Principal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class ChangePasswordController {

	private final UserService userService;

	public ChangePasswordController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/change-password")
	public String changePasswordForm(Model model) {
		model.addAttribute("changePasswordForm", new ChangePasswordForm());
		return "change-password";
	}

	@PostMapping("/change-password")
	public String changePassword(
			@ModelAttribute ChangePasswordForm form,
			Principal principal,
			Model model) {
		if (form.getCurrentPassword().isBlank()
				|| form.getNewPassword().isBlank()
				|| form.getConfirmPassword().isBlank()) {
			return formError(model, form, "All password fields are required.");
		}
		if (!form.getNewPassword().equals(form.getConfirmPassword())) {
			return formError(model, form, "New password and confirm password must match.");
		}

		try {
			userService.changePassword(principal.getName(), form.getCurrentPassword(), form.getNewPassword());
		}
		catch (IllegalArgumentException exception) {
			return formError(model, form, exception.getMessage());
		}
		return "redirect:/change-password?changed";
	}

	private String formError(Model model, ChangePasswordForm form, String message) {
		form.clearPasswords();
		model.addAttribute("formError", message);
		model.addAttribute("changePasswordForm", form);
		return "change-password";
	}
}
