package com.ve.app.web;

import com.ve.app.service.UserService;
import java.security.Principal;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalModelAttributes {

	private final UserService userService;

	public GlobalModelAttributes(UserService userService) {
		this.userService = userService;
	}

	@ModelAttribute("loggedInDisplayName")
	public String loggedInDisplayName(Principal principal) {
		return principal == null ? "" : userService.findDisplayNameByUsername(principal.getName());
	}

	@ModelAttribute("grantedAuthorities")
	public Set<String> grantedAuthorities(Authentication authentication) {
		if (authentication == null) {
			return Collections.emptySet();
		}
		return authentication.getAuthorities().stream()
				.map(authority -> authority.getAuthority())
				.collect(Collectors.toSet());
	}
}
