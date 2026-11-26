import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateEstimate } from "./estimate.js";

const config = {
  eye_exam_price: 95,
  exam_discount_with_complete_glasses: 85,
  outside_prescription_discount: 45,
  lens_discount_without_insurance: 100,
  pof_charge: 40,
  frame_discount_options: [10, 20, 30],
  lens_option_charges: [{ name: "Regular", charge: 0 }, { name: "Rimless", charge: 49.99 }],
  lens_prices: [{ name: "Single Vision - CR39 Plastic", price: 219.99 }],
  lens_protection_coatings: [{ name: "SV - UV/AR/Anti-Scratch", price: 79.99 }],
  lens_transition_options: [{ name: "Solid Color", price: 89.99 }],
};

const base = {
  insurance: "false", insuranceDiscount: "", eyeExam: false, outsideRx: false, frame: false, pof: false,
  lenses: false, sunglasses: false, framePrice: "", frameDiscountPercent: "0",
  lensType: "", lensOption: "", coating: "", transition: "",
};

test("nothing selected gives no estimate", () => {
  assert.equal(calculateEstimate(base, config), null);
});

test("exam + frame + lenses without insurance applies all discounts", () => {
  const result = calculateEstimate({
    ...base, eyeExam: true, frame: true, lenses: true, framePrice: "100", frameDiscountPercent: "20",
    lensType: "Single Vision - CR39 Plastic", lensOption: "Rimless",
  }, config);
  assert.deepEqual(result.discountLines.map((line) => line.label), ["Exam discount", "Frame discount", "Lens discount"]);
  assert.equal(result.subtotal, 464.98);
  assert.equal(result.totalDiscount, 205);
  assert.equal(result.total, 259.98);
});

test("outside Rx gives the outside discount, capped by lens price", () => {
  const result = calculateEstimate({
    ...base, outsideRx: true, lenses: true, lensType: "Single Vision - CR39 Plastic",
  }, config);
  assert.deepEqual(result.discountLines.map((line) => line.label), ["Outside Rx discount", "Lens discount"]);
  assert.equal(result.total, 74.99);
});

test("insurance uses only the insurance discount", () => {
  const result = calculateEstimate({
    ...base, insurance: "true", insuranceDiscount: "50", eyeExam: true, frame: true, lenses: true,
    framePrice: "100", lensType: "Single Vision - CR39 Plastic",
  }, config);
  assert.deepEqual(result.discountLines, [{ label: "Insurance discount", amount: -50 }]);
  assert.equal(result.total, 364.99);
});

test("sunglasses add 8.25% tax on the frame after the frame line", () => {
  const result = calculateEstimate({ ...base, frame: true, sunglasses: true, framePrice: "100" }, config);
  assert.deepEqual(result.chargeLines.map((line) => line.label), ["Frame", "Sales tax (8.25%)"]);
  assert.equal(result.salesTax, 8.25);
  assert.equal(result.total, 108.25);
});
