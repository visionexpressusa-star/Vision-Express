import { formatDate } from "../lib/format.js";

// NCT, Manifest, Contact Lens Rx and Recommendation sections.
// Editable on the refraction page, read-only on the view page.
export default function PrescriptionFields({ form, onChange, readOnly = false, prescribedBy, prescribedOn }) {
  let tab = 0;
  const text = (key) => {
    tab += 1;
    return (
      <input className="form-control" type="text" value={form[key]} readOnly={readOnly}
        tabIndex={readOnly ? undefined : tabOrder[key] ?? tab}
        onChange={readOnly ? undefined : (event) => onChange(key, event.target.value)} />
    );
  };
  const check = (key, label) => (
    <label className="recommendation-option">
      <input type="checkbox" checked={form[key]} disabled={readOnly}
        tabIndex={readOnly ? undefined : tabOrder[key]}
        onChange={readOnly ? undefined : (event) => onChange(key, event.target.checked)} />
      <span>{label}</span>
    </label>
  );
  const remarks = (key) => (
    <div className="remarks-input">
      <span>20/</span>
      {text(key)}
    </div>
  );

  return (
    <>
      <div className="manifest-top-row">
        <div className="manifest-nct-row">
          <span className="manifest-label">NCT:</span>
          <input className="form-control manifest-nct-input" type="text" value={form.nctRight} readOnly={readOnly} tabIndex={1}
            onChange={readOnly ? undefined : (event) => onChange("nctRight", event.target.value)} />
          <span className="manifest-divider">/</span>
          <input className="form-control manifest-nct-input" type="text" value={form.nctLeft} readOnly={readOnly} tabIndex={2}
            onChange={readOnly ? undefined : (event) => onChange("nctLeft", event.target.value)} />
        </div>
        <div className="prescription-meta">
          <div>
            <span className="summary-label">Refraction By:</span> <span className="summary-value">{prescribedBy || "-"}</span>
          </div>
          <div>
            <span className="summary-label">Refraction On:</span> <span className="summary-value">{prescribedOn ? formatDate(prescribedOn) : "-"}</span>
          </div>
        </div>
      </div>

      <div className="manifest-box">
        <h2 className="manifest-heading">Manifest</h2>
        <div className="manifest-table-wrapper">
          <table className="manifest-table">
            <thead>
              <tr><th scope="col"></th><th scope="col">SPH</th><th scope="col">CYL</th><th scope="col">AXIS</th><th scope="col">ADD</th><th scope="col">REMARKS</th></tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">OD</th>
                <td>{text("odSph")}</td><td>{text("odCyl")}</td><td>{text("odAxis")}</td><td>{text("odAdd")}</td>
                <td>{remarks("odRemarks")}</td>
              </tr>
              <tr>
                <th scope="row">OS</th>
                <td>{text("osSph")}</td><td>{text("osCyl")}</td><td>{text("osAxis")}</td><td>{text("osAdd")}</td>
                <td>{remarks("osRemarks")}</td>
              </tr>
              <tr>
                <th scope="row">OU</th>
                <td></td><td></td><td></td><td></td>
                <td>{remarks("ouRemarks")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="manifest-box contact-lens-box">
        <h2 className="manifest-heading">Contact Lens Rx</h2>
        <div className="manifest-table-wrapper">
          <table className="manifest-table contact-lens-table">
            <thead>
              <tr>
                <th scope="col"></th><th scope="col">SPH</th><th scope="col">CYL</th><th scope="col">AXIS</th>
                <th scope="col">ADD</th><th scope="col">BC</th><th scope="col">DIS</th><th scope="col">LENS MO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">OD</th>
                <td>{text("cOdSph")}</td><td>{text("cOdCyl")}</td><td>{text("cOdAxis")}</td><td>{text("cOdAdd")}</td>
                <td>{text("cOdBc")}</td><td>{text("cOdDia")}</td><td>{text("cOdLensMo")}</td>
              </tr>
              <tr>
                <th scope="row">OS</th>
                <td>{text("cOsSph")}</td><td>{text("cOsCyl")}</td><td>{text("cOsAxis")}</td><td>{text("cOsAdd")}</td>
                <td>{text("cOsBc")}</td><td>{text("cOsDia")}</td><td>{text("cOsLensMo")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="manifest-box recommendation-box">
        <h2 className="manifest-heading">Recommendation</h2>
        <table className="recommendation-table">
          <tbody>
            <tr>
              <th scope="row">Type</th>
              <td>{check("sv", "Single Vision")}</td>
              <td>{check("bifocal", "Bifocal")}</td>
              <td>{check("blendedBifocal", "Blended Bifocal")}</td>
              <td>{check("progressive", "Progressive")}</td>
            </tr>
            <tr className="no-row-border">
              <th scope="row">Lens Material</th>
              <td>{check("plastic", "Plastic")}</td>
              <td>{check("poly", "Poly")}</td>
              <td>{check("polyAspheric", "Poly Aspheric")}</td>
              <td></td>
            </tr>
            <tr>
              <th scope="row"></th>
              <td>{check("highIndex167", "High Index 1.67")}</td>
              <td>{check("ultraHiIndex174", "Ultra High Index 1.74")}</td>
              <td></td><td></td>
            </tr>
            <tr>
              <th scope="row">Lens Treatment</th>
              <td>{check("scUvAr", "SC/UV/AR")}</td>
              <td>{check("blueShield", "Blue Shield Protection")}</td>
              <td></td><td></td>
            </tr>
            <tr>
              <th scope="row">Transition</th>
              <td>{check("transition", "Recommended")}</td>
              <td></td><td></td><td></td>
            </tr>
            <tr>
              <th scope="row">Dry Eye Drop</th>
              <td>{check("dryEyeDrop", "Recommended")}</td>
              <td></td><td></td><td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

// Keyboard order from the original page: sphere/cyl/axis/add for both eyes, then remarks.
const tabOrder = {
  odSph: 3, odCyl: 4, odAxis: 5, odAdd: 6, osSph: 7, osCyl: 8, osAxis: 9, osAdd: 10,
  odRemarks: 11, osRemarks: 12, ouRemarks: 13,
  cOdSph: 14, cOdCyl: 15, cOdAxis: 16, cOdAdd: 17, cOdBc: 18, cOdDia: 19, cOdLensMo: 20,
  cOsSph: 21, cOsCyl: 22, cOsAxis: 23, cOsAdd: 24, cOsBc: 25, cOsDia: 26, cOsLensMo: 27,
  sv: 28, bifocal: 29, blendedBifocal: 30, progressive: 31, plastic: 32, poly: 33, polyAspheric: 34,
  highIndex167: 35, ultraHiIndex174: 36, scUvAr: 37, blueShield: 38, transition: 39, dryEyeDrop: 40,
};
