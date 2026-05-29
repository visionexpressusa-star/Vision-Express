package com.ve.app.web.form;

import java.util.ArrayList;
import java.util.List;

public class EditUserForm {

	private String displayName = "";

	private String username = "";

	private List<Long> permissionIds = new ArrayList<>();

	public String getDisplayName() {
		return displayName;
	}

	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public List<Long> getPermissionIds() {
		return permissionIds;
	}

	public void setPermissionIds(List<Long> permissionIds) {
		this.permissionIds = permissionIds == null ? new ArrayList<>() : permissionIds;
	}
}
