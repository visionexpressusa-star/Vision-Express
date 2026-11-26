import { blankToNull, isPdValue, plainNumber } from "./format.js";

// Form field -> prescriptions column.
export const TEXT_FIELDS = {
  odSph: "od_sph", odCyl: "od_cyl", odAxis: "od_axis", odAdd: "od_add",
  osSph: "os_sph", osCyl: "os_cyl", osAxis: "os_axis", osAdd: "os_add",
  cOdSph: "c_od_sph", cOdCyl: "c_od_cyl", cOdAxis: "c_od_axis", cOdAdd: "c_od_add",
  cOdBc: "c_od_bc", cOdDia: "c_od_dia", cOdLensMo: "c_od_lens_mo",
  cOsSph: "c_os_sph", cOsCyl: "c_os_cyl", cOsAxis: "c_os_axis", cOsAdd: "c_os_add",
  cOsBc: "c_os_bc", cOsDia: "c_os_dia", cOsLensMo: "c_os_lens_mo",
};

export const NCT_FIELDS = { nctRight: ["nct_right", "NCT Right"], nctLeft: ["nct_left", "NCT Left"] };

export const REMARK_FIELDS = {
  odRemarks: ["od_remarks", "OD remarks"],
  osRemarks: ["os_remarks", "OS remarks"],
  ouRemarks: ["ou_remarks", "OU remarks"],
};

export const RECOMMENDATIONS = {
  sv: ["is_sv", "Single Vision"],
  bifocal: ["is_bifocal", "Bifocal"],
  blendedBifocal: ["is_blended_bifocal", "Blended Bifocal"],
  progressive: ["is_progressive", "Progressive"],
  plastic: ["is_plastic", "Plastic"],
  poly: ["is_poly", "Poly"],
  polyAspheric: ["is_poly_aspheric", "Poly Aspheric"],
  highIndex167: ["is_high_index_167", "High Index 1.67"],
  ultraHiIndex174: ["is_ultra_hi_index_174", "Ultra High Index 1.74"],
  scUvAr: ["is_sc_uv_ar", "SC/UV/AR"],
  blueShield: ["is_blue_shield", "Blue Shield Protection"],
  transition: ["is_transition", "Recommended"],
  dryEyeDrop: ["is_dry_eye_drop", "Recommended"],
};

export function emptyPrescriptionForm() {
  const form = {};
  for (const key of [...Object.keys(TEXT_FIELDS), ...Object.keys(NCT_FIELDS), ...Object.keys(REMARK_FIELDS)]) form[key] = "";
  for (const key of Object.keys(RECOMMENDATIONS)) form[key] = false;
  return form;
}

export function prescriptionFormFromRow(row) {
  const form = emptyPrescriptionForm();
  if (!row) return form;
  for (const [key, column] of Object.entries(TEXT_FIELDS)) form[key] = row[column] ?? "";
  for (const [key, [column]] of Object.entries(NCT_FIELDS)) form[key] = plainNumber(row[column]);
  for (const [key, [column]] of Object.entries(REMARK_FIELDS)) form[key] = row[column] == null ? "" : String(row[column]);
  for (const [key, [column]] of Object.entries(RECOMMENDATIONS)) form[key] = Boolean(row[column]);
  return form;
}

// Builds the row to save, throwing with the same messages the Java service used.
export function prescriptionRowFromForm(form) {
  const row = {};
  for (const [key, column] of Object.entries(TEXT_FIELDS)) row[column] = blankToNull(form[key]);
  for (const [key, [column, label]] of Object.entries(NCT_FIELDS)) {
    const value = form[key].trim();
    if (value && !isPdValue(value)) throw new Error(`${label} must be a number in the format XX.X.`);
    row[column] = value ? Number(value) : null;
  }
  for (const [key, [column, label]] of Object.entries(REMARK_FIELDS)) {
    const value = form[key].trim();
    if (!value) {
      row[column] = null;
      continue;
    }
    if (!/^-?\d+$/.test(value)) throw new Error(`${label} must be a number between 20 and 80.`);
    const number = Number(value);
    if (number < 20 || number > 80) throw new Error(`${label} must be between 20 and 80.`);
    row[column] = number;
  }
  for (const [key, [column]] of Object.entries(RECOMMENDATIONS)) row[column] = Boolean(form[key]);
  return row;
}

// Supabase returns a one-to-one embed as an object, older setups as an array.
export function single(embed) {
  return Array.isArray(embed) ? embed[0] ?? null : embed ?? null;
}
