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

	document.querySelectorAll("[data-referral-filter-control]").forEach(function (control) {
		control.addEventListener("change", function () {
			control.form.submit();
		});
	});

	document.querySelectorAll("[data-estimate-form]").forEach(function (form) {
		var insuranceDiscount = form.querySelector("[data-insurance-discount]");
		var frameFields = Array.prototype.slice.call(form.querySelectorAll("[data-frame-fields]"));
		var lensTypeField = form.querySelector("[data-lens-type-field]");
		var lensCoatingField = form.querySelector("[data-lens-coating-field]");
		var lensOptionField = form.querySelector("[data-lens-option-field]");
		var framePriceControl = form.querySelector("[name='framePrice']");
		var frameDiscountControl = form.querySelector("[name='selectedFrameDiscountPercent']");
		var insuranceDiscountControl = form.querySelector("[name='insuranceDiscount']");
		var lensTypeControl = form.querySelector("[name='lensTypeName']");
		var lensOptionControl = form.querySelector("[name='lensOptionName']");
		var lensCoatingControl = form.querySelector("[name='lensProtectionCoatingName']");
		var frameControl = form.querySelector("[data-frame-control]");
		var pofControl = form.querySelector("[data-pof-control]");
		var lensesControl = form.querySelector("[data-lenses-control]");
		var eyeExamControl = form.querySelector("[data-eye-exam]");
		var examHereControl = form.querySelector("[data-exam-here]");
		var outsideRxControl = form.querySelector("[data-outside-rx]");
		var layout = form.closest(".optical-estimate-layout");
		var summaryTable = layout ? layout.querySelector("[data-estimate-summary-table]") : null;
		var summaryLines = layout ? layout.querySelector("[data-estimate-summary-lines]") : null;
		var emptySummary = layout ? layout.querySelector("[data-estimate-empty-summary]") : null;

		function selectedInsuranceValue() {
			var checked = form.querySelector("[data-insurance-control]:checked");
			return checked ? checked.value : "";
		}

		function setVisible(element, isVisible) {
			if (element) {
				element.hidden = !isVisible;
			}
		}

		function moneyValue(value) {
			var parsed = Number.parseFloat(value);
			if (!Number.isFinite(parsed) || parsed < 0) {
				return 0;
			}
			return parsed;
		}

		function selectedOption(select) {
			return select && select.selectedIndex >= 0 ? select.options[select.selectedIndex] : null;
		}

		function selectedLensPrice() {
			var option = selectedOption(lensTypeControl);
			return option ? moneyValue(option.getAttribute("data-price")) : 0;
		}

		function selectedLensOptionCharge() {
			var option = selectedOption(lensOptionControl);
			return option ? moneyValue(option.getAttribute("data-charge")) : 0;
		}

		function selectedLensCoatingPrice() {
			var option = selectedOption(lensCoatingControl);
			return option ? moneyValue(option.getAttribute("data-price")) : 0;
		}

		function selectedPrescriptionSource() {
			var checked = form.querySelector("[name='prescriptionSource']:checked");
			return checked ? checked.value : "";
		}

		function formatMoney(amount) {
			var absolute = Math.abs(amount);
			var formatted = absolute.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
			return (amount < 0 ? "-$" : "$") + formatted;
		}

		function capped(amount, cap) {
			return Math.max(0, Math.min(amount, cap));
		}

		function addLine(lines, label, amount) {
			lines.push({
				label: label,
				amount: Math.round(amount * 100) / 100
			});
		}

		function addDiscount(lines, label, amount) {
			if (amount > 0) {
				addLine(lines, label, -amount);
			}
		}

		function renderEstimate(lines) {
			if (!summaryTable || !summaryLines || !emptySummary) {
				return;
			}

			summaryLines.textContent = "";
			if (lines.length === 0) {
				summaryTable.hidden = true;
				emptySummary.hidden = false;
				return;
			}

			var total = lines.reduce(function (sum, line) {
				return sum + line.amount;
			}, 0);
			total = Math.max(0, Math.round(total * 100) / 100);

			lines.forEach(function (line) {
				var row = document.createElement("tr");
				var labelCell = document.createElement("th");
				var amountCell = document.createElement("td");

				labelCell.scope = "row";
				labelCell.textContent = line.label;
				amountCell.textContent = formatMoney(line.amount);
				row.appendChild(labelCell);
				row.appendChild(amountCell);
				summaryLines.appendChild(row);
			});

			var totalRow = document.createElement("tr");
			var totalLabel = document.createElement("th");
			var totalAmount = document.createElement("td");
			totalRow.className = "optical-total-row";
			totalLabel.scope = "row";
			totalLabel.textContent = "Total";
			totalAmount.textContent = formatMoney(total);
			totalRow.appendChild(totalLabel);
			totalRow.appendChild(totalAmount);
			summaryLines.appendChild(totalRow);

			summaryTable.hidden = false;
			emptySummary.hidden = true;
		}

		function calculateEstimate() {
			var lines = [];
			var insuranceValue = selectedInsuranceValue();
			var hasInsurance = insuranceValue === "true";
			var noInsurance = insuranceValue === "false";
			var hasFrame = frameControl && frameControl.checked;
			var hasPof = pofControl && pofControl.checked;
			var hasLenses = lensesControl && lensesControl.checked;
			var hasEyeExam = eyeExamControl && eyeExamControl.checked;
			var completeGlasses = hasLenses && (hasFrame || hasPof);
			var prescriptionSource = selectedPrescriptionSource();
			var eyeExamPrice = moneyValue(form.getAttribute("data-eye-exam-price"));
			var examDiscount = moneyValue(form.getAttribute("data-exam-discount"));
			var outsideRxDiscount = moneyValue(form.getAttribute("data-outside-rx-discount"));
			var lensDiscount = moneyValue(form.getAttribute("data-lens-discount"));
			var pofCharge = moneyValue(form.getAttribute("data-pof-charge"));
			var framePrice = hasFrame ? moneyValue(framePriceControl && framePriceControl.value) : 0;
			var lensPrice = hasLenses ? selectedLensPrice() : 0;
			var lensTypeOption = selectedOption(lensTypeControl);
			var lensOption = selectedOption(lensOptionControl);
			var lensCoatingOption = selectedOption(lensCoatingControl);
			var lensOptionCharge = completeGlasses ? selectedLensOptionCharge() : 0;
			var lensCoatingPrice = hasLenses ? selectedLensCoatingPrice() : 0;

			if (hasEyeExam) {
				addLine(lines, "Eye exam", eyeExamPrice);
			}
			if (hasFrame) {
				addLine(lines, "Frame", framePrice);
			}
			if (hasPof) {
				addLine(lines, "POF", pofCharge);
			}
			if (hasLenses && lensTypeOption && lensTypeOption.value) {
				addLine(lines, "Lenses - " + lensTypeOption.value, lensPrice);
			}
			if (hasLenses && completeGlasses && lensOption && lensOption.value && lensOptionCharge > 0) {
				addLine(lines, lensOption.value + " lens option", lensOptionCharge);
			}
			if (hasLenses && lensCoatingOption && lensCoatingOption.value && lensCoatingPrice > 0) {
				addLine(lines, "Lens protection coating - " + lensCoatingOption.value, lensCoatingPrice);
			}

			if (hasInsurance) {
				addDiscount(lines, "Insurance discount", moneyValue(insuranceDiscountControl && insuranceDiscountControl.value));
				renderEstimate(lines);
				return;
			}

			if (noInsurance && hasEyeExam && completeGlasses) {
				addDiscount(lines, "Exam discount", capped(examDiscount, eyeExamPrice));
			}
			if (noInsurance && !hasEyeExam && hasLenses && prescriptionSource === "OUTSIDE_RX") {
				addDiscount(lines, "Outside Rx discount", capped(outsideRxDiscount, lensPrice));
			}
			if (noInsurance && hasFrame && hasLenses && (prescriptionSource === "EXAM_HERE" || prescriptionSource === "OUTSIDE_RX")) {
				addDiscount(lines, "Frame discount", capped(framePrice * moneyValue(frameDiscountControl && frameDiscountControl.value) / 100, framePrice));
			}
			if (noInsurance && hasLenses) {
				addDiscount(lines, "Lens discount", capped(lensDiscount, lensPrice));
			}

			renderEstimate(lines);
		}

		function updateEstimateFields() {
			var hasFrame = frameControl && frameControl.checked;
			var hasPof = pofControl && pofControl.checked;
			var hasLenses = lensesControl && lensesControl.checked;
			var completeGlasses = hasLenses && (hasFrame || hasPof);

			setVisible(insuranceDiscount, selectedInsuranceValue() !== "false" && selectedInsuranceValue() !== "");
			frameFields.forEach(function (field) {
				setVisible(field, hasFrame);
			});
			setVisible(lensTypeField, hasLenses);
			setVisible(lensCoatingField, hasLenses);
			setVisible(lensOptionField, completeGlasses);
			calculateEstimate();
		}

		form.addEventListener("submit", function (event) {
			event.preventDefault();
			updateEstimateFields();
		});

		if (frameControl && pofControl) {
			frameControl.addEventListener("change", function () {
				if (frameControl.checked) {
					pofControl.checked = false;
				}
				updateEstimateFields();
			});
			pofControl.addEventListener("change", function () {
				if (pofControl.checked) {
					frameControl.checked = false;
				}
				updateEstimateFields();
			});
		}

		if (lensesControl) {
			lensesControl.addEventListener("change", updateEstimateFields);
		}
		form.querySelectorAll("[data-insurance-control]").forEach(function (control) {
			control.addEventListener("change", updateEstimateFields);
		});
		if (eyeExamControl && examHereControl) {
			eyeExamControl.addEventListener("change", function () {
				if (eyeExamControl.checked) {
					examHereControl.checked = true;
				}
				updateEstimateFields();
			});
		}
		if (examHereControl && eyeExamControl) {
			examHereControl.addEventListener("change", function () {
				if (examHereControl.checked) {
					eyeExamControl.checked = true;
				}
				updateEstimateFields();
			});
		}
		if (outsideRxControl && eyeExamControl) {
			outsideRxControl.addEventListener("change", function () {
				if (outsideRxControl.checked) {
					eyeExamControl.checked = false;
				}
				updateEstimateFields();
			});
		}
		form.querySelectorAll("input, select").forEach(function (control) {
			control.addEventListener("input", calculateEstimate);
			control.addEventListener("change", calculateEstimate);
		});
		updateEstimateFields();
	});

	document.querySelectorAll("[data-add-lens-row]").forEach(function (button) {
		button.addEventListener("click", function () {
			var table = document.querySelector("[data-lens-price-table]");
			if (!table || !table.tBodies.length) {
				return;
			}
			var body = table.tBodies[0];
			var index = body.rows.length;
			var row = body.insertRow();
			var nameCell = row.insertCell();
			var priceCell = row.insertCell();

			var nameInput = document.createElement("input");
			nameInput.className = "form-control";
			nameInput.type = "text";
			nameInput.name = "lensPrices[" + index + "].name";
			nameInput.id = "lensPrices" + index + ".name";

			var priceInput = document.createElement("input");
			priceInput.className = "form-control";
			priceInput.type = "number";
			priceInput.step = "0.01";
			priceInput.min = "0";
			priceInput.name = "lensPrices[" + index + "].price";
			priceInput.id = "lensPrices" + index + ".price";

			nameCell.appendChild(nameInput);
			priceCell.appendChild(priceInput);
			nameInput.focus();
		});
	});
}());
