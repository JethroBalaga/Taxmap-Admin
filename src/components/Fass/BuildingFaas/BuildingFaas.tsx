import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonDatetime,
} from "@ionic/react";
import { printOutline } from "ionicons/icons";
import "./BuildingFaas.css";

const BuildingFaas: React.FC = () => {
  const handlePrint = () => window.print();

  const sections = [
    {
      title: "TRANSACTION INFORMATION",
      fields: [
        { label: "Transaction Code", size: "6" },
        { label: "ARP No.", size: "6" },
        { label: "PIN", size: "6" },
      ],
    },
    {
      title: "OWNER INFORMATION",
      fields: [
        { label: "Owner", size: "6" },
        { label: "Tel. No.", size: "6" },
        { label: "Address", size: "12" },
        { label: "TIN", size: "6" },
      ],
    },
    {
      title: "ADMINISTRATOR / BENEFICIAL USER",
      fields: [
        { label: "Administrator", size: "6" },
        { label: "Tel. No.", size: "6" },
        { label: "Address", size: "12" },
        { label: "TIN", size: "6" },
      ],
    },
    {
      title: "BUILDING LOCATION / LAND REFERENCE",
      fields: [
        { label: "No./Street", size: "6" },
        { label: "Owner", size: "6" },
        { label: "Brgy./District", size: "4" },
        { label: "Title No.", size: "4" },
        { label: "Lot No.", size: "4" },
        { label: "Municipality", size: "4" },
        { label: "TD/ARP No.", size: "4" },
        { label: "Area", size: "4" },
      ],
    },
    {
      title: "GENERAL DESCRIPTION",
      fields: [
        { label: "Kind of Bldg.", size: "4" },
        { label: "Bldg. Age", size: "4" },
        { label: "Effective Age", size: "4" },
        { label: "Structural Type", size: "6" },
        { label: "No. of Storeys", size: "6" },
        { label: "Bldg. Permit No.", size: "6" },
        { label: "Date", size: "6", type: "date" }, // will render IonDatetime
        { label: "Area of 1st flr.", size: "6" },
        { label: "Area of 2nd flr.", size: "6" },
        { label: "Area of 3rd flr.", size: "6" },
        { label: "Total Floor Area", size: "6" },
      ],
    },
    {
      title: "STRUCTURAL MATERIALS",
      fields: [
        { label: "Roof", size: "12" },
        { label: "Flooring", size: "12" },
        { label: "Walls & Partitions", size: "12" },
      ],
    },
  ];

  return (
    <IonPage className="faas-page">
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle>
            REAL PROPERTY FIELD APPRAISAL AND ASSESSMENT SHEET - BUILDING & OTHER STRUCTURES
          </IonTitle>
          <IonButton slot="end" fill="clear" onClick={handlePrint} className="print-btn">
            <IonIcon icon={printOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid className="faas-grid">
          {sections.map((section, sIdx) => (
            <div key={sIdx}>
              <h2 className="section-title">{section.title}</h2>
              <IonGrid>
                <IonRow>
                  {section.fields.map((field, fIdx) => (
                    <IonCol key={fIdx} size={field.size}>
                      <label>{field.label}:</label>
                      {field.type === "date" ? (
                        <IonDatetime presentation="date" />
                      ) : (
                        <IonInput />
                      )}
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            </div>
          ))}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default BuildingFaas;
