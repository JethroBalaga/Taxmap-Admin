import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
    IonToast,
    IonAlert
} from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import { useLocation } from 'react-router-dom';

interface DeviceItem {
    device_id: string;
    user_id: string;
    device_name: string;
    registered: boolean;
    registered_at: string | null;
    created_at: string;
}

const DeviceManagement: React.FC = () => {
    const [devices, setDevices] = useState<DeviceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState<DeviceItem | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [showConfirmAlert, setShowConfirmAlert] = useState(false);
    const searchRef = useRef<HTMLIonSearchbarElement>(null);
    const location = useLocation();

    // Focus search input on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            searchRef.current?.setFocus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Fetch devices data
    const fetchDevices = useCallback(async () => {
        setIsLoading(true);
        try {
            // Get user_id from URL parameters if available
            const urlParams = new URLSearchParams(location.search);
            const userId = urlParams.get('user_id');

            let query = supabase
                .from('deviceregistration')
                .select('*')
                .order('created_at', { ascending: false });

            // Filter by user_id if provided
            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Convert device_id to string to ensure consistency
            const devicesWithStringId = (data || []).map(item => ({
                ...item,
                device_id: String(item.device_id),
                user_id: String(item.user_id)
            }));

            setDevices(devicesWithStringId);
        } catch (error) {
            console.error('Error fetching devices:', error);
            setToastMessage('Failed to load devices');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    }, [location.search]);

    // Refresh data on component mount
    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return devices;

        const term = searchTerm.toLowerCase();
        return devices.filter(item =>
            item.device_name.toLowerCase().includes(term) ||
            item.device_id.toLowerCase().includes(term) ||
            item.user_id.toLowerCase().includes(term)
        );
    }, [devices, searchTerm]);

    const handleRowClick = (rowData: DeviceItem) => {
        setSelectedRow(rowData);
        
        // Show appropriate confirmation based on registration status
        if (rowData.registered) {
            setToastMessage(`Do you want to unregister this device?`);
        } else {
            setToastMessage(`Allow this device?`);
        }
        setShowConfirmAlert(true);
    };

    const handleRegisterDevice = async () => {
        if (!selectedRow) return;

        try {
            setIsLoading(true);

            if (selectedRow.registered) {
                // Unregister device - delete it
                const { error } = await supabase
                    .from('deviceregistration')
                    .delete()
                    .eq('device_id', selectedRow.device_id);

                if (error) throw error;

                setToastMessage('Device unregistered and deleted successfully');
            } else {
                // Register device - set registered to true and update timestamp
                const { error } = await supabase
                    .from('deviceregistration')
                    .update({ 
                        registered: true,
                        registered_at: new Date().toISOString()
                    })
                    .eq('device_id', selectedRow.device_id);

                if (error) throw error;

                setToastMessage('Device registered successfully');
            }

            setShowToast(true);
            setIsError(false);
            
            // Refresh the device list
            fetchDevices();
            
        } catch (error) {
            console.error('Error updating device:', error);
            setToastMessage('Failed to update device');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
            setShowConfirmAlert(false);
        }
    };

    const handleCancelAction = () => {
        if (!selectedRow?.registered) {
            // Only delete if the device was not registered (pending registration)
            handleDeleteDevice();
        } else {
            setShowConfirmAlert(false);
        }
    };

    const handleDeleteDevice = async () => {
        if (!selectedRow) return;

        try {
            setIsLoading(true);

            const { error } = await supabase
                .from('deviceregistration')
                .delete()
                .eq('device_id', selectedRow.device_id);

            if (error) throw error;

            setToastMessage('Device deleted successfully');
            setShowToast(true);
            setIsError(false);
            
            // Refresh the device list
            fetchDevices();
            
        } catch (error) {
            console.error('Error deleting device:', error);
            setToastMessage('Failed to delete device');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
            setShowConfirmAlert(false);
        }
    };

    const iconButtons = [
        {
            icon: checkmarkCircleOutline,
            onClick: () => selectedRow && handleRowClick(selectedRow),
            disabled: !selectedRow,
            title: "Manage Device Registration"
        }
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Device Management</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="search-container">
                            <IonSearchbar
                                ref={searchRef}
                                placeholder="Search devices..."
                                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                                debounce={0}
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
                                title="Devices"
                                keyField="device_id"
                                onRowClick={handleRowClick}
                                selectedRow={selectedRow} 
                            />
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <IonLoading isOpen={isLoading} message="Loading..." />

                {/* Confirmation Alert */}
                <IonAlert
                    isOpen={showConfirmAlert}
                    onDidDismiss={() => setShowConfirmAlert(false)}
                    header={selectedRow?.registered ? 'Unregister Device' : 'Register Device'}
                    message={selectedRow?.registered 
                        ? `Do you want to unregister the device "${selectedRow?.device_name}"? This will delete the device record.`
                        : `Allow the device "${selectedRow?.device_name}" to be registered?`
                    }
                    buttons={[
                        {
                            text: 'No',
                            role: 'cancel',
                            handler: selectedRow?.registered ? undefined : handleCancelAction
                        },
                        {
                            text: 'Yes',
                            handler: handleRegisterDevice
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

export default DeviceManagement;