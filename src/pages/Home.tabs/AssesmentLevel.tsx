import React, { useState, useRef, useMemo } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
  IonAlert,
  IonToast
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';

interface AssessmentLevelItem {
  assessment_level_id: string;
  effective_year: string;
  level_percent: string;
  created_at?: string;
}

const AssessmentLevel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assessmentLevels, setAssessmentLevels] = useState<AssessmentLevelItem[]>([]);
  const [selectedRow, setSelectedRow] = useState<AssessmentLevelItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();
  const [isError, setIsError] = useState(false);

  // Get district_id from URL
  const queryParams = new URLSearchParams(location.search);
  const districtId = queryParams.get('district_id');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return assessmentLevels;
    const term = searchTerm.toLowerCase();

    return assessmentLevels.filter(item => {
      const assessmentLevelId = item.assessment_level_id?.toString().toLowerCase() || '';
      const effectiveYear = item.effective_year?.toString().toLowerCase() || '';
      const levelPercent = item.level_percent?.toString().toLowerCase() || '';

      return (
        assessmentLevelId.includes(term) ||
        effectiveYear.includes(term) ||
        levelPercent.includes(term)
      );
    });
  }, [assessmentLevels, searchTerm]);

  const handleRowClick = (rowData: AssessmentLevelItem) => {
    setSelectedRow(rowData);
  };

  const handleDeleteClick = () => {
    if (!selectedRow) return;
    setShowDeleteAlert(true);
  };

  const handleUpdateClick = () => {
    if (!selectedRow) return;
    setShowUpdateModal(true);
  };

  const handleDeleteConfirm = async () => {
    // Delete functionality will be added here
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Assessment Levels - District {districtId}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search by year, ID, or level..."
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={200}
              />

              <div className="icon-group">
                <IonIcon
                  icon={add}
                  className="icon-yellow"
                  onClick={() => setShowCreateModal(true)}
                />
                <IonIcon
                  icon={arrowUpCircle}
                  className={`icon-yellow ${!selectedRow ? 'icon-disabled' : ''}`}
                  onClick={handleUpdateClick}
                />
                <IonIcon
                  icon={trash}
                  className={`icon-yellow ${!selectedRow ? 'icon-disabled' : ''}`}
                  onClick={handleDeleteClick}
                />
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <DynamicTable
                data={filteredData}
                title="Assessment Levels"
                keyField="assessment_level_id"
                onRowClick={handleRowClick}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading..." />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirm Delete'}
          message={`Are you sure you want to delete the assessment level for year ${selectedRow?.effective_year}?`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
            },
            {
              text: 'Delete',
              handler: handleDeleteConfirm
            }
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={isError ? 'danger' : 'success'}
        />
      </IonContent>
    </IonPage>
  );
};

export default AssessmentLevel;