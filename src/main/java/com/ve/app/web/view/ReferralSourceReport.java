package com.ve.app.web.view;

import java.util.List;

public record ReferralSourceReport(
		String selectedMonth,
		List<ReferralSourceReportMonth> availableMonths,
		List<ReferralSourceReportItem> items,
		long total,
		String chartBackground) {
}
