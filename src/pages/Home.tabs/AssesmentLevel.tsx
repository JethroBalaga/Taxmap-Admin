import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonLoading,
    IonSearchbar,
    IonAlert,
    IonToast
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup2.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import { useLocation } from 'react-router-dom';
import AssessmentCreateModal from '../../components/AssesmentLevelModals/AssesmentCreateModal';
import AssessmentUpdateModal from '../../components/AssesmentLevelModals/AssessmentUpdateModal';

interface AssessmentLevelItem {
    assessment_level_id: number;
    kind_id: number;
    class_id: number;
    effective_year: string;
    range1: string | number;
    range2: string | number;
    rate_percent: string;
    created_at?: string;
}

const AssessmentLevel: React.FC = () => {
    const [assessmentLevels, setAssessmentLevels] = useState<AssessmentLevelItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState<AssessmentLevelItem | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const searchRef = useRef<HTMLIonSearchbarElement>(null);
    const [isError, setIsError] = useState(false);
    const location = useLocation();
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedAssessmentLevel, setSelectedAssessmentLevel] = useState<AssessmentLevelItem | null>(null);

    // Get kind_id from URL
    const queryParams = new URLSearchParams(location.search);
    const kindId = queryParams.get('kind_id');

    // Fetch data
    const fetchAssessmentLevels = async () => {
        if (!kindId) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('assessmentleveltbl')
                .select('*')
                .eq('kind_id', kindId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setAssessmentLevels(data || []);
        } catch (error) {
            console.error('Error fetching assessment levels:', error);
            setToastMessage('Failed to load assessment levels');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAssessmentLevels();
    }, [kindId]);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return assessmentLevels;

        const term = searchTerm.toLowerCase();
        return assessmentLevels.filter(item =>
            item.assessment_level_id.toString().includes(term) ||
            item.effective_year.toLowerCase().includes(term) ||
            item.rate_percent.toLowerCase().includes(term)
        );
    }, [assessmentLevels, searchTerm]);

    const handleRowClick = (rowData: AssessmentLevelItem) => {
        setSelectedRow(rowData);
    };

    const handleUpdateClick = () => {
        if (!selectedRow) return;
        setSelectedAssessmentLevel(selectedRow);
        setShowUpdateModal(true);
    };

    const handleDeleteClick = () => {
        if (!selectedRow) return;
        setShowDeleteAlert(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRow) return;

        try {
            setIsLoading(true);
            const { error } = await supabase
                .from('assessmentleveltbl')
                .delete()
                .eq('assessment_level_id', selectedRow.assessment_level_id);

            if (error) throw error;

            await fetchAssessmentLevels();
            setSelectedRow(null);
            setToastMessage('Assessment level deleted successfully');
            setIsError(false);
            setShowToast(true);
        } catch (error) {
            console.error('Error deleting assessment level:', error);
            setToastMessage('Failed to delete assessment level');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
            setShowDeleteAlert(false);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Assessment Levels - Kind {kindId}</IonTitle>
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
                                    title="Add Assessment Level"
                                />
                                <IonIcon
                                    icon={arrowUpCircle}
                                    className={`icon-yellow ${!selectedRow ? 'icon-disabled' : ''}`}
                                    onClick={handleUpdateClick}
                                    title="Edit Assessment Level"
                                />
                                <IonIcon
                                    icon={trash}
                                    className={`icon-yellow ${!selectedRow ? 'icon-disabled' : ''}`}
                                    onClick={handleDeleteClick}
                                    title="Delete Assessment Level"
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

                {/* Create Modal */}
                {kindId && (
                    <AssessmentCreateModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onAssessmentLevelCreated={fetchAssessmentLevels}
                        kind_id={kindId}
                    />
                )}
                {selectedRow && (
                    <AssessmentUpdateModal
                        isOpen={showUpdateModal}
                        onClose={() => setShowUpdateModal(false)}
                        assessmentLevelData={{
                            assessment_level_id: selectedRow.assessment_level_id,
                            kind_id: kindId || '',
                            class_id: selectedRow.class_id,
                            effective_year: selectedRow.effective_year,
                            range1: typeof selectedRow.range1 === 'string' ?
                                parseFloat(selectedRow.range1) : selectedRow.range1,
                            range2: typeof selectedRow.range2 === 'string' ?
                                parseFloat(selectedRow.range2) : selectedRow.range2,
                            rate_percent: selectedRow.rate_percent
                        }}
                        onAssessmentLevelUpdated={fetchAssessmentLevels}
                    />
                )}
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