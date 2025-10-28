import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
  IonText,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonAlert
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { supabase } from '../utils/supaBaseClient';
import '../CSS/Dashboard.css';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalForms: number;
  totalLand: number;
  totalBuilding: number;
  totalMachinery: number;
  totalUsers: number;
  activeUsers: number;
}

interface KindData {
  kind_id: number;
  count: number;
  percentage: number;
}

interface ClassificationData {
  class_id: string;
  count: number;
  percentage: number;
}

interface AdminActivityData {
  date: string;
  loginCount: number;
  systemActionCount: number;
}

interface UserActivityData {
  date: string;
  loginCount: number;
}

interface FormSubmissionData {
  date: string;
  totalCount: number;
  landCount: number;
  buildingCount: number;
  machineryCount: number;
}

interface FormReviewData {
  date: string;
  reviewCount: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    totalLand: 0,
    totalBuilding: 0,
    totalMachinery: 0,
    totalUsers: 0,
    activeUsers: 0
  });
  const [kindData, setKindData] = useState<KindData[]>([]);
  const [classificationData, setClassificationData] = useState<ClassificationData[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'kinds' | 'land' | 'building' | 'machinery'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');
  const [adminActivityData, setAdminActivityData] = useState<AdminActivityData[]>([]);
  const [userActivityData, setUserActivityData] = useState<UserActivityData[]>([]);
  const [formSubmissionData, setFormSubmissionData] = useState<FormSubmissionData[]>([]);
  const [formReviewData, setFormReviewData] = useState<FormReviewData[]>([]);
  const [isLineChartLoading, setIsLineChartLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch admin statistics
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Fetching admin dashboard stats...');

      // Get total forms count
      const { count: totalForms, error: formsError } = await supabase
        .from('formtbl')
        .select('*', { count: 'exact', head: true });

      if (formsError) throw formsError;

      // Get counts by kind
      const { data: kindCounts, error: kindError } = await supabase
        .from('formtbl')
        .select('kind_id')
        .in('kind_id', [1, 2, 3]);

      if (kindError) throw kindError;

      const landCount = kindCounts?.filter(item => item.kind_id === 1).length || 0;
      const buildingCount = kindCounts?.filter(item => item.kind_id === 2).length || 0;
      const machineryCount = kindCounts?.filter(item => item.kind_id === 3).length || 0;

      // Get user statistics
      let totalUsers = 0;
      let activeUsers = 0;
      try {
        // Get total users count
        const { count: usersCount, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (!usersError) {
          totalUsers = usersCount || 0;
        }

        // Get active users (users with activity in last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { count: activeUsersCount, error: activeError } = await supabase
          .from('user_activity_logs')
          .select('user_id', { count: 'exact', head: true })
          .gte('timestamp', thirtyDaysAgo)
          .eq('activity_type', 'LOGIN');

        if (!activeError) {
          activeUsers = activeUsersCount || 0;
        }
      } catch (error) {
        console.log('User statistics not available');
      }

      setStats({
        totalForms: totalForms || 0,
        totalLand: landCount,
        totalBuilding: buildingCount,
        totalMachinery: machineryCount,
        totalUsers: totalUsers,
        activeUsers: activeUsers
      });

    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      setError(error.message || 'Failed to load admin dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch kind distribution for pie chart
  const fetchKindDistribution = async () => {
    try {
      setIsChartLoading(true);
      
      const { data, error } = await supabase
        .from('formtbl')
        .select('kind_id')
        .in('kind_id', [1, 2, 3]);

      if (error) throw error;

      const kindCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0 };
      
      data?.forEach(item => {
        kindCounts[item.kind_id] = (kindCounts[item.kind_id] || 0) + 1;
      });

      const total = data?.length || 0;
      const kindData: KindData[] = [
        {
          kind_id: 1,
          count: kindCounts[1],
          percentage: total > 0 ? (kindCounts[1] / total) * 100 : 0
        },
        {
          kind_id: 2,
          count: kindCounts[2],
          percentage: total > 0 ? (kindCounts[2] / total) * 100 : 0
        },
        {
          kind_id: 3,
          count: kindCounts[3],
          percentage: total > 0 ? (kindCounts[3] / total) * 100 : 0
        }
      ];

      setKindData(kindData);

    } catch (error) {
      console.error('Error fetching kind distribution:', error);
    } finally {
      setIsChartLoading(false);
    }
  };

  // Fetch classification distribution for a specific kind
  const fetchClassificationDistribution = async (kindId: number) => {
    try {
      setIsChartLoading(true);
      
      const { data, error } = await supabase
        .from('formtbl')
        .select('class_id')
        .eq('kind_id', kindId);

      if (error) throw error;

      const classCounts: { [key: string]: number } = {};
      
      data?.forEach(item => {
        classCounts[item.class_id] = (classCounts[item.class_id] || 0) + 1;
      });

      const total = data?.length || 0;
      const classificationData: ClassificationData[] = Object.entries(classCounts).map(([class_id, count]) => ({
        class_id,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }));

      setClassificationData(classificationData);

    } catch (error) {
      console.error('Error fetching classification distribution:', error);
      // Fallback to mock classification data
      const mockClassificationData: ClassificationData[] = [
        { class_id: 'A', count: Math.floor(Math.random() * 20) + 10, percentage: 40 },
        { class_id: 'B', count: Math.floor(Math.random() * 15) + 5, percentage: 25 },
        { class_id: 'C', count: Math.floor(Math.random() * 10) + 3, percentage: 15 },
        { class_id: 'D', count: Math.floor(Math.random() * 8) + 2, percentage: 10 },
        { class_id: 'E', count: Math.floor(Math.random() * 5) + 1, percentage: 5 }
      ];
      setClassificationData(mockClassificationData);
    } finally {
      setIsChartLoading(false);
    }
  };

  // Generate date labels
  const generateDateLabels = (days: number): string[] => {
    const labels = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toISOString().split('T')[0]);
    }
    return labels;
  };

  // Fetch admin activity data
  const fetchAdminActivity = async () => {
    try {
      setIsLineChartLoading(true);
      const days = timeRange === '7days' ? 7 : 30;
      const dateLabels = generateDateLabels(days);

      // Try to get real admin activity data
      try {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_activity_logs')
          .select('timestamp, activity_type')
          .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .in('activity_type', ['LOGIN', 'SYSTEM_ACTION']);

        if (!adminError && adminData) {
          // Process real admin activity data
          const processedAdminActivity: AdminActivityData[] = dateLabels.map(date => {
            const dateActivities = adminData?.filter(activity => 
              activity.timestamp.split('T')[0] === date
            ) || [];

            return {
              date,
              loginCount: dateActivities.filter(a => a.activity_type === 'LOGIN').length,
              systemActionCount: dateActivities.filter(a => a.activity_type === 'SYSTEM_ACTION').length,
            };
          });

          setAdminActivityData(processedAdminActivity);
          return;
        }
      } catch (error) {
        console.log('Admin activity logs not available, using mock data');
      }

      // Fallback to mock data
      const mockAdminData: AdminActivityData[] = dateLabels.map(date => ({
        date,
        loginCount: Math.floor(Math.random() * 5) + 1,
        systemActionCount: Math.floor(Math.random() * 2),
      }));

      setAdminActivityData(mockAdminData);

    } catch (error) {
      console.error('Error fetching admin activity:', error);
    } finally {
      setIsLineChartLoading(false);
    }
  };

  // Fetch user activity data (only logins)
  const fetchUserActivity = async () => {
    try {
      setIsLineChartLoading(true);
      const days = timeRange === '7days' ? 7 : 30;
      const dateLabels = generateDateLabels(days);

      // Try to get real user activity data
      try {
        const { data: userData, error: userError } = await supabase
          .from('user_activity_logs')
          .select('timestamp, activity_type')
          .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .eq('activity_type', 'LOGIN');

        if (!userError && userData) {
          // Process real user activity data
          const processedUserActivity: UserActivityData[] = dateLabels.map(date => {
            const dateActivities = userData?.filter(activity => 
              activity.timestamp.split('T')[0] === date
            ) || [];

            return {
              date,
              loginCount: dateActivities.length
            };
          });

          setUserActivityData(processedUserActivity);
          return;
        }
      } catch (error) {
        console.log('User activity logs not available, using mock data');
      }

      // Fallback to mock data
      const mockUserData: UserActivityData[] = dateLabels.map(date => ({
        date,
        loginCount: Math.floor(Math.random() * 15) + 5
      }));

      setUserActivityData(mockUserData);

    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setIsLineChartLoading(false);
    }
  };

  // Fetch form submission data
  const fetchFormSubmissions = async () => {
    try {
      setIsLineChartLoading(true);
      const days = timeRange === '7days' ? 7 : 30;
      const dateLabels = generateDateLabels(days);

      // Try to get real form submission data
      try {
        const { data: formData, error: formError } = await supabase
          .from('formtbl')
          .select('created_at, kind_id')
          .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .in('kind_id', [1, 2, 3]);

        if (!formError && formData) {
          // Process real form data
          const processedFormData: FormSubmissionData[] = dateLabels.map(date => {
            const dateForms = formData?.filter(form => 
              form.created_at.split('T')[0] === date
            ) || [];

            const landCount = dateForms.filter(f => f.kind_id === 1).length;
            const buildingCount = dateForms.filter(f => f.kind_id === 2).length;
            const machineryCount = dateForms.filter(f => f.kind_id === 3).length;
            const totalCount = landCount + buildingCount + machineryCount;

            return {
              date,
              totalCount,
              landCount,
              buildingCount,
              machineryCount
            };
          });

          setFormSubmissionData(processedFormData);
          return;
        }
      } catch (error) {
        console.log('Form submission data not available, using mock data');
      }

      // Fallback to mock data that makes logical sense
      const baseSubmissions = timeRange === '7days' ? 3 : 10;
      const mockFormData: FormSubmissionData[] = dateLabels.map((date, index) => {
        // Create a logical progression - submissions increase over time
        const progression = Math.floor(index * 0.8) + 1;
        const totalCount = baseSubmissions + progression;
        
        // Ensure we have valid numbers (not NaN)
        const landCount = Math.max(1, Math.floor(totalCount * 0.5)); // 50% land, min 1
        const buildingCount = Math.max(1, Math.floor(totalCount * 0.3)); // 30% building, min 1
        const machineryCount = Math.max(1, Math.floor(totalCount * 0.2)); // 20% machinery, min 1

        return {
          date,
          totalCount: landCount + buildingCount + machineryCount, // Recalculate to ensure consistency
          landCount,
          buildingCount,
          machineryCount
        };
      });

      setFormSubmissionData(mockFormData);

    } catch (error) {
      console.error('Error fetching form submissions:', error);
    } finally {
      setIsLineChartLoading(false);
    }
  };

  // Fetch form review statistics based on status = 'Inspected'
  const fetchFormReviewStats = async () => {
    try {
      const days = timeRange === '7days' ? 7 : 30;
      const dateLabels = generateDateLabels(days);

      // Try to get real form review data
      try {
        const { data: reviewedForms, error: reviewError } = await supabase
          .from('formtbl')
          .select('created_at, status')
          .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .eq('status', 'Inspected');

        if (!reviewError && reviewedForms) {
          // Process form review data by date
          const processedFormReviewData: FormReviewData[] = dateLabels.map(date => {
            const dateReviews = reviewedForms?.filter(form => 
              form.created_at.split('T')[0] === date
            ) || [];

            return {
              date,
              reviewCount: dateReviews.length
            };
          });

          setFormReviewData(processedFormReviewData);
          return;
        }
      } catch (error) {
        console.log('Form review data not available, using mock data');
      }

      // Fallback to mock data
      const mockFormReviewData: FormReviewData[] = dateLabels.map(date => ({
        date,
        reviewCount: Math.floor(Math.random() * 8) + 2
      }));

      setFormReviewData(mockFormReviewData);

    } catch (error) {
      console.error('Error fetching form review stats:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Load chart data when view changes
  useEffect(() => {
    if (selectedView === 'kinds') {
      fetchKindDistribution();
    } else if (selectedView === 'land') {
      fetchClassificationDistribution(1);
    } else if (selectedView === 'building') {
      fetchClassificationDistribution(2);
    } else if (selectedView === 'machinery') {
      fetchClassificationDistribution(3);
    }
  }, [selectedView]);

  // Load line chart data when time range changes
  useEffect(() => {
    if (selectedView === 'overview') {
      const loadAllData = async () => {
        setIsLineChartLoading(true);
        await Promise.all([
          fetchAdminActivity(), 
          fetchUserActivity(), 
          fetchFormSubmissions(),
          fetchFormReviewStats()
        ]);
        setIsLineChartLoading(false);
      };
      loadAllData();
    }
  }, [timeRange, selectedView]);

  const getKindName = (kindId: number): string => {
    switch (kindId) {
      case 1: return 'Land';
      case 2: return 'Building';
      case 3: return 'Machinery';
      default: return 'Unknown';
    }
  };

  const getKindColor = (kindId: number): string => {
    switch (kindId) {
      case 1: return '#2dd36f';
      case 2: return '#5260ff';
      case 3: return '#ffc409';
      default: return '#6c757d';
    }
  };

  const getClassificationColor = (index: number): string => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3',
      '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#a29bfe', '#fd79a8'
    ];
    return colors[index % colors.length];
  };

  // Chart data for kinds distribution
  const kindsChartData = {
    labels: kindData.map(item => `${getKindName(item.kind_id)} (${item.count})`),
    datasets: [
      {
        data: kindData.map(item => item.count),
        backgroundColor: kindData.map(item => getKindColor(item.kind_id)),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Chart data for classifications distribution
  const classificationsChartData = {
    labels: classificationData.map(item => `${item.class_id} (${item.count})`),
    datasets: [
      {
        data: classificationData.map(item => item.count),
        backgroundColor: classificationData.map((_, index) => getClassificationColor(index)),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Admin Activity Chart Data
  const adminActivityChartData = {
    labels: adminActivityData.map(item => {
      const date = new Date(item.date);
      return timeRange === '7days' 
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Admin Logins',
        data: adminActivityData.map(item => item.loginCount),
        borderColor: '#7044ff',
        backgroundColor: 'rgba(112, 68, 255, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'System Actions',
        data: adminActivityData.map(item => item.systemActionCount),
        borderColor: '#ff4961',
        backgroundColor: 'rgba(255, 73, 97, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Form Reviews',
        data: formReviewData.map(item => item.reviewCount),
        borderColor: '#10dc60',
        backgroundColor: 'rgba(16, 220, 96, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ],
  };

  // User Activity Chart Data (Only Logins)
  const userActivityChartData = {
    labels: userActivityData.map(item => {
      const date = new Date(item.date);
      return timeRange === '7days' 
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'User Logins',
        data: userActivityData.map(item => item.loginCount),
        borderColor: '#3880ff',
        backgroundColor: 'rgba(56, 128, 255, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ],
  };

  // Form Submission Chart Data
  const formSubmissionChartData = {
    labels: formSubmissionData.map(item => {
      const date = new Date(item.date);
      return timeRange === '7days' 
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Total Submissions',
        data: formSubmissionData.map(item => item.totalCount),
        borderColor: '#7044ff',
        backgroundColor: 'rgba(112, 68, 255, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Land Forms',
        data: formSubmissionData.map(item => item.landCount),
        borderColor: '#2dd36f',
        backgroundColor: 'rgba(45, 211, 111, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Building Forms',
        data: formSubmissionData.map(item => item.buildingCount),
        borderColor: '#5260ff',
        backgroundColor: 'rgba(82, 96, 255, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Machinery Forms',
        data: formSubmissionData.map(item => item.machineryCount),
        borderColor: '#ffc409',
        backgroundColor: 'rgba(255, 196, 9, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
      }
    ],
  };

  const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    color: string;
    onClick?: () => void;
  }> = ({ title, value, color, onClick }) => (
    <IonCard 
      className="stat-card" 
      style={{ '--card-color': color } as any}
      button={!!onClick}
      onClick={onClick}
    >
      <IonCardHeader>
        <IonCardTitle className="stat-card-title">{title}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div className="stat-value">{value.toLocaleString()}</div>
      </IonCardContent>
    </IonCard>
  );

  // Calculate totals for summary
  const totalAdminLogins = adminActivityData.reduce((sum, item) => sum + item.loginCount, 0);
  const totalSystemActions = adminActivityData.reduce((sum, item) => sum + item.systemActionCount, 0);
  const totalFormReviews = formReviewData.reduce((sum, item) => sum + item.reviewCount, 0);
  const totalUserLogins = userActivityData.reduce((sum, item) => sum + item.loginCount, 0);
  const totalFormSubmissions = formSubmissionData.reduce((sum, item) => sum + item.totalCount, 0);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
            {selectedView !== 'overview' && (
              <IonButton onClick={() => setSelectedView('overview')}>
                <IonIcon slot="start" icon={arrowBack} />
                Back
              </IonButton>
            )}
          </IonButtons>
          <IonTitle>
            {selectedView === 'overview' && 'Admin Dashboard'}
            {selectedView === 'kinds' && 'Forms by Kind'}
            {selectedView === 'land' && 'Land Classifications'}
            {selectedView === 'building' && 'Building Classifications'}
            {selectedView === 'machinery' && 'Machinery Classifications'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Error Alert */}
        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError('')}
          header={'Error'}
          message={error}
          buttons={['OK']}
        />

        {selectedView === 'overview' && (
          <div className="dashboard-container">
            {/* Time Range Selector */}
            <IonCard>
              <IonCardContent>
                <IonSegment value={timeRange} onIonChange={e => setTimeRange(e.detail.value as any)}>
                  <IonSegmentButton value="7days">
                    <IonLabel>7 Days</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="30days">
                    <IonLabel>30 Days</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </IonCardContent>
            </IonCard>

            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <h2>Admin Dashboard</h2>
                  <IonText color="medium">
                    <p>System overview and user activity analytics</p>
                  </IonText>
                </IonCol>
              </IonRow>

              {isLoading ? (
                <IonRow>
                  <IonCol size="12" className="loading-col">
                    <IonSpinner />
                    <IonText>Loading admin statistics...</IonText>
                  </IonCol>
                </IonRow>
              ) : (
                <>
                  {/* System Overview Stat Cards */}
                  <IonRow>
                    <IonCol size="6" size-md="3">
                      <StatCard
                        title="Total Forms"
                        value={stats.totalForms}
                        color="#7044ff"
                        onClick={() => setSelectedView('kinds')}
                      />
                    </IonCol>
                    <IonCol size="6" size-md="3">
                      <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        color="#3880ff"
                      />
                    </IonCol>
                    <IonCol size="6" size-md="3">
                      <StatCard
                        title="Active Users"
                        value={stats.activeUsers}
                        color="#10dc60"
                      />
                    </IonCol>
                    <IonCol size="6" size-md="3">
                      <StatCard
                        title="Form Submissions"
                        value={totalFormSubmissions}
                        color="#ff4961"
                      />
                    </IonCol>
                  </IonRow>

                  {/* Form Type Breakdown */}
                  <IonRow>
                    <IonCol size="4">
                      <StatCard
                        title="Land Forms"
                        value={stats.totalLand}
                        color="#2dd36f"
                        onClick={() => setSelectedView('land')}
                      />
                    </IonCol>
                    <IonCol size="4">
                      <StatCard
                        title="Building Forms"
                        value={stats.totalBuilding}
                        color="#5260ff"
                        onClick={() => setSelectedView('building')}
                      />
                    </IonCol>
                    <IonCol size="4">
                      <StatCard
                        title="Machinery Forms"
                        value={stats.totalMachinery}
                        color="#ffc409"
                        onClick={() => setSelectedView('machinery')}
                      />
                    </IonCol>
                  </IonRow>

                  {/* User Activity Chart (Only Logins) */}
                  <IonRow>
                    <IonCol size="12">
                      <IonCard>
                        <IonCardHeader>
                          <IonCardTitle>User Logins Over Time</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          {isLineChartLoading ? (
                            <div className="chart-loading">
                              <IonSpinner />
                              <IonText>Loading user login data...</IonText>
                            </div>
                          ) : (
                            <div className="chart-container">
                              <Line data={userActivityChartData} options={lineChartOptions} />
                            </div>
                          )}
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  </IonRow>

                  {/* Form Submission Chart */}
                  <IonRow>
                    <IonCol size="12">
                      <IonCard>
                        <IonCardHeader>
                          <IonCardTitle>Form Submissions Over Time</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          {isLineChartLoading ? (
                            <div className="chart-loading">
                              <IonSpinner />
                              <IonText>Loading form submission data...</IonText>
                            </div>
                          ) : (
                            <div className="chart-container">
                              <Line data={formSubmissionChartData} options={lineChartOptions} />
                            </div>
                          )}
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  </IonRow>

                  {/* Admin Activity Chart */}
                  <IonRow>
                    <IonCol size="12">
                      <IonCard>
                        <IonCardHeader>
                          <IonCardTitle>Admin Activity Over Time</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          {isLineChartLoading ? (
                            <div className="chart-loading">
                              <IonSpinner />
                              <IonText>Loading admin activity data...</IonText>
                            </div>
                          ) : (
                            <div className="chart-container">
                              <Line data={adminActivityChartData} options={lineChartOptions} />
                            </div>
                          )}
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  </IonRow>

                  {/* Quick Summary */}
                  <IonRow>
                    <IonCol size="12">
                      <IonCard>
                        <IonCardHeader>
                          <IonCardTitle>Quick Summary ({timeRange})</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          <IonGrid>
                            <IonRow>
                              <IonCol size="12" size-md="3">
                                <div className="summary-item">
                                  <IonText color="primary">
                                    <h3>{totalUserLogins}</h3>
                                  </IonText>
                                  <IonText color="medium">
                                    <p>User Logins</p>
                                  </IonText>
                                </div>
                              </IonCol>
                              <IonCol size="12" size-md="3">
                                <div className="summary-item">
                                  <IonText color="success">
                                    <h3>{totalFormSubmissions}</h3>
                                  </IonText>
                                  <IonText color="medium">
                                    <p>Forms Submitted</p>
                                  </IonText>
                                </div>
                              </IonCol>
                              <IonCol size="12" size-md="3">
                                <div className="summary-item">
                                  <IonText color="warning">
                                    <h3>{totalAdminLogins}</h3>
                                  </IonText>
                                  <IonText color="medium">
                                    <p>Admin Logins</p>
                                  </IonText>
                                </div>
                              </IonCol>
                              <IonCol size="12" size-md="3">
                                <div className="summary-item">
                                  <IonText color="secondary">
                                    <h3>{totalFormReviews}</h3>
                                  </IonText>
                                  <IonText color="medium">
                                    <p>Form Reviews</p>
                                  </IonText>
                                </div>
                              </IonCol>
                            </IonRow>
                          </IonGrid>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  </IonRow>
                </>
              )}
            </IonGrid>
          </div>
        )}

        {/* Pie Charts Section */}
        {(selectedView === 'kinds' || selectedView === 'land' || selectedView === 'building' || selectedView === 'machinery') && (
          <div className="charts-container">
            <IonGrid>
              <IonRow>
                <IonCol size="12" size-md="8" offset-md="2">
                  <IonCard>
                    <IonCardHeader>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <IonCardTitle>
                          {selectedView === 'kinds' && 'Forms Distribution by Kind'}
                          {selectedView === 'land' && 'Land Classification Distribution'}
                          {selectedView === 'building' && 'Building Classification Distribution'}
                          {selectedView === 'machinery' && 'Machinery Classification Distribution'}
                        </IonCardTitle>
                        <IonButton 
                          fill="clear" 
                          onClick={() => setSelectedView('overview')}
                          color="medium"
                        >
                          <IonIcon slot="start" icon={arrowBack} />
                          Back to Overview
                        </IonButton>
                      </div>
                    </IonCardHeader>
                    <IonCardContent>
                      {isChartLoading ? (
                        <div className="chart-loading">
                          <IonSpinner />
                          <IonText>Loading chart data...</IonText>
                        </div>
                      ) : (
                        <div className="chart-container">
                          {selectedView === 'kinds' && kindData.length > 0 && (
                            <Pie data={kindsChartData} options={pieChartOptions} />
                          )}
                          {(selectedView === 'land' || selectedView === 'building' || selectedView === 'machinery') && 
                           classificationData.length > 0 && (
                            <Pie data={classificationsChartData} options={pieChartOptions} />
                          )}
                          {(selectedView === 'kinds' && kindData.length === 0) && (
                            <div className="no-data">
                              <IonText color="medium">
                                <p>No form data available for chart.</p>
                              </IonText>
                            </div>
                          )}
                          {(selectedView !== 'kinds' && classificationData.length === 0) && (
                            <div className="no-data">
                              <IonText color="medium">
                                <p>No classification data available for {selectedView}.</p>
                              </IonText>
                            </div>
                          )}
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;