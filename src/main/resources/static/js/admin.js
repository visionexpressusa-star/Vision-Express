(function () {
	"use strict";

	var toggle = document.querySelector("[data-menu-toggle]");
	var closeControls = document.querySelectorAll("[data-menu-close]");

	if (!toggle) {
		return;
	}

	function setMenuOpen(isOpen) {
		document.body.classList.toggle("menu-open", isOpen);
		toggle.setAttribute("aria-expanded", String(isOpen));
	}

	toggle.addEventListener("click", function () {
		setMenuOpen(!document.body.classList.contains("menu-open"));
	});

	closeControls.forEach(function (control) {
		control.addEventListener("click", function () {
			setMenuOpen(false);
		});
	});

	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape") {
			setMenuOpen(false);
		}
	});

	window.addEventListener("resize", function () {
		if (window.innerWidth >= 992) {
			setMenuOpen(false);
		}
	});

	document.querySelectorAll("[data-checklist-gate]").forEach(function (checklist) {
		var saveButton = document.querySelector("[data-checklist-save]");
		var checkboxes = Array.prototype.slice.call(checklist.querySelectorAll("input[type='checkbox']"));

		if (!saveButton || checkboxes.length === 0) {
			return;
		}

		function updateSaveVisibility() {
			var allChecked = checkboxes.every(function (checkbox) {
				return checkbox.checked;
			});
			saveButton.hidden = !allChecked;
		}

		checkboxes.forEach(function (checkbox) {
			checkbox.addEventListener("change", updateSaveVisibility);
		});
		updateSaveVisibility();
	});
}());
