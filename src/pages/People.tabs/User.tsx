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
import { add, arrowUpCircle, banOutline, trash, eye, eyeOff, checkmarkCircle, closeCircle, phonePortraitOutline, arrowBack } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import { useHistory, useLocation } from 'react-router-dom';
import bcrypt from 'bcryptjs';

// Electron detection hook
const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    const electronDetected = (
      // @ts-ignore
      window.process?.versions?.electron ||
      // @ts-ignore
      window.navigator.userAgent.includes('Electron') ||
      // @ts-ignore
      (window.require && window.process && window.process.type) ||
      window.location.protocol === 'file:'
    );
    
    setIsElectron(!!electronDetected);
  }, []);

  return isElectron;
};

// Custom Electron Components
const ElectronLoading: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div>Loading...</div>
      </div>
    </div>
  );
};

const ElectronAlert: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  header: string;
  message: string;
  buttons: { text: string; handler?: () => void; role?: string }[];
}> = ({ isOpen, onClose, header, message, buttons }) => {
  if (!isOpen) return null;

  const handleButtonClick = (button: { text: string; handler?: () => void; role?: string }) => {
    if (button.handler) {
      button.handler();
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>{header}</h3>
        <div dangerouslySetInnerHTML={{ __html: message }} />
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(button)}
              style={{
                padding: '8px 16px',
                background: button.role === 'cancel' ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ElectronToast: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  message: string;
  duration: number;
  color?: string;
}> = ({ isOpen, onClose, message, duration, color = 'success' }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const backgroundColor = color === 'danger' ? '#dc3545' : '#28a745';

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: backgroundColor,
      color: 'white',
      padding: '12px 20px',
      borderRadius: '4px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      {message}
    </div>
  );
};

const ElectronHeader: React.FC<{ 
  onBack: () => void;
}> = ({ onBack }) => (
  <div style={{
    background: '#3880ff',
    color: 'white',
    padding: '12px 16px',
    borderBottom: '1px solid #2a5fc1',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button 
        onClick={onBack}
        style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        <IonIcon 
          icon={arrowBack} 
          style={{ fontSize: '16px', color: 'white' }}
        />
        Back
      </button>
      <h2 style={{ 
        margin: 0, 
        fontSize: '18px', 
        fontWeight: '600',
        flex: 1 
      }}>
        User Management
      </h2>
    </div>
  </div>
);

// Custom Electron Modal
const ElectronModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          background: '#3880ff',
          color: 'white',
          padding: '16px 20px',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

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
    const history = useHistory();
    const location = useLocation();
    const isElectron = useElectron();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState<UserItem | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const searchRef = useRef<HTMLIonSearchbarElement>(null);
    const [isError, setIsError] = useState(false);
    
    // Ban/Unban functionality states
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

        // Prevent admin from banning/unbanning themselves
        if (selectedRow.user_id === currentAdmin?.id) {
            const action = selectedRow.suspended ? 'unban' : 'ban';
            setToastMessage(`You cannot ${action} your own account`);
            setIsError(true);
            setShowToast(true);
            return;
        }

        // Prevent banning/unbanning other admins (optional - remove if you want to allow)
        if (selectedRow.user_role === 'admin') {
            const action = selectedRow.suspended ? 'unban' : 'ban';
            setToastMessage(`Cannot ${action} other administrators`);
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

            // Update the user's suspended status (toggle based on current state)
            const newSuspendedStatus = !selectedRow.suspended;
            const { error } = await supabase
                .from('users')
                .update({ suspended: newSuspendedStatus })
                .eq('user_id', selectedRow.user_id);

            if (error) throw error;

            const action = newSuspendedStatus ? 'banned' : 'unbanned';
            setToastMessage(`User ${selectedRow.username} has been ${action} successfully`);
            setShowToast(true);
            
            // Refresh the user list
            fetchUsers();
            
            // Reset states
            setShowBanModal(false);
            setAdminPassword('');
            setIsPasswordCorrect(null);
            setShowAdminPassword(false);
            
        } catch (error) {
            console.error('Error updating user ban status:', error);
            setToastMessage('Failed to update user status');
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
        if (isElectron) {
            window.location.hash = '/menu/people/register';
        } else {
            history.push('/menu/people/register');
        }
    };

    const handleCheckDevice = () => {
        if (selectedRow) {
            if (isElectron) {
                window.location.hash = `/menu/people/devices?user_id=${selectedRow.user_id}`;
            } else {
                history.push(`/menu/people/devices?user_id=${selectedRow.user_id}`);
            }
        }
    };

    const handleBackClick = () => {
        if (isElectron) {
            window.location.hash = '/menu';
        } else {
            history.push('/menu');
        }
    };

    // Determine ban button title and icon based on selected row's suspended status
    const getBanButtonConfig = () => {
        if (!selectedRow) {
            return { title: "Ban User", disabled: true };
        }
        
        if (selectedRow.suspended) {
            return { title: "Unban User", disabled: false };
        } else {
            return { title: "Ban User", disabled: false };
        }
    };

    const banButtonConfig = getBanButtonConfig();

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
            disabled: banButtonConfig.disabled,
            title: banButtonConfig.title
        },
        {
            icon: phonePortraitOutline,
            onClick: handleCheckDevice,
            disabled: !selectedRow,
            title: "Check Device"
        },
        {
            icon: trash,
            onClick: handleDeleteClick,
            disabled: !selectedRow,
            title: "Delete User"
        }
    ];

    // For Electron: Use simpler structure without nested IonPage
    if (isElectron) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                background: '#f5f5f5'
            }}>
                <ElectronHeader onBack={handleBackClick} />
                
                <div style={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    padding: '16px',
                    background: 'white'
                }}>
                    <IonGrid style={{ padding: 0 }}>
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

                    {/* Use custom components for Electron */}
                    <ElectronLoading isOpen={isLoading} />

                    {/* Ban/Unban Modal for Electron */}
                    <ElectronModal
                        isOpen={showBanModal}
                        onClose={() => {
                            setShowBanModal(false);
                            setAdminPassword('');
                            setIsPasswordCorrect(null);
                            setShowAdminPassword(false);
                        }}
                        title={selectedRow?.suspended ? 'Unban User Confirmation' : 'Ban User Confirmation'}
                    >
                        <div style={{ textAlign: 'center', padding: '10px' }}>
                            <h3 style={{ marginBottom: '15px' }}>
                                {selectedRow?.suspended ? 'Confirm Unban User' : 'Confirm Ban User'}
                            </h3>
                            <p style={{ marginBottom: '15px' }}>
                                You are about to {selectedRow?.suspended ? 'unban' : 'ban'} the user: 
                                <strong> {selectedRow?.username}</strong>
                            </p>
                            <p style={{ 
                                color: '#ffc409', 
                                fontSize: '14px', 
                                marginBottom: '20px',
                                padding: '10px',
                                background: '#fff8e1',
                                borderRadius: '4px'
                            }}>
                                {selectedRow?.suspended 
                                    ? 'This action will restore the user\'s access and allow them to log in again.'
                                    : 'This action will suspend the user\'s account and prevent them from logging in.'
                                }
                            </p>
                            
                            <div style={{ margin: '20px 0' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px', 
                                    fontWeight: '500',
                                    textAlign: 'left'
                                }}>
                                    Admin Password Verification
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showAdminPassword ? "text" : "password"}
                                        value={adminPassword}
                                        onChange={(e) => handleAdminPasswordChange(e.target.value)}
                                        placeholder="Enter your admin password to confirm"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <button
                                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#666'
                                        }}
                                    >
                                        <IonIcon icon={showAdminPassword ? eyeOff : eye} />
                                    </button>
                                </div>
                            </div>

                            {/* Password validation indicator */}
                            {adminPassword && (
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    margin: '10px 0',
                                    color: isPasswordCorrect ? 'green' : 'red',
                                    fontSize: '14px'
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

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button
                                    onClick={() => setShowBanModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        background: 'white',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBanConfirm}
                                    disabled={!isPasswordCorrect}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: selectedRow?.suspended ? '#28a745' : '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: isPasswordCorrect ? 'pointer' : 'not-allowed',
                                        opacity: isPasswordCorrect ? 1 : 0.6,
                                        fontSize: '14px'
                                    }}
                                >
                                    {selectedRow?.suspended ? 'Confirm Unban' : 'Confirm Ban'}
                                </button>
                            </div>
                        </div>
                    </ElectronModal>

                    {/* Delete Confirmation Modal for Electron */}
                    <ElectronModal
                        isOpen={showDeleteAlert}
                        onClose={() => {
                            setShowDeleteAlert(false);
                            setDeleteAdminPassword('');
                            setIsDeletePasswordCorrect(null);
                            setShowDeleteAdminPassword(false);
                        }}
                        title="Delete User Confirmation"
                    >
                        <div style={{ textAlign: 'center', padding: '10px' }}>
                            <h3 style={{ marginBottom: '15px' }}>Confirm Delete User</h3>
                            <p style={{ marginBottom: '15px' }}>
                                You are about to permanently delete the user: <strong>{selectedRow?.username}</strong>
                            </p>
                            <p style={{ 
                                color: '#dc3545', 
                                fontSize: '14px', 
                                marginBottom: '20px',
                                padding: '10px',
                                background: '#f8d7da',
                                borderRadius: '4px'
                            }}>
                                This action cannot be undone and will permanently remove all user data.
                            </p>
                            
                            <div style={{ margin: '20px 0' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px', 
                                    fontWeight: '500',
                                    textAlign: 'left'
                                }}>
                                    Admin Password Verification
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showDeleteAdminPassword ? "text" : "password"}
                                        value={deleteAdminPassword}
                                        onChange={(e) => handleDeleteAdminPasswordChange(e.target.value)}
                                        placeholder="Enter your admin password to confirm"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <button
                                        onClick={() => setShowDeleteAdminPassword(!showDeleteAdminPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#666'
                                        }}
                                    >
                                        <IonIcon icon={showDeleteAdminPassword ? eyeOff : eye} />
                                    </button>
                                </div>
                            </div>

                            {/* Password validation indicator */}
                            {deleteAdminPassword && (
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    margin: '10px 0',
                                    color: isDeletePasswordCorrect ? 'green' : 'red',
                                    fontSize: '14px'
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

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button
                                    onClick={() => setShowDeleteAlert(false)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        background: 'white',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={!isDeletePasswordCorrect}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: isDeletePasswordCorrect ? 'pointer' : 'not-allowed',
                                        opacity: isDeletePasswordCorrect ? 1 : 0.6,
                                        fontSize: '14px'
                                    }}
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </ElectronModal>

                    <ElectronToast
                        isOpen={showToast}
                        onClose={() => setShowToast(false)}
                        message={toastMessage}
                        duration={3000}
                        color={isError ? 'danger' : 'success'}
                    />
                </div>
            </div>
        );
    }

    // Original code for browser
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={handleBackClick}>
                            <IonIcon icon={arrowBack} />
                        </IonButton>
                    </IonButtons>
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

                {/* Ban/Unban Confirmation Modal with Admin Password */}
                <IonModal isOpen={showBanModal} onDidDismiss={() => {
                    setShowBanModal(false);
                    setAdminPassword('');
                    setIsPasswordCorrect(null);
                    setShowAdminPassword(false);
                }}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>
                                {selectedRow?.suspended ? 'Unban User Confirmation' : 'Ban User Confirmation'}
                            </IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setShowBanModal(false)}>Close</IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <h2>
                                {selectedRow?.suspended ? 'Confirm Unban User' : 'Confirm Ban User'}
                            </h2>
                            <p>
                                You are about to {selectedRow?.suspended ? 'unban' : 'ban'} the user: 
                                <strong> {selectedRow?.username}</strong>
                            </p>
                            <p style={{ color: 'var(--ion-color-warning)', fontSize: '14px' }}>
                                {selectedRow?.suspended 
                                    ? 'This action will restore the user\'s access and allow them to log in again.'
                                    : 'This action will suspend the user\'s account and prevent them from logging in.'
                                }
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
                                color={selectedRow?.suspended ? "success" : "danger"}
                            >
                                {selectedRow?.suspended ? 'Confirm Unban User' : 'Confirm Ban User'}
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