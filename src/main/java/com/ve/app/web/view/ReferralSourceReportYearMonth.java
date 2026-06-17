package com.ve.app.web.view;

import java.util.List;

public record ReferralSourceReportYearMonth(
		String monthLabel,
		long total,
		int heightPercent,
		String tooltip,
		List<ReferralSourceReportItem> items) {
}
