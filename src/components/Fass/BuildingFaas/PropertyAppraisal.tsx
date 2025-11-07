import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonDatetime,
} from "@ionic/react";
import "../../../CSS/BuildingFaas.css";

const PropertyAppraisal: React.FC = () => {
  const appraisalFields = [
    { label: "Description", size: "3" },
    { label: "Area", size: "2" },
    { label: "Unit Value", size: "2" },
    { label: "% Depreciation", size: "2" },
    { label: "Market Value", size: "3" },
  ];

  const assessmentFields = [
    { label: "Actual Use", size: "3" },
    { label: "Market Value", size: "3" },
    { label: "Assessment Level (%)", size: "3" },
    { label: "Assessment Value", size: "3" },
  ];

  const approvalFields = [
    { label: "Appraised by", size: "6" },
    { label: "Approved by", size: "6" },
    { label: "Memoranda / Remarks", size: "12" },
    { label: "Date of Entry in Record", size: "6", type: "date" },
    { label: "By", size: "6" },
  ];

  return (
    <IonPage className="faas-page page-break">
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle>PROPERTY APPRAISAL AND ASSESSMENT</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid className="faas-grid">
          <h2 className="section-title">PROPERTY APPRAISAL</h2>

          <IonRow className="table-header">
            {appraisalFields.map((f, i) => (
              <IonCol key={i}>{f.label}</IonCol>
            ))}
          </IonRow>

          {[...Array(5)].map((_, rowIndex) => (
            <IonRow key={rowIndex}>
              {appraisalFields.map((f, colIndex) => (
                <IonCol key={colIndex} size={f.size}>
                  <IonInput />
                </IonCol>
              ))}
            </IonRow>
          ))}

          <h2 className="section-title">PROPERTY ASSESSMENT</h2>
          <IonRow className="table-header">
            {assessmentFields.map((f, i) => (
              <IonCol key={i}>{f.label}</IonCol>
            ))}
          </IonRow>

          <IonRow>
            {assessmentFields.map((f, i) => (
              <IonCol key={i} size={f.size}>
                <IonInput />
              </IonCol>
            ))}
          </IonRow>

          <h2 className="section-title">APPROVALS</h2>
          {approvalFields.map((f, idx) => (
            <IonRow key={idx}>
              <IonCol size={f.size}>
                <label>{f.label}:</label>
                {f.type === "date" ? <IonDatetime presentation="date" /> : <IonInput />}
              </IonCol>
            </IonRow>
          ))}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default PropertyAppraisal;
