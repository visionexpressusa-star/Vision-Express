package com.ve.app.service;

import com.ve.app.model.ReferralSource;
import com.ve.app.repository.IntakeFormRepository;
import com.ve.app.repository.ReferralSourceRepository;
import com.ve.app.web.view.ReferralSourceReport;
import com.ve.app.web.view.ReferralSourceReportItem;
import com.ve.app.web.view.ReferralSourceReportMonth;
import com.ve.app.web.view.ReferralSourceReportYearMonth;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReferralSourceReportService {

	private static final DateTimeFormatter MONTH_LABEL_FORMATTER =
			DateTimeFormatter.ofPattern("MMMM, yyyy", Locale.ENGLISH);
	private static final DateTimeFormatter YEAR_MONTH_LABEL_FORMATTER =
			DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH);
	private static final List<String> CHART_COLORS = List.of(
			"#ee3925",
			"#5ba356",
			"#ffbf20",
			"#276fbf",
			"#8f5aa8",
			"#24a6a6",
			"#d56b1f");

	private final IntakeFormRepository intakeFormRepository;
	private final ReferralSourceRepository referralSourceRepository;

	public ReferralSourceReportService(
			IntakeFormRepository intakeFormRepository,
			ReferralSourceRepository referralSourceRepository) {
		this.intakeFormRepository = intakeFormRepository;
		this.referralSourceRepository = referralSourceRepository;
	}

	@Transactional(readOnly = true)
	public ReferralSourceReport createReport(String requestedPeriod, String requestedMonth, String requestedYear) {
		String selectedPeriod = "yearly".equalsIgnoreCase(requestedPeriod) ? "yearly" : "monthly";
		YearMonth currentMonth = YearMonth.now();
		YearMonth selectedMonth = parseMonth(requestedMonth, currentMonth);
		List<ReferralSourceReportMonth> availableMonths = findAvailableMonths(currentMonth);
		int currentYear = currentMonth.getYear();
		List<Integer> availableYears = findAvailableYears(currentYear);
		int selectedYear = parseYear(requestedYear, currentYear);
		if (!availableYears.contains(selectedYear)) {
			selectedYear = currentYear;
		}
		String selectedMonthValue = selectedMonth.toString();
		if (availableMonths.stream().noneMatch(month -> month.value().equals(selectedMonthValue))) {
			selectedMonth = currentMonth;
		}
		List<ReferralSource> referralSources = referralSourceRepository.findAllByOrderByIdAsc();
		List<ReferralSourceReportItem> items = monthlyItems(selectedMonth, referralSources);
		long total = items.stream().mapToLong(ReferralSourceReportItem::count).sum();
		List<ReferralSourceReportYearMonth> yearMonths = yearlyMonths(selectedYear, referralSources);
		long maxYearMonthTotal = yearMonths.stream()
				.mapToLong(ReferralSourceReportYearMonth::total)
				.max()
				.orElse(0);
		long yearTotal = yearMonths.stream().mapToLong(ReferralSourceReportYearMonth::total).sum();

		return new ReferralSourceReport(
				selectedPeriod,
				selectedMonth.toString(),
				selectedYear,
				availableMonths,
				availableYears,
				items,
				yearMonths,
				total,
				yearTotal,
				maxYearMonthTotal,
				chartBackground(items, total));
	}

	private List<ReferralSourceReportItem> monthlyItems(YearMonth selectedMonth, List<ReferralSource> referralSources) {
		Map<Long, Long> counts = intakeFormRepository.countByReferralSourceForPeriod(
						selectedMonth.atDay(1).atStartOfDay(),
						selectedMonth.plusMonths(1).atDay(1).atStartOfDay())
				.stream()
				.collect(Collectors.toMap(
						row -> ((Number) row[0]).longValue(),
						row -> ((Number) row[1]).longValue()));

		List<ReferralSourceReportItem> items = new ArrayList<>();
		for (int index = 0; index < referralSources.size(); index++) {
			ReferralSource referralSource = referralSources.get(index);
			items.add(new ReferralSourceReportItem(
					referralSource.getName(),
					counts.getOrDefault(referralSource.getId(), 0L),
					CHART_COLORS.get(index % CHART_COLORS.size())));
		}
		return items;
	}

	private List<ReferralSourceReportYearMonth> yearlyMonths(int selectedYear, List<ReferralSource> referralSources) {
		Map<Integer, Map<Long, Long>> monthlyCounts = new HashMap<>();
		for (Object[] row : intakeFormRepository.countByReferralSourceByMonthForPeriod(
				YearMonth.of(selectedYear, 1).atDay(1).atStartOfDay(),
				YearMonth.of(selectedYear + 1, 1).atDay(1).atStartOfDay())) {
			Integer month = ((Number) row[0]).intValue();
			Long referralSourceId = ((Number) row[1]).longValue();
			Long count = ((Number) row[2]).longValue();
			monthlyCounts.computeIfAbsent(month, key -> new HashMap<>()).put(referralSourceId, count);
		}

		long maxTotal = monthlyCounts.values().stream()
				.mapToLong(counts -> counts.values().stream().mapToLong(Long::longValue).sum())
				.max()
				.orElse(0);
		List<ReferralSourceReportYearMonth> months = new ArrayList<>();
		for (int month = 1; month <= 12; month++) {
			Map<Long, Long> counts = monthlyCounts.get(month);
			if (counts == null) {
				continue;
			}
			List<ReferralSourceReportItem> items = new ArrayList<>();
			for (int index = 0; index < referralSources.size(); index++) {
				ReferralSource referralSource = referralSources.get(index);
				items.add(new ReferralSourceReportItem(
						referralSource.getName(),
						counts.getOrDefault(referralSource.getId(), 0L),
						CHART_COLORS.get(index % CHART_COLORS.size())));
			}
			long total = items.stream().mapToLong(ReferralSourceReportItem::count).sum();
			YearMonth yearMonth = YearMonth.of(selectedYear, month);
			months.add(new ReferralSourceReportYearMonth(
					YEAR_MONTH_LABEL_FORMATTER.format(yearMonth),
					total,
					maxTotal == 0 ? 0 : Math.max(8, (int) Math.round(total * 100.0 / maxTotal)),
					tooltip(yearMonth, items, total),
					items));
		}
		return months;
	}

	private List<ReferralSourceReportMonth> findAvailableMonths(YearMonth currentMonth) {
		Set<YearMonth> months = new LinkedHashSet<>();
		months.add(currentMonth);
		for (Object[] row : intakeFormRepository.findDistinctCreatedMonths()) {
			months.add(YearMonth.of(
					((Number) row[0]).intValue(),
					((Number) row[1]).intValue()));
		}
		return months.stream()
				.sorted(Comparator.reverseOrder())
				.map(month -> new ReferralSourceReportMonth(
						month.toString(),
						MONTH_LABEL_FORMATTER.format(month)))
				.toList();
	}

	private List<Integer> findAvailableYears(int currentYear) {
		Set<Integer> years = new LinkedHashSet<>();
		years.add(currentYear);
		years.addAll(intakeFormRepository.findDistinctCreatedYears());
		return years.stream()
				.sorted(Comparator.reverseOrder())
				.toList();
	}

	private YearMonth parseMonth(String requestedMonth, YearMonth fallback) {
		if (requestedMonth == null || requestedMonth.isBlank()) {
			return fallback;
		}
		try {
			return YearMonth.parse(requestedMonth);
		}
		catch (DateTimeParseException exception) {
			return fallback;
		}
	}

	private int parseYear(String requestedYear, int fallback) {
		if (requestedYear == null || requestedYear.isBlank()) {
			return fallback;
		}
		try {
			return Integer.parseInt(requestedYear);
		}
		catch (NumberFormatException exception) {
			return fallback;
		}
	}

	private String tooltip(YearMonth month, List<ReferralSourceReportItem> items, long total) {
		List<String> lines = new ArrayList<>();
		lines.add(MONTH_LABEL_FORMATTER.format(month) + ": " + total + " total");
		for (ReferralSourceReportItem item : items) {
			lines.add(item.name() + ": " + item.count());
		}
		return String.join("\n", lines);
	}

	private String chartBackground(List<ReferralSourceReportItem> items, long total) {
		if (total == 0) {
			return "#edf3ea";
		}
		List<String> segments = new ArrayList<>();
		double start = 0;
		for (ReferralSourceReportItem item : items) {
			if (item.count() == 0) {
				continue;
			}
			double end = start + (item.count() * 100.0 / total);
			segments.add(item.color() + " " + start + "% " + end + "%");
			start = end;
		}
		return "conic-gradient(" + String.join(", ", segments) + ")";
	}
}
