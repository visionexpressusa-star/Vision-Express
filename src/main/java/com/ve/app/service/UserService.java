package com.ve.app.service;

import com.ve.app.model.Permission;
import com.ve.app.model.Role;
import com.ve.app.model.User;
import com.ve.app.repository.PermissionRepository;
import com.ve.app.repository.RoleRepository;
import com.ve.app.repository.UserRepository;
import java.util.HashSet;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

	private static final int PAGE_SIZE = 10;
	private static final String DEFAULT_USER_ROLE = "NON_ADMIN";
	private static final String ADMIN_ONLY_PERMISSION = "users";

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PermissionRepository permissionRepository;
	private final PasswordEncoder passwordEncoder;

	public UserService(
			UserRepository userRepository,
			RoleRepository roleRepository,
			PermissionRepository permissionRepository,
			PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.permissionRepository = permissionRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public Page<User> findUsers(String search, int page) {
		return userRepository.search(
				search.trim(),
				PageRequest.of(Math.max(0, page), PAGE_SIZE));
	}

	@Transactional(readOnly = true)
	public String findDisplayNameByUsername(String username) {
		return userRepository.findByUsername(username)
				.map(User::getDisplayName)
				.orElse(username);
	}

	@Transactional(readOnly = true)
	public List<Permission> findAvailablePermissions() {
		return permissionRepository.findAllByNameNotOrderByNameAsc(ADMIN_ONLY_PERMISSION);
	}

	@Transactional(readOnly = true)
	public boolean usernameExists(String username) {
		return userRepository.existsByUsername(username.trim());
	}

	@Transactional
	public void createUser(String displayName, String usernameInput, String rawPassword, List<Long> permissionIds) {
		String username = usernameInput.trim();
		if (userRepository.existsByUsername(username)) {
			throw new IllegalArgumentException("Username already exists.");
		}

		Role role = roleRepository.findByName(DEFAULT_USER_ROLE)
				.orElseThrow(() -> new IllegalStateException("Default role NON_ADMIN was not found."));
		List<Permission> permissions = permissionRepository.findAllByIdInAndNameNot(
				permissionIds,
				ADMIN_ONLY_PERMISSION);
		User user = new User(
				role,
				username,
				passwordEncoder.encode(rawPassword),
				displayName.trim(),
				true,
				new HashSet<>(permissions));

		userRepository.save(user);
	}

	@Transactional
	public void setUserActive(long userId, boolean active) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("User was not found."));
		if ("ADMIN".equals(user.getRole().getName())) {
			throw new IllegalArgumentException("Admin users cannot be activated or deactivated.");
		}
		user.setActive(active);
	}

	@Transactional(readOnly = true)
	public User findUserForEdit(long userId) {
		return userRepository.findByIdWithPermissions(userId)
				.orElseThrow(() -> new IllegalArgumentException("User was not found."));
	}

	@Transactional
	public void updateUser(long userId, String displayName, List<Long> permissionIds) {
		User user = userRepository.findByIdWithPermissions(userId)
				.orElseThrow(() -> new IllegalArgumentException("User was not found."));
		List<Permission> permissions = permissionRepository.findAllByIdInAndNameNot(
				permissionIds,
				ADMIN_ONLY_PERMISSION);
		user.getPermissions().stream()
				.filter(permission -> ADMIN_ONLY_PERMISSION.equals(permission.getName()))
				.forEach(permissions::add);

		user.setDisplayName(displayName.trim());
		user.setPermissions(new HashSet<>(permissions));
	}

	@Transactional
	public void changePassword(String username, String currentPassword, String newPassword) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new IllegalArgumentException("User was not found."));
		if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
			throw new IllegalArgumentException("Current password is incorrect.");
		}
		user.setPassword(passwordEncoder.encode(newPassword));
	}
}
