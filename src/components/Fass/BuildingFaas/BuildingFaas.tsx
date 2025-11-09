import React, { useState, useEffect, useCallback } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonButtons
} from "@ionic/react";
import { documentOutline, close } from "ionicons/icons";
import html2pdf from "html2pdf.js";

import BuildingFaasFront from "./BuildingFaasFront";
import BuildingFaasBack from "./BuildingFaasBack";
import "../../../CSS/BuildingFaas.css";

const ROW_COUNT = 16;

interface BuildingFaasProps {
  formData?: any;
  generalData?: any[];
  assessmentSummary?: any[];
  buildingAdjustments?: any[];
  buildingCodes?: any[];
  onClose?: () => void;
}

const BuildingFaas: React.FC<BuildingFaasProps> = ({ 
  formData, 
  generalData = [], 
  assessmentSummary = [], 
  buildingAdjustments = [],
  buildingCodes = [],
  onClose 
}) => {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [materials, setMaterials] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (let r = 1; r <= ROW_COUNT; r++) {
      for (let c = 1; c <= 11; c++) m[`r${r}_c${c}`] = "";
    }
    return m;
  });

  // Back page states
  const [isTaxable, setIsTaxable] = useState<boolean>(true);
  const [isExempt, setIsExempt] = useState<boolean>(false);
  const [currentQuarter, setCurrentQuarter] = useState<string>("1");
  const [currentYear, setCurrentYear] = useState<string>("");

  // Populate form data when props change
  useEffect(() => {
    if (formData) {
      const updatedFields = { ...fields };
      
      // Basic form data
      if (formData.declarant_name) updatedFields.owner = formData.declarant_name;
      if (formData.district_name) updatedFields.brgy = formData.district_name;
      if (formData.kind_description) updatedFields.kind = formData.kind_description;
      
      setFields(updatedFields);
    }
  }, [formData]);

  // Set current quarter and year
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    setCurrentQuarter("1");
    setCurrentYear(year.toString());
  }, []);

  // Front page handlers
  const setField = (k: string, v: string) => setFields((p) => ({ ...p, [k]: v }));
  const setMat = (r: number, c: number, v: string) =>
    setMaterials((p) => ({ ...p, [`r${r}_c${c}`]: v }));

  // Back page handlers
  const handleTaxableChange = (taxable: boolean) => {
    setIsTaxable(taxable);
    if (taxable) setIsExempt(false);
  };

  const handleExemptChange = (exempt: boolean) => {
    setIsExempt(exempt);
    if (exempt) setIsTaxable(false);
  };

  const generatePdf = useCallback(async () => {
    const element = document.getElementById("combined-faas-sheet");
    if (!element) return;

    const opt: any = {
      margin: [4, 6, 4, 6],
      filename: `BuildingFAAS_${formData?.form_id || 'unknown'}.pdf`,
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
  }, [formData]);

  return (
    <IonPage className="building-faas-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Building FAAS Form</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={generatePdf}>
              <IonIcon icon={documentOutline} /> &nbsp; Generate PDF
            </IonButton>
            {onClose && (
              <IonButton onClick={onClose}>
                <IonIcon icon={close} />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div id="combined-faas-sheet">
          {/* Front Page */}
          <BuildingFaasFront 
            fields={fields}
            materials={materials}
            onFieldChange={setField}
            onMaterialChange={setMat}
          />

          {/* Back Page */}
          <BuildingFaasBack
            formData={formData}
            generalData={generalData}
            assessmentSummary={assessmentSummary}
            buildingAdjustments={buildingAdjustments}
            isTaxable={isTaxable}
            isExempt={isExempt}
            currentQuarter={currentQuarter}
            currentYear={currentYear}
            onTaxableChange={handleTaxableChange}
            onExemptChange={handleExemptChange}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BuildingFaas;