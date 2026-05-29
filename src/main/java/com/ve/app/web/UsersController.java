package com.ve.app.web;

import com.ve.app.model.User;
import com.ve.app.service.UserService;
import com.ve.app.web.form.CreateUserForm;
import com.ve.app.web.form.EditUserForm;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/users")
public class UsersController {

	private final UserService userService;

	public UsersController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	public String listUsers(
			@RequestParam(defaultValue = "") String search,
			@RequestParam(defaultValue = "0") int page,
			Model model) {
		String normalizedSearch = search.trim();
		Page<User> users = userService.findUsers(normalizedSearch, page);

		model.addAttribute("users", users);
		model.addAttribute("search", normalizedSearch);
		return "users";
	}

	@GetMapping("/create")
	public String createUserForm(Model model) {
		populateCreateForm(model, new CreateUserForm());
		return "user-create";
	}

	@PostMapping("/create")
	public String createUser(
			@ModelAttribute CreateUserForm form,
			Model model) {
		if (form.getDisplayName().isBlank() || form.getUsername().isBlank() || form.getPassword().isBlank()) {
			model.addAttribute("formError", "Display name, username, and password are required.");
			form.setPassword("");
			populateCreateForm(model, form);
			return "user-create";
		}
		if (userService.usernameExists(form.getUsername())) {
			model.addAttribute("formError", "Username already exists.");
			form.setPassword("");
			populateCreateForm(model, form);
			return "user-create";
		}

		try {
			userService.createUser(
					form.getDisplayName(),
					form.getUsername(),
					form.getPassword(),
					form.getPermissionIds());
		}
		catch (IllegalArgumentException exception) {
			model.addAttribute("formError", exception.getMessage());
			form.setPassword("");
			populateCreateForm(model, form);
			return "user-create";
		}
		return "redirect:/users?created";
	}

	@PostMapping("/{userId}/active")
	public String updateUserActiveStatus(
			@PathVariable long userId,
			@RequestParam boolean active,
			@RequestParam(defaultValue = "") String search,
			@RequestParam(defaultValue = "0") int page,
			RedirectAttributes redirectAttributes) {
		userService.setUserActive(userId, active);
		redirectAttributes.addAttribute("search", search);
		redirectAttributes.addAttribute("page", Math.max(0, page));
		redirectAttributes.addAttribute("statusChanged", "");
		return "redirect:/users";
	}

	@GetMapping("/{userId}/edit")
	public String editUserForm(@PathVariable long userId, Model model) {
		User user = userService.findUserForEdit(userId);
		List<Long> availablePermissionIds = userService.findAvailablePermissions().stream()
				.map(permission -> permission.getId())
				.toList();
		EditUserForm form = new EditUserForm();
		form.setDisplayName(user.getDisplayName());
		form.setUsername(user.getUsername());
		form.setPermissionIds(user.getPermissions().stream()
				.map(permission -> permission.getId())
				.filter(availablePermissionIds::contains)
				.toList());

		populateEditForm(model, userId, form);
		return "user-edit";
	}

	@PostMapping("/{userId}/edit")
	public String editUser(
			@PathVariable long userId,
			@ModelAttribute EditUserForm form,
			Model model) {
		if (form.getDisplayName().isBlank()) {
			model.addAttribute("formError", "Display name is required.");
			form.setUsername(userService.findUserForEdit(userId).getUsername());
			populateEditForm(model, userId, form);
			return "user-edit";
		}

		userService.updateUser(userId, form.getDisplayName(), form.getPermissionIds());
		return "redirect:/users?updated";
	}

	private void populateCreateForm(Model model, CreateUserForm form) {
		model.addAttribute("createUserForm", form);
		model.addAttribute("permissions", userService.findAvailablePermissions());
	}

	private void populateEditForm(Model model, long userId, EditUserForm form) {
		model.addAttribute("userId", userId);
		model.addAttribute("editUserForm", form);
		model.addAttribute("permissions", userService.findAvailablePermissions());
	}
}
