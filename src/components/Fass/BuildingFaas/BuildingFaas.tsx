import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonToolbar,
  IonTitle,
  IonHeader
} from "@ionic/react";
import { documentOutline } from "ionicons/icons";
import html2pdf from "html2pdf.js";
import "../../../CSS/BuildingFaas.css";

const ROW_COUNT = 16;

const BuildingFaas: React.FC = () => {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [materials, setMaterials] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (let r = 1; r <= ROW_COUNT; r++) {
      for (let c = 1; c <= 11; c++) m[`r${r}_c${c}`] = ""; // Changed from 10 to 11
    }
    return m;
  });

  // Back page states
  const [appraisal, setAppraisal] = useState<Record<string, string>>({});
  const [addItems, setAddItems] = useState<Record<string, string>>({});
  const [assessment, setAssessment] = useState<Record<string, string>>({});

  // Front page handlers
  const setField = (k: string, v: string) => setFields((p) => ({ ...p, [k]: v }));
  const setMat = (r: number, c: number, v: string) =>
    setMaterials((p) => ({ ...p, [`r${r}_c${c}`]: v }));

  // Back page handlers
  const setApp = (r: number, c: number, v: string) =>
    setAppraisal((p) => ({ ...p, [`r${r}_c${c}`]: v }));
  const setItem = (r: number, c: number, v: string) =>
    setAddItems((p) => ({ ...p, [`r${r}_c${c}`]: v }));
  const setAssess = (r: number, c: number, v: string) =>
    setAssessment((p) => ({ ...p, [`r${r}_c${c}`]: v }));

  const generatePdf = async () => {
    const element = document.getElementById("combined-faas-sheet");
    if (!element) return;

    const opt: any = {
      margin: [4, 6, 4, 6],
      filename: "BuildingFaas-Complete.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      const worker = (html2pdf as any)().set(opt).from(element);
      const pdfBlob: Blob = await worker.outputPdf("blob");
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("PDF generation failed — check console for details.");
    }
  };

  const renderBackPage = () => {
    const ROW_APPRAISAL = 6;
    const ROW_ITEMS = 10;
    const ROW_ASSESSMENT = 4;

    return (
      <div className="back-page page-break">
        <div className="sheet back-sheet">
          {/* PROPERTY APPRAISAL */}
          <div className="section-header">PROPERTY APPRAISAL</div>

          <table className="table appraisal-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Area (sq.m.)</th>
                <th>Unit Value</th>
                <th>% of BUCC (SMV)</th>
                <th>Base Market Value (₱)</th>
                <th>% Depn.</th>
                <th>Depreciation Cost (₱)</th>
                <th>Market Value (₱)</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(ROW_APPRAISAL)].map((_, r) => (
                <tr key={r}>
                  {[...Array(9)].map((_, c) => (
                    <td key={c}>
                      <input
                        value={appraisal[`r${r}_c${c}`] || ""}
                        onChange={(e) => setApp(r, c, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="subtotal-row"><td colSpan={9}>Sub-total</td></tr>
            </tbody>
          </table>

          {/* ADDITIONAL ITEMS */}
          <div className="section-header">ADDITIONAL ITEMS:</div>

          <table className="table items-table">
            <tbody>
              {[...Array(ROW_ITEMS)].map((_, r) => (
                <tr key={r}>
                  {[...Array(6)].map((_, c) => (
                    <td key={c}><input
                      value={addItems[`r${r}_c${c}`] || ""}
                      onChange={(e) => setItem(r, c, e.target.value)}
                    /></td>
                  ))}
                </tr>
              ))}
              <tr className="subtotal-row"><td colSpan={6}>Sub-total</td></tr>
              <tr className="subtotal-row"><td colSpan={6}>TOTAL</td></tr>
              <tr className="subtotal-row"><td colSpan={6}>With % Completion</td></tr>
            </tbody>
          </table>

          {/* PROPERTY ASSESSMENT */}
          <div className="section-header">PROPERTY ASSESSMENT</div>

          <table className="table assessment-table">
            <thead>
              <tr>
                <th>Actual Use</th>
                <th>Market Value</th>
                <th>Assessment Level (%)</th>
                <th>Assessment Value</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(ROW_ASSESSMENT)].map((_, r) => (
                <tr key={r}>
                  {[...Array(4)].map((_, c) => (
                    <td key={c}><input
                      value={assessment[`r${r}_c${c}`] || ""}
                      onChange={(e) => setAssess(r, c, e.target.value)}
                    /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="tax-row">
            <label>Taxable <input type="checkbox" /></label>
            <label>Exempt <input type="checkbox" /></label>
            <div className="effectivity">Effectivity of Assessment: ____ Qtr. ____ Yr.</div>
          </div>

          <div className="signature-container">
            <div>
              <div>Appraised by:</div>
              <div className="sig-line"></div>
            </div>
            <div>
              <div>Approved by:</div>
              <div className="sig-line"></div>
              <div className="prov">Acting Provincial Assessor</div>
            </div>
          </div>

          <div className="memoranda">
            MEMORANDA:<br />
            Date of Entry in the Record of Assessment ______ By: ____________
          </div>

          <div className="powered">Powered by: SPIDC</div>
        </div>
      </div>
    );
  };

  return (
    <IonPage className="building-faas-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Building FAAS Form</IonTitle>
          <IonButton slot="end" onClick={generatePdf}>
            <IonIcon icon={documentOutline} /> &nbsp; Generate PDF
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div id="combined-faas-sheet">
          {/* Front Page */}
          <div className="sheet">
            {/* Header inside printable sheet (centered) */}
            <div className="form-title">
              <div>REAL PROPERTY FIELD APPRAISAL AND ASSESSMENT SHEET - BUILDING &amp; OTHER STRUCTURES</div>
            </div>

            {/* Transaction code line (top right) */}
            <div className="transaction-row">
              <div className="trans-label">Transaction Code :</div>
              <div className="trans-input">
                <input
                  value={fields.transactionCode || ""}
                  onChange={(e) => setField("transactionCode", e.target.value)}
                />
              </div>
            </div>

            {/* TOP BOX: ARP, PIN, Owner, Tel, Address, TIN, Admin/Beneficial User */}
            <div className="box top-box">
              <div className="row">
                <div className="cell label">ARP No.:</div>
                <div className="cell input right-aligned">
                  <input value={fields.arpNo || ""} onChange={(e) => setField("arpNo", e.target.value)} />
                </div>

                <div className="cell label narrow">PIN:</div>
                <div className="cell input right-aligned narrow">
                  <input value={fields.pin || ""} onChange={(e) => setField("pin", e.target.value)} />
                </div>
              </div>

              <div className="row">
                <div className="cell label">Owner:</div>
                <div className="cell input right-aligned wide">
                  <input value={fields.owner || ""} onChange={(e) => setField("owner", e.target.value)} />
                </div>

                <div className="cell label narrow">Tel. No.:</div>
                <div className="cell input right-aligned narrow">
                  <input value={fields.tel || ""} onChange={(e) => setField("tel", e.target.value)} />
                </div>
              </div>

              <div className="row">
                <div className="cell label">Address :</div>
                <div className="cell input right-aligned wide">
                  <input value={fields.address || ""} onChange={(e) => setField("address", e.target.value)} />
                </div>

                <div className="cell label narrow">TIN:</div>
                <div className="cell input right-aligned narrow">
                  <input value={fields.tin || ""} onChange={(e) => setField("tin", e.target.value)} />
                </div>
              </div>

              <div className="row">
                <div className="cell label admin-label">Beneficial User:</div>
                <div className="cell input right-aligned wide">
                  <input value={fields.adminName || ""} onChange={(e) => setField("adminName", e.target.value)} />
                </div>

                <div className="cell label narrow">Tel. No.:</div>
                <div className="cell input right-aligned narrow">
                  <input value={fields.adminTel || ""} onChange={(e) => setField("adminTel", e.target.value)} />
                </div>
              </div>

              <div className="row">
                <div className="cell label">Address :</div>
                <div className="cell input right-aligned wide">
                  <input value={fields.adminAddress || ""} onChange={(e) => setField("adminAddress", e.target.value)} />
                </div>

                <div className="cell label narrow">TIN:</div>
                <div className="cell input right-aligned narrow">
                  <input value={fields.adminTin || ""} onChange={(e) => setField("adminTin", e.target.value)} />
                </div>
              </div>
            </div>

            {/* BUILDING LOCATION / LAND REFERENCE */}
            <div className="box two-col-box">
              <div className="col">
                <div className="section-title">BUILDING LOCATION</div>

                <div className="row small">
                  <div className="cell label">No./Street :</div>
                  <div className="cell input right-aligned"><input value={fields.street || ""} onChange={e => setField("street", e.target.value)} /></div>
                </div>

                <div className="row small">
                  <div className="cell label">Brgy./District:</div>
                  <div className="cell input right-aligned"><input value={fields.brgy || ""} onChange={e => setField("brgy", e.target.value)} /></div>
                </div>

                <div className="row small">
                  <div className="cell label">Purok:</div>
                  <div className="cell input right-aligned narrow"><input value={fields.purok || ""} onChange={e => setField("purok", e.target.value)} /></div>
                </div>

                <div className="row small">
                  <div className="cell label">Municipality:</div>
                  <div className="cell input right-aligned narrow"><input value={fields.municipality || ""} onChange={e => setField("municipality", e.target.value)} /></div>
                </div>

                <div className="row small">
                  <div className="cell label">Province :</div>
                  <div className="cell input right-aligned narrow"><input value={fields.province || ""} onChange={e => setField("province", e.target.value)} /></div>
                </div>
              </div>

              <div className="col">
                <div className="section-title">LAND REFERENCE</div>

                <div className="row small">
                  <div className="cell label">Owner:</div>
                  <div className="cell input right-aligned"><input value={fields.landOwner || ""} onChange={e => setField("landOwner", e.target.value)} /></div>
                </div>

                <div className="row small">
                  <div className="cell label">Administrator:</div>
                  <div className="cell input right-aligned"><input value={fields.landAdministrator || ""} onChange={e => setField("landAdministrator", e.target.value)} /></div>
                </div>

                <div className="row small">
                  <div className="cell label narrow">Title No. :</div>
                  <div className="cell input right-aligned narrow"><input value={fields.titleNo || ""} onChange={e => setField("titleNo", e.target.value)} /></div>

                  <div className="cell label narrow">Lot No. :</div>
                  <div className="cell input right-aligned short"><input value={fields.lotNo || ""} onChange={e => setField("lotNo", e.target.value)} /></div>
                </div>

                <div className="row small">
                  <div className="cell label narrow">TD / ARP No. :</div>
                  <div className="cell input right-aligned narrow"><input value={fields.tdArp || ""} onChange={e => setField("tdArp", e.target.value)} /></div>

                  <div className="cell label narrow">Survey No. :</div>
                  <div className="cell input right-aligned short"><input value={fields.surveyNo || ""} onChange={e => setField("surveyNo", e.target.value)} /></div>
                </div>

                <div className="row small">
                  <div className="cell label narrow">Area:</div>
                  <div className="cell input right-aligned narrow"><input value={fields.area || ""} onChange={e => setField("area", e.target.value)} /></div>

                  <div className="cell label narrow">Block No. :</div>
                  <div className="cell input right-aligned short"><input value={fields.blockNo || ""} onChange={e => setField("blockNo", e.target.value)} /></div>
                </div>
              </div>
            </div>

            {/* GENERAL DESCRIPTION */}
            <div className="box gen-box">
              <div className="section-title">GENERAL DESCRIPTION</div>

              <div className="row small">
                <div className="cell label narrow">Kind of Bldg.:</div>
                <div className="cell input right-aligned narrow"><input value={fields.kind || ""} onChange={e => setField("kind", e.target.value)} /></div>

                <div className="cell label special-indicator-label">Bldg. Special Ind.:</div>
                <div className="cell input right-aligned narrow"><input value={fields.special || ""} onChange={e => setField("special", e.target.value)} /></div>

                <div className="cell label narrow">Effective Age:</div>
                <div className="cell input right-aligned narrow"><input value={fields.effectiveAge || ""} onChange={e => setField("effectiveAge", e.target.value)} /></div>
              </div>

              <div className="row small">
                <div className="cell label narrow">Structural Type:</div>
                <div className="cell input right-aligned narrow"><input value={fields.structuralType || ""} onChange={e => setField("structuralType", e.target.value)} /></div>

                <div className="cell label narrow">No. of Storeys:</div>
                <div className="cell input right-aligned narrower"><input value={fields.storeys || ""} onChange={e => setField("storeys", e.target.value)} /></div>
              </div>

              <div className="row small">
                <div className="cell label narrow">Bldg. Permit No.:</div>
                <div className="cell input right-aligned narrow"><input value={fields.permitNo || ""} onChange={e => setField("permitNo", e.target.value)} /></div>

                <div className="cell label narrow">Date:</div>
                <div className="cell input right-aligned short"><input type="date" value={fields.permitDate || ""} onChange={e => setField("permitDate", e.target.value)} /></div>

                <div className="cell label narrow">Area of 1st flr.:</div>
                <div className="cell input right-aligned narrow"><input value={fields.area1 || ""} onChange={e => setField("area1", e.target.value)} /></div>
              </div>

              <div className="row small">
                <div className="cell label cct-label">CCT No.:</div>
                <div className="cell input right-aligned narrow"><input value={fields.cct || ""} onChange={e => setField("cct", e.target.value)} /></div>

                <div className="cell label narrow">Area of 2nd flr.:</div>
                <div className="cell input right-aligned narrow"><input value={fields.area2 || ""} onChange={e => setField("area2", e.target.value)} /></div>
              </div>

              <div className="row small">
                <div className="cell label cert-label">Cert. Completion:</div>
                <div className="cell input right-aligned narrow"><input value={fields.certCompletion || ""} onChange={e => setField("certCompletion", e.target.value)} /></div>

                <div className="cell label narrow">Area of 3rd flr.:</div>
                <div className="cell input right-aligned narrow"><input value={fields.area3 || ""} onChange={e => setField("area3", e.target.value)} /></div>
              </div>

              <div className="row small">
                <div className="cell label cert-label">Cert. Occupancy:</div>
                <div className="cell input right-aligned narrow"><input value={fields.certOccupancy || ""} onChange={e => setField("certOccupancy", e.target.value)} /></div>

                <div className="cell label narrow">Area of 4th flr.:</div>
                <div className="cell input right-aligned narrow"><input value={fields.area4 || ""} onChange={e => setField("area4", e.target.value)} /></div>
              </div>

              <div className="row small">
                <div className="cell label narrow">Date Completed:</div>
                <div className="cell input right-aligned short"><input type="date" value={fields.dateCompleted || ""} onChange={e => setField("dateCompleted", e.target.value)} /></div>

                <div className="cell label narrow">Date Occupied:</div>
                <div className="cell input right-aligned short"><input type="date" value={fields.dateOccupied || ""} onChange={e => setField("dateOccupied", e.target.value)} /></div>

                <div className="cell label">Total Floor Area</div>
                <div className="cell input right-aligned wide"><input value={fields.totalFloorArea || ""} onChange={e => setField("totalFloorArea", e.target.value)} /></div>
              </div>
            </div>

            {/* FLOOR PLAN */}
            <div className="box floor-box">
              <div className="section-title">FLOOR PLAN</div>
              <div className="floor-area-one" />
            </div>

            {/* STRUCTURAL MATERIALS */}
            <div className="box materials-box">
              <div className="section-title">STRUCTURAL MATERIALS (Checklist)</div>
              <div className="small-muted">ROOF / FLOORING (1st-4th) / Walls &amp; Partitions (1st-4th)</div>

              <div className="materials-table">
                <div className="materials-row header">
                  <div className="m cell roof-col">ROOF</div>
                  <div className="m cell flooring-col">FLOORING</div>
                  <div className="m cell floor-col">1st</div>
                  <div className="m cell floor-col">2nd</div>
                  <div className="m cell floor-col">3rd</div>
                  <div className="m cell floor-col">4th</div>
                  <div className="m cell walls-col">Walls & Part</div>
                  <div className="m cell floor-col">1st</div>
                  <div className="m cell floor-col">2nd</div>
                  <div className="m cell floor-col">3rd</div>
                  <div className="m cell floor-col">4th</div>
                </div>

                {Array.from({ length: ROW_COUNT }, (_, i) => {
                  const r = i + 1;
                  return (
                    <div className="materials-row" key={r}>
                      <div className="m cell roof-col"><input value={materials[`r${r}_c1`] || ""} onChange={e => setMat(r, 1, e.target.value)} /></div>
                      <div className="m cell flooring-col"><input value={materials[`r${r}_c2`] || ""} onChange={e => setMat(r, 2, e.target.value)} /></div>
                      <div className="m cell floor-col"><input value={materials[`r${r}_c3`] || ""} onChange={e => setMat(r, 3, e.target.value)} /></div>
                      <div className="m cell floor-col"><input value={materials[`r${r}_c4`] || ""} onChange={e => setMat(r, 4, e.target.value)} /></div>
                      <div className="m cell floor-col"><input value={materials[`r${r}_c5`] || ""} onChange={e => setMat(r, 5, e.target.value)} /></div>
                      <div className="m cell floor-col"><input value={materials[`r${r}_c6`] || ""} onChange={e => setMat(r, 6, e.target.value)} /></div>
                      <div className="m cell walls-col"><input value={materials[`r${r}_c7`] || ""} onChange={e => setMat(r, 7, e.target.value)} /></div>
                      <div className="m cell floor-col"><input value={materials[`r${r}_c8`] || ""} onChange={e => setMat(r, 8, e.target.value)} /></div>
                      <div className="m cell floor-col"><input value={materials[`r${r}_c9`] || ""} onChange={e => setMat(r, 9, e.target.value)} /></div>
                      <div className="m cell floor-col"><input value={materials[`r${r}_c10`] || ""} onChange={e => setMat(r, 10, e.target.value)} /></div>
                      <div className="m cell floor-col"><input value={materials[`r${r}_c11`] || ""} onChange={e => setMat(r, 11, e.target.value)} /></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NOTES */}
            <div className="box notes-box">
              <div className="section-title">Notes / Remarks</div>
              <textarea value={fields.notes || ""} onChange={e => setField("notes", e.target.value)} />
            </div>
          </div>

          {/* Back Page */}
          {renderBackPage()}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BuildingFaas;