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

// Interfaces
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

// Constants
const KIND_IDS = [1, 2, 3] as const;
const TIME_RANGES = ['7days', '30days'] as const;

const STAT_CARDS = [
  { key: 'totalForms' as const, title: 'Total Forms', color: '#7044ff', view: 'kinds' as const },
  { key: 'totalUsers' as const, title: 'Total Users', color: '#3880ff' },
  { key: 'activeUsers' as const, title: 'Active Users', color: '#10dc60' },
  { key: 'formSubmissions' as const, title: 'Form Submissions', color: '#ff4961' }
] as const;

const FORM_TYPE_CARDS = [
  { key: 'totalLand' as const, title: 'Land Forms', color: '#2dd36f', view: 'land' as const },
  { key: 'totalBuilding' as const, title: 'Building Forms', color: '#5260ff', view: 'building' as const },
  { key: 'totalMachinery' as const, title: 'Machinery Forms', color: '#ffc409', view: 'machinery' as const }
] as const;

const KIND_CONFIG = [
  { id: 1, name: 'Land', color: '#2dd36f' },
  { id: 2, name: 'Building', color: '#5260ff' },
  { id: 3, name: 'Machinery', color: '#ffc409' }
] as const;

const CHART_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3',
  '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#a29bfe', '#fd79a8'
] as const;

type ViewType = 'overview' | 'kinds' | 'land' | 'building' | 'machinery';
type TimeRangeType = '7days' | '30days';

const Dashboard: React.FC = () => {
  // State
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0, totalLand: 0, totalBuilding: 0, totalMachinery: 0, totalUsers: 0, activeUsers: 0
  });
  const [kindData, setKindData] = useState<KindData[]>([]);
  const [classificationData, setClassificationData] = useState<ClassificationData[]>([]);
  const [selectedView, setSelectedView] = useState<ViewType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRangeType>('7days');
  const [adminActivityData, setAdminActivityData] = useState<AdminActivityData[]>([]);
  const [userActivityData, setUserActivityData] = useState<UserActivityData[]>([]);
  const [formSubmissionData, setFormSubmissionData] = useState<FormSubmissionData[]>([]);
  const [formReviewData, setFormReviewData] = useState<FormReviewData[]>([]);
  const [isLineChartLoading, setIsLineChartLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Helper functions
  const generateDateLabels = (days: number): string[] => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toISOString().split('T')[0];
    });
  };

  const getKindName = (kindId: number): string => {
    const kind = KIND_CONFIG.find(kind => kind.id === kindId);
    return kind?.name || 'Unknown';
  };

  const getKindColor = (kindId: number): string => {
    const kind = KIND_CONFIG.find(kind => kind.id === kindId);
    return kind?.color || '#6c757d';
  };

  const getClassificationColor = (index: number): string => 
    CHART_COLORS[index % CHART_COLORS.length];

  // Data fetching functions
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get total forms count
      const { count: totalForms, error: formsError } = await supabase
        .from('formtbl').select('*', { count: 'exact', head: true });
      if (formsError) throw formsError;

      // Get counts by kind
      const { data: kindCounts, error: kindError } = await supabase
        .from('formtbl').select('kind_id').in('kind_id', KIND_IDS);
      if (kindError) throw kindError;

      const kindStats = KIND_IDS.map(id => ({
        id,
        count: kindCounts?.filter(item => item.kind_id === id).length || 0
      }));

      // Get user statistics
      let totalUsers = 0, activeUsers = 0;
      try {
        const { count: usersCount } = await supabase
          .from('users').select('*', { count: 'exact', head: true });
        totalUsers = usersCount || 0;

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { count: activeUsersCount } = await supabase
          .from('user_activity_logs')
          .select('user_id', { count: 'exact', head: true })
          .gte('timestamp', thirtyDaysAgo).eq('activity_type', 'LOGIN');
        activeUsers = activeUsersCount || 0;
      } catch (error) {
        console.log('User statistics not available');
      }

      setStats({
        totalForms: totalForms || 0,
        totalLand: kindStats[0].count,
        totalBuilding: kindStats[1].count,
        totalMachinery: kindStats[2].count,
        totalUsers,
        activeUsers
      });

    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      setError(error.message || 'Failed to load admin dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKindDistribution = async () => {
    try {
      setIsChartLoading(true);
      const { data, error } = await supabase
        .from('formtbl').select('kind_id').in('kind_id', KIND_IDS);
      if (error) throw error;

      const kindCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
      data?.forEach(item => { 
        if (item.kind_id in kindCounts) {
          kindCounts[item.kind_id]++;
        }
      });

      const total = data?.length || 0;
      const processedData = KIND_IDS.map(id => ({
        kind_id: id,
        count: kindCounts[id] || 0,
        percentage: total > 0 ? ((kindCounts[id] || 0) / total) * 100 : 0
      }));

      setKindData(processedData);
    } catch (error) {
      console.error('Error fetching kind distribution:', error);
    } finally {
      setIsChartLoading(false);
    }
  };

  const fetchClassificationDistribution = async (kindId: number) => {
    try {
      setIsChartLoading(true);
      const { data, error } = await supabase
        .from('formtbl').select('class_id').eq('kind_id', kindId);
      if (error) throw error;

      const classCounts: { [key: string]: number } = {};
      data?.forEach(item => { 
        classCounts[item.class_id] = (classCounts[item.class_id] || 0) + 1 
      });

      const total = data?.length || 0;
      const processedData = Object.entries(classCounts).map(([class_id, count]) => ({
        class_id,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }));

      setClassificationData(processedData);
    } catch (error) {
      console.error('Error fetching classification distribution:', error);
      // Fallback to mock data
      const mockData = ['A', 'B', 'C', 'D', 'E'].map((class_id, i) => ({
        class_id,
        count: Math.floor(Math.random() * 20) + 5,
        percentage: [40, 25, 15, 10, 5][i]
      }));
      setClassificationData(mockData);
    } finally {
      setIsChartLoading(false);
    }
  };

  const fetchAdminActivity = async () => {
    try {
      setIsLineChartLoading(true);
      const days = timeRange === '7days' ? 7 : 30;
      const dateLabels = generateDateLabels(days);

      try {
        const { data: adminData } = await supabase
          .from('admin_activity_logs')
          .select('timestamp, activity_type')
          .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .in('activity_type', ['LOGIN', 'SYSTEM_ACTION']);

        const processedData = dateLabels.map(date => {
          const dateActivities = adminData?.filter(activity => 
            activity.timestamp.split('T')[0] === date
          ) || [];
          return {
            date,
            loginCount: dateActivities.filter(a => a.activity_type === 'LOGIN').length,
            systemActionCount: dateActivities.filter(a => a.activity_type === 'SYSTEM_ACTION').length,
          };
        });
        setAdminActivityData(processedData);
      } catch {
        // Fallback to mock data
        const mockData = dateLabels.map(date => ({
          date,
          loginCount: Math.floor(Math.random() * 5) + 1,
          systemActionCount: Math.floor(Math.random() * 2),
        }));
        setAdminActivityData(mockData);
      }
    } catch (error) {
      console.error('Error fetching admin activity:', error);
    } finally {
      setIsLineChartLoading(false);
    }
  };

  const fetchUserActivity = async () => {
    try {
      setIsLineChartLoading(true);
      const days = timeRange === '7days' ? 7 : 30;
      const dateLabels = generateDateLabels(days);

      try {
        const { data: userData } = await supabase
          .from('user_activity_logs')
          .select('timestamp, activity_type')
          .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .eq('activity_type', 'LOGIN');

        const processedData = dateLabels.map(date => {
          const dateActivities = userData?.filter(activity => 
            activity.timestamp.split('T')[0] === date
          ) || [];
          return { date, loginCount: dateActivities.length };
        });
        setUserActivityData(processedData);
      } catch {
        const mockData = dateLabels.map(date => ({
          date, loginCount: Math.floor(Math.random() * 15) + 5
        }));
        setUserActivityData(mockData);
      }
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setIsLineChartLoading(false);
    }
  };

  const fetchFormSubmissions = async () => {
    try {
      setIsLineChartLoading(true);
      const days = timeRange === '7days' ? 7 : 30;
      const dateLabels = generateDateLabels(days);

      try {
        const { data: formData } = await supabase
          .from('formtbl')
          .select('created_at, kind_id')
          .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .in('kind_id', KIND_IDS);

        const processedData = dateLabels.map(date => {
          const dateForms = formData?.filter(form => form.created_at.split('T')[0] === date) || [];
          const landCount = dateForms.filter(f => f.kind_id === 1).length;
          const buildingCount = dateForms.filter(f => f.kind_id === 2).length;
          const machineryCount = dateForms.filter(f => f.kind_id === 3).length;
          return {
            date,
            totalCount: landCount + buildingCount + machineryCount,
            landCount,
            buildingCount,
            machineryCount
          };
        });
        setFormSubmissionData(processedData);
      } catch {
        const baseSubmissions = timeRange === '7days' ? 3 : 10;
        const mockData = dateLabels.map((date, index) => {
          const progression = Math.floor(index * 0.8) + 1;
          const totalCount = baseSubmissions + progression;
          const landCount = Math.max(1, Math.floor(totalCount * 0.5));
          const buildingCount = Math.max(1, Math.floor(totalCount * 0.3));
          const machineryCount = Math.max(1, Math.floor(totalCount * 0.2));
          return {
            date,
            totalCount: landCount + buildingCount + machineryCount,
            landCount,
            buildingCount,
            machineryCount
          };
        });
        setFormSubmissionData(mockData);
      }
    } catch (error) {
      console.error('Error fetching form submissions:', error);
    } finally {
      setIsLineChartLoading(false);
    }
  };

  const fetchFormReviewStats = async () => {
    try {
      const days = timeRange === '7days' ? 7 : 30;
      const dateLabels = generateDateLabels(days);

      try {
        const { data: reviewedForms } = await supabase
          .from('formtbl')
          .select('created_at, status')
          .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .eq('status', 'Inspected');

        const processedData = dateLabels.map(date => {
          const dateReviews = reviewedForms?.filter(form => 
            form.created_at.split('T')[0] === date
          ) || [];
          return { date, reviewCount: dateReviews.length };
        });
        setFormReviewData(processedData);
      } catch {
        const mockData = dateLabels.map(date => ({
          date, reviewCount: Math.floor(Math.random() * 8) + 2
        }));
        setFormReviewData(mockData);
      }
    } catch (error) {
      console.error('Error fetching form review stats:', error);
    }
  };

  // Effects
  useEffect(() => { 
    fetchStats(); 
  }, []);
  
  useEffect(() => {
    if (selectedView === 'kinds') {
      fetchKindDistribution();
    } else if (selectedView !== 'overview') {
      const kindMap: Record<string, number> = {
        'land': 1,
        'building': 2, 
        'machinery': 3
      };
      const kindId = kindMap[selectedView];
      if (kindId) {
        fetchClassificationDistribution(kindId);
      }
    }
  }, [selectedView]);

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

  // Chart data configurations
  const kindsChartData = {
    labels: kindData.map(item => `${getKindName(item.kind_id)} (${item.count})`),
    datasets: [{
      data: kindData.map(item => item.count),
      backgroundColor: kindData.map(item => getKindColor(item.kind_id)),
      borderColor: '#ffffff',
      borderWidth: 2,
    }],
  };

  const classificationsChartData = {
    labels: classificationData.map(item => `${item.class_id} (${item.count})`),
    datasets: [{
      data: classificationData.map(item => item.count),
      backgroundColor: classificationData.map((_, index) => getClassificationColor(index)),
      borderColor: '#ffffff',
      borderWidth: 2,
    }],
  };

  const formatChartLabels = (data: Array<{date: string}>) => data.map(item => {
    const date = new Date(item.date);
    return timeRange === '7days' 
      ? date.toLocaleDateString('en-US', { weekday: 'short' })
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const adminActivityChartData = {
    labels: formatChartLabels(adminActivityData),
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

  const userActivityChartData = {
    labels: formatChartLabels(userActivityData),
    datasets: [{
      label: 'User Logins',
      data: userActivityData.map(item => item.loginCount),
      borderColor: '#3880ff',
      backgroundColor: 'rgba(56, 128, 255, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    }],
  };

  const formSubmissionChartData = {
    labels: formatChartLabels(formSubmissionData),
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

  // Chart options
  const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } },
    },
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } },
    scales: { y: { beginAtZero: true } },
  };

  // Components
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

  // Calculations
  const totalAdminLogins = adminActivityData.reduce((sum, item) => sum + item.loginCount, 0);
  const totalFormReviews = formReviewData.reduce((sum, item) => sum + item.reviewCount, 0);
  const totalUserLogins = userActivityData.reduce((sum, item) => sum + item.loginCount, 0);
  const totalFormSubmissions = formSubmissionData.reduce((sum, item) => sum + item.totalCount, 0);

  const summaryItems = [
    { value: totalUserLogins, label: 'User Logins', color: 'primary' as const },
    { value: totalFormSubmissions, label: 'Forms Submitted', color: 'success' as const },
    { value: totalAdminLogins, label: 'Admin Logins', color: 'warning' as const },
    { value: totalFormReviews, label: 'Form Reviews', color: 'secondary' as const }
  ];

  const chartConfigs = [
    { title: 'User Logins Over Time', data: userActivityChartData },
    { title: 'Form Submissions Over Time', data: formSubmissionChartData },
    { title: 'Admin Activity Over Time', data: adminActivityChartData }
  ];

  const getPageTitle = () => {
    switch (selectedView) {
      case 'overview': return 'Admin Dashboard';
      case 'kinds': return 'Forms by Kind';
      case 'land': return 'Land Classifications';
      case 'building': return 'Building Classifications';
      case 'machinery': return 'Machinery Classifications';
      default: return 'Admin Dashboard';
    }
  };

  const getChartTitle = () => {
    switch (selectedView) {
      case 'kinds': return 'Forms Distribution by Kind';
      case 'land': return 'Land Classification Distribution';
      case 'building': return 'Building Classification Distribution';
      case 'machinery': return 'Machinery Classification Distribution';
      default: return '';
    }
  };

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
          <IonTitle>{getPageTitle()}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonAlert isOpen={!!error} onDidDismiss={() => setError('')} header={'Error'} message={error} buttons={['OK']} />

        {selectedView === 'overview' && (
          <div className="dashboard-container">
            <IonCard>
              <IonCardContent>
                <IonSegment value={timeRange} onIonChange={e => {
                  if (e.detail.value) setTimeRange(e.detail.value as TimeRangeType);
                }}>
                  {TIME_RANGES.map(range => (
                    <IonSegmentButton key={range} value={range}>
                      <IonLabel>{range === '7days' ? '7 Days' : '30 Days'}</IonLabel>
                    </IonSegmentButton>
                  ))}
                </IonSegment>
              </IonCardContent>
            </IonCard>

            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <h2>Admin Dashboard</h2>
                  <IonText color="medium"><p>System overview and user activity analytics</p></IonText>
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
                  {/* Stat Cards */}
                  <IonRow>
                    {STAT_CARDS.map((card) => (
                      <IonCol key={card.key} size="6" size-md="3">
                        <StatCard
                          title={card.title}
                          value={card.key === 'formSubmissions' ? totalFormSubmissions : stats[card.key]}
                          color={card.color}
                          onClick={'view' in card ? () => setSelectedView(card.view) : undefined}
                        />
                      </IonCol>
                    ))}
                  </IonRow>

                  {/* Form Type Cards */}
                  <IonRow>
                    {FORM_TYPE_CARDS.map(card => (
                      <IonCol key={card.key} size="4">
                        <StatCard
                          title={card.title}
                          value={stats[card.key]}
                          color={card.color}
                          onClick={() => setSelectedView(card.view)}
                        />
                      </IonCol>
                    ))}
                  </IonRow>

                  {/* Charts */}
                  {chartConfigs.map((chart, index) => (
                    <IonRow key={index}>
                      <IonCol size="12">
                        <IonCard>
                          <IonCardHeader><IonCardTitle>{chart.title}</IonCardTitle></IonCardHeader>
                          <IonCardContent>
                            {isLineChartLoading ? (
                              <div className="chart-loading">
                                <IonSpinner /><IonText>Loading chart data...</IonText>
                              </div>
                            ) : (
                              <div className="chart-container">
                                <Line data={chart.data} options={lineChartOptions} />
                              </div>
                            )}
                          </IonCardContent>
                        </IonCard>
                      </IonCol>
                    </IonRow>
                  ))}

                  {/* Quick Summary */}
                  <IonRow>
                    <IonCol size="12">
                      <IonCard>
                        <IonCardHeader><IonCardTitle>Quick Summary ({timeRange})</IonCardTitle></IonCardHeader>
                        <IonCardContent>
                          <IonGrid>
                            <IonRow>
                              {summaryItems.map((item, index) => (
                                <IonCol key={index} size="12" size-md="3">
                                  <div className="summary-item">
                                    <IonText color={item.color}><h3>{item.value}</h3></IonText>
                                    <IonText color="medium"><p>{item.label}</p></IonText>
                                  </div>
                                </IonCol>
                              ))}
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
        {selectedView !== 'overview' && (
          <div className="charts-container">
            <IonGrid>
              <IonRow>
                <IonCol size="12" size-md="8" offset-md="2">
                  <IonCard>
                    <IonCardHeader>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <IonCardTitle>{getChartTitle()}</IonCardTitle>
                        <IonButton fill="clear" onClick={() => setSelectedView('overview')} color="medium">
                          <IonIcon slot="start" icon={arrowBack} />
                          Back to Overview
                        </IonButton>
                      </div>
                    </IonCardHeader>
                    <IonCardContent>
                      {isChartLoading ? (
                        <div className="chart-loading">
                          <IonSpinner /><IonText>Loading chart data...</IonText>
                        </div>
                      ) : (
                        <div className="chart-container">
                          {selectedView === 'kinds' && kindData.length > 0 && (
                            <Pie data={kindsChartData} options={pieChartOptions} />
                          )}
                          {selectedView !== 'kinds' && classificationData.length > 0 && (
                            <Pie data={classificationsChartData} options={pieChartOptions} />
                          )}
                          {((selectedView === 'kinds' && kindData.length === 0) || 
                            (selectedView !== 'kinds' && classificationData.length === 0)) && (
                            <div className="no-data">
                              <IonText color="medium">
                                <p>No data available for chart.</p>
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