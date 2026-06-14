package com.ve.app.service;

import com.ve.app.model.ReferralSource;
import com.ve.app.repository.IntakeFormRepository;
import com.ve.app.repository.ReferralSourceRepository;
import com.ve.app.web.view.ReferralSourceReport;
import com.ve.app.web.view.ReferralSourceReportItem;
import com.ve.app.web.view.ReferralSourceReportMonth;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
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
	public ReferralSourceReport createReport(String requestedMonth) {
		YearMonth currentMonth = YearMonth.now();
		YearMonth selectedMonth = parseMonth(requestedMonth, currentMonth);
		List<ReferralSourceReportMonth> availableMonths = findAvailableMonths(currentMonth);
		String selectedMonthValue = selectedMonth.toString();
		if (availableMonths.stream().noneMatch(month -> month.value().equals(selectedMonthValue))) {
			selectedMonth = currentMonth;
		}
		Map<Long, Long> counts = intakeFormRepository.countByReferralSourceForPeriod(
						selectedMonth.atDay(1).atStartOfDay(),
						selectedMonth.plusMonths(1).atDay(1).atStartOfDay())
				.stream()
				.collect(Collectors.toMap(
						row -> ((Number) row[0]).longValue(),
						row -> ((Number) row[1]).longValue()));

		List<ReferralSource> referralSources = referralSourceRepository.findAllByOrderByIdAsc();
		List<ReferralSourceReportItem> items = new ArrayList<>();
		for (int index = 0; index < referralSources.size(); index++) {
			ReferralSource referralSource = referralSources.get(index);
			items.add(new ReferralSourceReportItem(
					referralSource.getName(),
					counts.getOrDefault(referralSource.getId(), 0L),
					CHART_COLORS.get(index % CHART_COLORS.size())));
		}

		long total = items.stream().mapToLong(ReferralSourceReportItem::count).sum();
		return new ReferralSourceReport(
				selectedMonth.toString(),
				availableMonths,
				items,
				total,
				chartBackground(items, total));
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
