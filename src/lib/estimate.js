// Price estimator rules, ported from admin.js / OpticalEstimateService.java.

const round2 = (value) => Math.round(value * 100) / 100;

function money(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

const capped = (amount, cap) => Math.max(0, Math.min(amount, cap));

/**
 * @param form {
 *   insurance: "true" | "false" | "", insuranceDiscount, eyeExam, outsideRx, frame, pof, lenses,
 *   sunglasses, framePrice, frameDiscountPercent, lensType, lensOption, coating, transition
 * }
 * @param config optical_store_config row
 * @returns { chargeLines, discountLines, subtotal, totalDiscount, salesTax, total } or null when nothing is selected
 */
export function calculateEstimate(form, config) {
  const lines = [];
  const add = (label, amount) => lines.push({ label, amount: round2(amount) });
  const addDiscount = (label, amount) => {
    if (amount > 0) add(label, -amount);
  };

  const hasInsurance = form.insurance === "true";
  const noInsurance = form.insurance === "false";
  const completeGlasses = form.lenses && (form.frame || form.pof);
  const examDiscountEligible = form.lenses && form.frame;
  const prescriptionSource = form.eyeExam ? "EXAM_HERE" : form.outsideRx ? "OUTSIDE_RX" : "";

  const eyeExamPrice = money(config.eye_exam_price);
  const framePrice = form.frame ? money(form.framePrice) : 0;
  const lens = config.lens_prices.find((item) => item.name === form.lensType);
  const lensOption = config.lens_option_charges.find((item) => item.name === form.lensOption);
  const coating = config.lens_protection_coatings.find((item) => item.name === form.coating);
  const transition = config.lens_transition_options.find((item) => item.name === form.transition);
  const lensPrice = form.lenses && lens ? money(lens.price) : 0;
  const lensOptionCharge = completeGlasses && lensOption ? money(lensOption.charge) : 0;
  const coatingPrice = form.lenses && coating ? money(coating.price) : 0;
  const transitionPrice = form.lenses && transition ? money(transition.price) : 0;

  if (form.eyeExam) add("Eye exam", eyeExamPrice);
  if (form.frame) add("Frame", framePrice);
  if (form.pof) add("POF", money(config.pof_charge));
  if (form.lenses && lens) add(lens.name, lensPrice);
  if (form.lenses && completeGlasses && lensOption && lensOptionCharge > 0) add(lensOption.name, lensOptionCharge);
  if (form.lenses && coating && coatingPrice > 0) add(coating.name, coatingPrice);
  if (form.lenses && transition && transitionPrice > 0) add(transition.name, transitionPrice);

  if (hasInsurance) {
    addDiscount("Insurance discount", money(form.insuranceDiscount));
  } else if (noInsurance) {
    if (form.eyeExam && examDiscountEligible) {
      addDiscount("Exam discount", capped(money(config.exam_discount_with_complete_glasses), eyeExamPrice));
    }
    if (!form.eyeExam && form.lenses && prescriptionSource === "OUTSIDE_RX") {
      addDiscount("Outside Rx discount", capped(money(config.outside_prescription_discount), lensPrice));
    }
    if (form.frame && form.lenses && prescriptionSource) {
      addDiscount("Frame discount", capped((framePrice * money(form.frameDiscountPercent)) / 100, framePrice));
    }
    if (form.lenses) {
      addDiscount("Lens discount", capped(money(config.lens_discount_without_insurance), lensPrice));
    }
  }

  if (lines.length === 0) return null;

  let subtotal = round2(lines.reduce((sum, line) => (line.amount > 0 ? sum + line.amount : sum), 0));
  const totalDiscount = round2(lines.reduce((sum, line) => (line.amount < 0 ? sum - line.amount : sum), 0));
  let total = Math.max(0, round2(lines.reduce((sum, line) => sum + line.amount, 0)));

  const chargeLines = lines.filter((line) => line.amount >= 0);
  const discountLines = lines.filter((line) => line.amount < 0);

  let salesTax = 0;
  if (form.sunglasses && form.frame) {
    const taxableCents = Math.max(0, Math.round(framePrice * 100));
    salesTax = Math.round((taxableCents * 825) / 10000) / 100;
    total = round2(total + salesTax);
    subtotal = round2(subtotal + salesTax);
    const frameIndex = chargeLines.findIndex((line) => line.label === "Frame");
    chargeLines.splice(frameIndex + 1, 0, { label: "Sales tax (8.25%)", amount: salesTax });
  }

  return { chargeLines, discountLines, subtotal, totalDiscount, salesTax, total };
}
