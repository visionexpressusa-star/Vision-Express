package com.ve.app.web.view;

import java.time.LocalDateTime;

public record IntakeFormListItem(
		Long id,
		Long accountId,
		String fullName,
		String createdBy,
		LocalDateTime createdOn,
		String prescribedBy) {
}
