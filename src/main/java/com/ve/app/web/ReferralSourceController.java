package com.ve.app.web;

import com.ve.app.service.ReferralSourceReportService;
import com.ve.app.web.view.ReferralSourceReport;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class ReferralSourceController {

	private final ReferralSourceReportService referralSourceReportService;

	public ReferralSourceController(ReferralSourceReportService referralSourceReportService) {
		this.referralSourceReportService = referralSourceReportService;
	}

	@GetMapping("/referral-source")
	public String referralSourceReport(
			@RequestParam(required = false) String period,
			@RequestParam(required = false) String month,
			@RequestParam(required = false) String year,
			Model model) {
		ReferralSourceReport report = referralSourceReportService.createReport(period, month, year);
		model.addAttribute("report", report);
		return "referral-source";
	}
}
