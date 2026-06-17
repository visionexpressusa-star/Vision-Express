package com.ve.app.web.view;

import java.util.List;

public record ReferralSourceReport(
		String selectedPeriod,
		String selectedMonth,
		int selectedYear,
		List<ReferralSourceReportMonth> availableMonths,
		List<Integer> availableYears,
		List<ReferralSourceReportItem> items,
		List<ReferralSourceReportYearMonth> yearMonths,
		long total,
		long yearTotal,
		long maxYearMonthTotal,
		String chartBackground) {
}
