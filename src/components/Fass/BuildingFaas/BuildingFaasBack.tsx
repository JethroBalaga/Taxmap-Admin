// FILE: BuildingFaasBack.tsx
import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon
} from "@ionic/react";
import { documentOutline } from "ionicons/icons";
import html2pdf from "html2pdf.js";
import "../../../CSS/BuildingFaasBack.css";

const ROW_APPRAISAL = 6;
const ROW_ITEMS = 10;
const ROW_ASSESSMENT = 4;

const BuildingFaasBack: React.FC = () => {
  const [appraisal, setAppraisal] = useState<Record<string, string>>({});
  const [addItems, setAddItems] = useState<Record<string, string>>({});
  const [assessment, setAssessment] = useState<Record<string, string>>({});

  const setApp = (r: number, c: number, v: string) =>
    setAppraisal((p) => ({ ...p, [`r${r}_c${c}`]: v }));

  const setItem = (r: number, c: number, v: string) =>
    setAddItems((p) => ({ ...p, [`r${r}_c${c}`]: v }));

  const setAssess = (r: number, c: number, v: string) =>
    setAssessment((p) => ({ ...p, [`r${r}_c${c}`]: v }));

  const generatePdf = async () => {
    const element = document.getElementById("faas-back-sheet");
    if (!element) return;

    const opt: any = {
      margin: [4, 6, 4, 6],
      filename: "BuildingFaasBack.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      const worker = (html2pdf as any)().set(opt).from(element);
      const blob: Blob = await worker.outputPdf("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("PDF failed", err);
      alert("PDF generation failed — check console.");
    }
  };

  return (
    <IonPage className="building-faas-back-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Building FAAS - BACK PAGE</IonTitle>
          <IonButton slot="end" onClick={generatePdf}>
            <IonIcon icon={documentOutline} /> &nbsp; Generate PDF
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div id="faas-back-sheet" className="sheet">

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
      </IonContent>
    </IonPage>
  );
};

export default BuildingFaasBack;
