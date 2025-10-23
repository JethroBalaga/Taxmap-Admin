import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonLoading,
  IonSearchbar,
  IonToast
} from '@ionic/react';
import { businessOutline, readerOutline, buildOutline, earthOutline } from 'ionicons/icons';
import './../../CSS/Setup2.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import { useHistory } from 'react-router-dom';

interface KindItem {
  kind_id: number;
  description: string;
  created_at?: string;
}

const Kind: React.FC = () => {
  const [kinds, setKinds] = useState<KindItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<KindItem | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const history = useHistory();

  // Check if selected row has description "BUILDING"
  const isBuilding = selectedRow && selectedRow.description.toUpperCase() === 'BUILDING';
  
  // Check if selected row has description "MACHINERY"
  const isMachinery = selectedRow && selectedRow.description.toUpperCase() === 'MACHINERY';

  // Check if selected row has description "LAND"
  const isLand = selectedRow && selectedRow.description.toUpperCase() === 'LAND';

  // Fetch data
  const fetchKinds = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('kindtbl')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setKinds(data || []);
    } catch (error) {
      console.error('Error fetching kinds:', error);
      setToastMessage('Failed to load kinds');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKinds();
  }, []);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return kinds;

    const term = searchTerm.toLowerCase();
    return kinds.filter(item =>
      item.kind_id.toString().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
  }, [kinds, searchTerm]);

  const handleRowClick = (rowData: KindItem) => {
    setSelectedRow(rowData);
  };

  const handleManageAssessmentLevels = () => {
    if (!selectedRow) return;
    history.push(`/menu/home/assesmentlevel?kind_id=${selectedRow.kind_id}`);
  };

  const handleBuildingStructuralType = () => {
    if (!selectedRow || !isBuilding) return;
    
    // Navigate to Structure tab with kind_id as a parameter
    history.push({
      pathname: '/menu/home/structure',
      search: `?kind_id=${selectedRow.kind_id}`,
      state: {
        kindData: {
          kind_id: selectedRow.kind_id,
          description: selectedRow.description
        }
      }
    });
  };

  const handleManageEquipment = () => {
    if (!selectedRow || !isMachinery) return;
    
    // Navigate to Equipment page
    history.push({
      pathname: '/menu/home/equipment',
      search: `?kind_id=${selectedRow.kind_id}`,
      state: {
        kindData: {
          kind_id: selectedRow.kind_id,
          description: selectedRow.description
        }
      }
    });
  };

  const handleLandManagement = () => {
    if (!selectedRow || !isLand) return;
    
    // Navigate to Land Adjustment page
    history.push({
      pathname: '/menu/home/landadjustment',
      search: `?kind_id=${selectedRow.kind_id}`,
      state: {
        kindData: {
          kind_id: selectedRow.kind_id,
          description: selectedRow.description
        }
      }
    });
  };

  const iconButtons = [
    { icon: readerOutline, onClick: handleManageAssessmentLevels, disabled: !selectedRow, title: "Manage Assessment Levels" },
    { icon: businessOutline, onClick: handleBuildingStructuralType, disabled: !isBuilding, title: "Building Structural Type" },
    { icon: buildOutline, onClick: handleManageEquipment, disabled: !isMachinery, title: "Manage Equipment" },
    { icon: earthOutline, onClick: handleLandManagement, disabled: !isLand, title: "Land Management" }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Kind Setup</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search kinds..."
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={200}
              />

              <div className="icon-group">
                {iconButtons.map((btn, index) => (
                  <IonIcon
                    key={index}
                    icon={btn.icon}
                    className={`icon-yellow ${btn.disabled ? 'icon-disabled' : ''}`}
                    onClick={btn.disabled ? undefined : btn.onClick}
                    title={btn.title}
                  />
                ))}
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <DynamicTable
                data={filteredData}
                title="Kinds"
                keyField="kind_id"
                onRowClick={handleRowClick}
                selectedRow={selectedRow} 
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading..." />

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

export default Kind;