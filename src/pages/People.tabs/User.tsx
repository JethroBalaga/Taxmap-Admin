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
    IonToast,
    IonModal,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonButtons
} from '@ionic/react';
import { add, arrowUpCircle, banOutline, trash, eye, eyeOff, checkmarkCircle, closeCircle } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import { useHistory, useLocation } from 'react-router-dom';
import bcrypt from 'bcryptjs';

interface UserItem {
    user_id: string;
    username: string;
    user_email: string;
    user_firstname: string;
    user_lastname: string;
    date_registered: string;
    user_role: string;
    suspended: boolean;
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
    const history = useHistory();
    const location = useLocation();
    
    // Ban functionality states
    const [showBanModal, setShowBanModal] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const [isPasswordCorrect, setIsPasswordCorrect] = useState<boolean | null>(null);
    const [currentAdmin, setCurrentAdmin] = useState<any>(null);
    const [deleteAdminPassword, setDeleteAdminPassword] = useState('');
    const [showDeleteAdminPassword, setShowDeleteAdminPassword] = useState(false);
    const [isDeletePasswordCorrect, setIsDeletePasswordCorrect] = useState<boolean | null>(null);

    // Focus search input on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            searchRef.current?.setFocus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Get current admin session
    useEffect(() => {
        const getCurrentAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setCurrentAdmin(session.user);
            }
        };
        getCurrentAdmin();
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

    // Refresh data when coming from registration
    useEffect(() => {
        fetchUsers();
        
        // Check if we're coming from registration with refresh parameter
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.has('refresh')) {
            setToastMessage('User list refreshed successfully');
            setShowToast(true);
        }
    }, [fetchUsers, location.search]);

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

    // Get admin user data with password
    const getAdminUserData = async () => {
        if (!currentAdmin) return null;

        try {
            // First check if user is admin
            const { data: adminData, error: adminError } = await supabase
                .from('admins')
                .select('user_id')
                .eq('user_id', currentAdmin.id)
                .single();

            if (adminError || !adminData) {
                return null;
            }

            // Then get the user data with password
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('user_password')
                .eq('user_id', currentAdmin.id)
                .single();

            if (userError || !userData) {
                return null;
            }

            return userData;
        } catch (error) {
            console.error('Error getting admin user data:', error);
            return null;
        }
    };

    // Check admin password in real-time
    const checkAdminPassword = async (password: string) => {
        if (!currentAdmin || !password) {
            setIsPasswordCorrect(null);
            return false;
        }

        try {
            const userData = await getAdminUserData();
            
            if (!userData) {
                setIsPasswordCorrect(false);
                return false;
            }

            // Verify admin password against the stored hash in users table
            const isCorrect = await bcrypt.compare(password, userData.user_password);
            setIsPasswordCorrect(isCorrect);
            return isCorrect;
        } catch (error) {
            console.error('Error checking admin password:', error);
            setIsPasswordCorrect(false);
            return false;
        }
    };

    // Check delete admin password in real-time
    const checkDeleteAdminPassword = async (password: string) => {
        if (!currentAdmin || !password) {
            setIsDeletePasswordCorrect(null);
            return false;
        }

        try {
            const userData = await getAdminUserData();
            
            if (!userData) {
                setIsDeletePasswordCorrect(false);
                return false;
            }

            const isCorrect = await bcrypt.compare(password, userData.user_password);
            setIsDeletePasswordCorrect(isCorrect);
            return isCorrect;
        } catch (error) {
            console.error('Error checking admin password:', error);
            setIsDeletePasswordCorrect(false);
            return false;
        }
    };

    const handleAdminPasswordChange = async (password: string) => {
        setAdminPassword(password);
        if (password) {
            await checkAdminPassword(password);
        } else {
            setIsPasswordCorrect(null);
        }
    };

    const handleDeleteAdminPasswordChange = async (password: string) => {
        setDeleteAdminPassword(password);
        if (password) {
            await checkDeleteAdminPassword(password);
        } else {
            setIsDeletePasswordCorrect(null);
        }
    };

    const handleBanClick = () => {
        if (!selectedRow) return;

        // Prevent admin from banning themselves
        if (selectedRow.user_id === currentAdmin?.id) {
            setToastMessage('You cannot ban your own account');
            setIsError(true);
            setShowToast(true);
            return;
        }

        // Prevent banning other admins (optional - remove if you want to allow banning other admins)
        if (selectedRow.user_role === 'admin') {
            setToastMessage('Cannot ban other administrators');
            setIsError(true);
            setShowToast(true);
            return;
        }

        setShowBanModal(true);
    };

    const handleBanConfirm = async () => {
        if (!selectedRow || !currentAdmin) return;

        try {
            setIsLoading(true);

            // Verify admin password first
            const userData = await getAdminUserData();
            if (!userData) {
                setToastMessage('Admin verification failed');
                setIsError(true);
                setShowToast(true);
                return;
            }

            const isCorrect = await bcrypt.compare(adminPassword, userData.user_password);
            if (!isCorrect) {
                setToastMessage('Invalid admin password');
                setIsError(true);
                setShowToast(true);
                return;
            }

            // Update the user's suspended status
            const { error } = await supabase
                .from('users')
                .update({ suspended: true })
                .eq('user_id', selectedRow.user_id);

            if (error) throw error;

            setToastMessage(`User ${selectedRow.username} has been banned successfully`);
            setShowToast(true);
            
            // Refresh the user list
            fetchUsers();
            
            // Reset states
            setShowBanModal(false);
            setAdminPassword('');
            setIsPasswordCorrect(null);
            setShowAdminPassword(false);
            
        } catch (error) {
            console.error('Error banning user:', error);
            setToastMessage('Failed to ban user');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateClick = () => {
        if (selectedRow) {
            // Update functionality to be implemented later
            console.log('Update user:', selectedRow);
            setToastMessage(`Update functionality for ${selectedRow.username} coming soon!`);
            setShowToast(true);
        }
    };

    const handleDeleteClick = async () => {
        if (!selectedRow) return;

        // Prevent admin from deleting themselves
        if (selectedRow.user_id === currentAdmin?.id) {
            setToastMessage('You cannot delete your own account');
            setIsError(true);
            setShowToast(true);
            return;
        }

        // Prevent deleting other admins (optional - remove if you want to allow deleting other admins)
        if (selectedRow.user_role === 'admin') {
            setToastMessage('Cannot delete other administrators');
            setIsError(true);
            setShowToast(true);
            return;
        }

        setShowDeleteAlert(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRow || !currentAdmin) return;

        try {
            setIsLoading(true);

            // Verify admin password first
            const userData = await getAdminUserData();
            if (!userData) {
                setToastMessage('Admin verification failed');
                setIsError(true);
                setShowToast(true);
                return;
            }

            const isCorrect = await bcrypt.compare(deleteAdminPassword, userData.user_password);
            if (!isCorrect) {
                setToastMessage('Invalid admin password');
                setIsError(true);
                setShowToast(true);
                return;
            }

            // Delete the user from auth and cascade to users table
            const { error } = await supabase.auth.admin.deleteUser(selectedRow.user_id);

            if (error) throw error;

            setToastMessage(`User ${selectedRow.username} has been deleted successfully`);
            setShowToast(true);
            
            // Refresh the user list
            fetchUsers();
            
            // Reset states
            setShowDeleteAlert(false);
            setDeleteAdminPassword('');
            setIsDeletePasswordCorrect(null);
            setShowDeleteAdminPassword(false);
            
        } catch (error) {
            console.error('Error deleting user:', error);
            setToastMessage('Failed to delete user');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = () => {
        history.push('/menu/people/register');
    };

    const iconButtons = [
        {
            icon: add,
            onClick: handleAddUser,
            disabled: false,
            title: "Add User"
        },
        {
            icon: banOutline,
            onClick: handleBanClick,
            disabled: !selectedRow,
            title: "Ban User"
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

                {/* Ban Confirmation Modal with Admin Password */}
                <IonModal isOpen={showBanModal} onDidDismiss={() => {
                    setShowBanModal(false);
                    setAdminPassword('');
                    setIsPasswordCorrect(null);
                    setShowAdminPassword(false);
                }}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Ban User Confirmation</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setShowBanModal(false)}>Close</IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <h2>Confirm Ban User</h2>
                            <p>You are about to ban the user: <strong>{selectedRow?.username}</strong></p>
                            <p style={{ color: 'var(--ion-color-danger)', fontSize: '14px' }}>
                                This action will suspend the user's account and prevent them from logging in.
                            </p>
                            
                            <IonItem style={{ margin: '20px 0' }}>
                                <IonLabel position="stacked">Admin Password Verification</IonLabel>
                                <IonInput
                                    type={showAdminPassword ? "text" : "password"}
                                    value={adminPassword}
                                    onIonInput={(e) => handleAdminPasswordChange(e.detail.value!)}
                                    placeholder="Enter your admin password to confirm"
                                />
                                <IonButtons slot="end">
                                    <IonButton onClick={() => setShowAdminPassword(!showAdminPassword)}>
                                        <IonIcon icon={showAdminPassword ? eyeOff : eye} />
                                    </IonButton>
                                </IonButtons>
                            </IonItem>

                            {/* Password validation indicator */}
                            {adminPassword && (
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    margin: '10px 0',
                                    color: isPasswordCorrect ? 'green' : 'red'
                                }}>
                                    <IonIcon 
                                        icon={isPasswordCorrect ? checkmarkCircle : closeCircle} 
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span>
                                        {isPasswordCorrect ? 'Password is correct' : 'Password is incorrect'}
                                    </span>
                                </div>
                            )}

                            <IonButton
                                onClick={handleBanConfirm}
                                expand="block"
                                style={{ margin: '10px 0' }}
                                disabled={!isPasswordCorrect}
                                color="danger"
                            >
                                Confirm Ban User
                            </IonButton>

                            <IonButton
                                onClick={() => setShowBanModal(false)}
                                expand="block"
                                fill="outline"
                            >
                                Cancel
                            </IonButton>
                        </div>
                    </IonContent>
                </IonModal>

                {/* Delete Confirmation Modal with Admin Password */}
                <IonModal isOpen={showDeleteAlert} onDidDismiss={() => {
                    setShowDeleteAlert(false);
                    setDeleteAdminPassword('');
                    setIsDeletePasswordCorrect(null);
                    setShowDeleteAdminPassword(false);
                }}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Delete User Confirmation</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setShowDeleteAlert(false)}>Close</IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <h2>Confirm Delete User</h2>
                            <p>You are about to permanently delete the user: <strong>{selectedRow?.username}</strong></p>
                            <p style={{ color: 'var(--ion-color-danger)', fontSize: '14px' }}>
                                This action cannot be undone and will permanently remove all user data.
                            </p>
                            
                            <IonItem style={{ margin: '20px 0' }}>
                                <IonLabel position="stacked">Admin Password Verification</IonLabel>
                                <IonInput
                                    type={showDeleteAdminPassword ? "text" : "password"}
                                    value={deleteAdminPassword}
                                    onIonInput={(e) => handleDeleteAdminPasswordChange(e.detail.value!)}
                                    placeholder="Enter your admin password to confirm"
                                />
                                <IonButtons slot="end">
                                    <IonButton onClick={() => setShowDeleteAdminPassword(!showDeleteAdminPassword)}>
                                        <IonIcon icon={showDeleteAdminPassword ? eyeOff : eye} />
                                    </IonButton>
                                </IonButtons>
                            </IonItem>

                            {/* Password validation indicator */}
                            {deleteAdminPassword && (
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    margin: '10px 0',
                                    color: isDeletePasswordCorrect ? 'green' : 'red'
                                }}>
                                    <IonIcon 
                                        icon={isDeletePasswordCorrect ? checkmarkCircle : closeCircle} 
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span>
                                        {isDeletePasswordCorrect ? 'Password is correct' : 'Password is incorrect'}
                                    </span>
                                </div>
                            )}

                            <IonButton
                                onClick={handleDeleteConfirm}
                                expand="block"
                                style={{ margin: '10px 0' }}
                                disabled={!isDeletePasswordCorrect}
                                color="danger"
                            >
                                Confirm Delete User
                            </IonButton>

                            <IonButton
                                onClick={() => setShowDeleteAlert(false)}
                                expand="block"
                                fill="outline"
                            >
                                Cancel
                            </IonButton>
                        </div>
                    </IonContent>
                </IonModal>

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