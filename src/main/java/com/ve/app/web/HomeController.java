package com.ve.app.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

	@GetMapping("/")
	public String dashboard() {
		return "dashboard";
	}

	@GetMapping("/inventory-tracking")
	public String inventoryTracking() {
		return "inventory-tracking";
	}
}
