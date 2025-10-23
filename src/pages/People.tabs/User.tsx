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
    IonAlert,
    IonToast
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';

interface UserItem {
    user_id: string;
    username: string;
    user_email: string;
    user_firstname: string;
    user_lastname: string;
    date_registered: string;
    user_role: string;
}

const User: React.FC = () => {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState<UserItem | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const searchRef = useRef<HTMLIonSearchbarElement>(null);
    const [isError, setIsError] = useState(false);

    // Focus search input on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            searchRef.current?.setFocus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Fetch data from the user_roles view
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('*')
                .order('date_registered', { ascending: false });

            if (error) throw error;

            // Convert user_id to string to ensure consistency
            const usersWithStringId = (data || []).map(item => ({
                ...item,
                user_id: String(item.user_id)
            }));

            setUsers(usersWithStringId);
        } catch (error) {
            console.error('Error fetching users:', error);
            setToastMessage('Failed to load users');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return users;

        const term = searchTerm.toLowerCase();
        return users.filter(item =>
            item.username.toLowerCase().includes(term) ||
            item.user_email.toLowerCase().includes(term) ||
            item.user_firstname.toLowerCase().includes(term) ||
            item.user_lastname.toLowerCase().includes(term) ||
            item.user_role.toLowerCase().includes(term) ||
            item.user_id.toLowerCase().includes(term)
        );
    }, [users, searchTerm]);

    const handleRowClick = (rowData: UserItem) => {
        setSelectedRow(rowData);
    };

    const handleUpdateClick = () => {
        if (selectedRow) {
            // Update functionality to be implemented later
            console.log('Update user:', selectedRow);
        }
    };

    const handleDeleteClick = async () => {
        if (!selectedRow) return;
        setShowDeleteAlert(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRow) return;

        try {
            setIsLoading(true);
            // Delete functionality to be implemented later
            console.log('Delete user:', selectedRow);
            
            // Temporary success message
            setToastMessage(`User ${selectedRow.username} delete functionality coming soon!`);
            setShowToast(true);
        } catch (error) {
            console.error('Error deleting user:', error);
            setToastMessage('Failed to delete user');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
            setShowDeleteAlert(false);
        }
    };

    const iconButtons = [
        {
            icon: add,
            onClick: () => {
                // Add functionality to be implemented later
                console.log('Add new user');
            },
            disabled: false,
            title: "Add User"
        },
        {
            icon: arrowUpCircle,
            onClick: handleUpdateClick,
            disabled: !selectedRow,
            title: "Edit User"
        },
        {
            icon: trash,
            onClick: handleDeleteClick,
            disabled: !selectedRow,
            title: "Delete User"
        }
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Users</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="search-container">
                            <IonSearchbar
                                ref={searchRef}
                                placeholder="Search users..."
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
                                title="Users"
                                keyField="user_id"
                                onRowClick={handleRowClick}
                                selectedRow={selectedRow} 
                            />
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <IonLoading isOpen={isLoading} message="Loading..." />

                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header={'Confirm Delete'}
                    message={`Are you sure you want to delete the user <strong>${selectedRow?.username}</strong>?`}
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

export default User;