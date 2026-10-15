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
import { 
  arrowBack,
  documentTextOutline,
  peopleOutline,
  pulseOutline,
  cloudUploadOutline,
  leafOutline,
  businessOutline,
  constructOutline
} from 'ionicons/icons';
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
  ChartOptions,
  Filler
} from 'chart.js';

import { 
  DashboardStats, 
  KindData, 
  ClassificationData, 
  AdminActivityData, 
  UserActivityData, 
  FormSubmissionData, 
  FormReviewData,
  ViewType,
  TimeRangeType
} from '../utils/Dashboard.types';
import { 
  fetchStats, 
  fetchKindDistribution, 
  fetchClassificationDistribution,
  fetchAdminActivity,
  fetchUserActivity,
  fetchFormSubmissions,
  fetchFormReviewStats,
  getKindName,
  getKindColor,
  getClassificationColor,
  getStatValue,
  STAT_CARDS,
  FORM_TYPE_CARDS,
  TIME_RANGES
} from '../utils/Dashboard.utils';
import '../CSS/Dashboard.css';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

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

  // Effects
  useEffect(() => { 
    fetchStats(setStats, setIsLoading, setError);
  }, []);
  
  useEffect(() => {
    if (selectedView === 'kinds') {
      fetchKindDistribution(setKindData, setIsChartLoading);
    } else if (selectedView !== 'overview') {
      const kindMap: Record<string, number> = {
        'land': 1,
        'building': 2, 
        'machinery': 3
      };
      const kindId = kindMap[selectedView];
      if (kindId) {
        fetchClassificationDistribution(kindId, setClassificationData, setIsChartLoading);
      }
    }
  }, [selectedView]);

  useEffect(() => {
    if (selectedView === 'overview') {
      const loadAllData = async () => {
        setIsLineChartLoading(true);
        await Promise.all([
          fetchAdminActivity(timeRange, setAdminActivityData),
          fetchUserActivity(timeRange, setUserActivityData),
          fetchFormSubmissions(timeRange, setFormSubmissionData),
          fetchFormReviewStats(timeRange, setFormReviewData)
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
        backgroundColor: 'rgba(112, 68, 255, 0.08)',
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#7044ff',
        pointHoverRadius: 6
      },
      {
        label: 'System Actions',
        data: adminActivityData.map(item => item.systemActionCount),
        borderColor: '#ff4961',
        backgroundColor: 'rgba(255, 73, 97, 0.08)',
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ff4961',
        pointHoverRadius: 6
      },
      {
        label: 'Form Reviews',
        data: formReviewData.map(item => item.reviewCount),
        borderColor: '#10dc60',
        backgroundColor: 'rgba(16, 220, 96, 0.08)',
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10dc60',
        pointHoverRadius: 6
      }
    ],
  };

  const userActivityChartData = {
    labels: formatChartLabels(userActivityData),
    datasets: [{
      label: 'User Logins',
      data: userActivityData.map(item => item.loginCount),
      borderColor: '#3880ff',
      backgroundColor: 'rgba(56, 128, 255, 0.08)',
      borderWidth: 2.5,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#3880ff',
      pointHoverRadius: 6
    }],
  };

  const formSubmissionChartData = {
    labels: formatChartLabels(formSubmissionData),
    datasets: [
      {
        label: 'Total Submissions',
        data: formSubmissionData.map(item => item.totalCount),
        borderColor: '#7044ff',
        backgroundColor: 'rgba(112, 68, 255, 0.08)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#7044ff',
        pointHoverRadius: 6
      },
      {
        label: 'Land Forms',
        data: formSubmissionData.map(item => item.landCount),
        borderColor: '#2dd36f',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#2dd36f',
        pointHoverRadius: 5
      },
      {
        label: 'Building Forms',
        data: formSubmissionData.map(item => item.buildingCount),
        borderColor: '#5260ff',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#5260ff',
        pointHoverRadius: 5
      },
      {
        label: 'Machinery Forms',
        data: formSubmissionData.map(item => item.machineryCount),
        borderColor: '#ffc409',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#ffc409',
        pointHoverRadius: 5
      }
    ],
  };

  // Chart options
  const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom' as const, 
        labels: { 
          padding: 20, 
          usePointStyle: true,
          font: { family: "'Inter', sans-serif", weight: '600', size: 12 },
          color: '#475569'
        } 
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: "'Inter', sans-serif", weight: 'bold' },
        bodyFont: { family: "'Inter', sans-serif" },
        padding: 12,
        cornerRadius: 8
      }
    },
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'top' as const,
        labels: {
          font: { family: "'Inter', sans-serif", weight: '600', size: 12 },
          usePointStyle: true,
          padding: 15,
          color: '#475569'
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: "'Inter', sans-serif", weight: 'bold' },
        bodyFont: { family: "'Inter', sans-serif" },
        padding: 12,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: { 
      y: { 
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
          lineWidth: 1
        },
        ticks: {
          font: { family: "'Inter', sans-serif", weight: '500' },
          color: '#64748b'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { family: "'Inter', sans-serif", weight: '500' },
          color: '#64748b'
        }
      }
    },
  };

  // Helper helper to map card key to CSS details & icons
  const getCardDetails = (key: string) => {
    switch (key) {
      case 'totalForms': return { className: 'total-forms', icon: documentTextOutline };
      case 'totalUsers': return { className: 'total-users', icon: peopleOutline };
      case 'activeUsers': return { className: 'active-users', icon: pulseOutline };
      case 'formSubmissions': return { className: 'form-submissions', icon: cloudUploadOutline };
      case 'totalLand': return { className: 'land-forms', icon: leafOutline };
      case 'totalBuilding': return { className: 'building-forms', icon: businessOutline };
      case 'totalMachinery': return { className: 'machinery-forms', icon: constructOutline };
      default: return { className: '', icon: documentTextOutline };
    }
  };

  // Components
  const StatCard: React.FC<{
    cardKey: string;
    title: string;
    value: number;
    onClick?: () => void;
  }> = ({ cardKey, title, value, onClick }) => {
    const { className, icon } = getCardDetails(cardKey);
    return (
      <div 
        className={`stat-card ${className}`} 
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <div className="stat-card-inner">
          <div className="stat-card-content">
            <div className="stat-card-label">{title}</div>
            <div className="stat-card-value">{value.toLocaleString()}</div>
          </div>
          <div className="stat-card-icon-box">
            <IonIcon icon={icon} style={{ fontSize: '1.65rem' }} />
          </div>
        </div>
      </div>
    );
  };

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
        <IonToolbar style={{ '--background': 'linear-gradient(135deg, #5f27cd, #7044ff)', '--color': '#ffffff' }}>
          <IonButtons slot="start">
            <IonMenuButton style={{ '--color': '#ffffff' }} />
          </IonButtons>
          <IonTitle style={{ fontWeight: '700', letterSpacing: '0.5px' }}>{getPageTitle()}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonAlert isOpen={!!error} onDidDismiss={() => setError('')} header={'Error'} message={error} buttons={['OK']} />

        {selectedView === 'overview' && (
          <div className="dashboard-container">
            <div className="dashboard-title-container">
              <h2>Admin Dashboard</h2>
              <p>System overview and user activity analytics</p>
            </div>

            <div className="time-segment-card">
              <IonSegment 
                value={timeRange} 
                onIonChange={e => {
                  if (e.detail.value) setTimeRange(e.detail.value as TimeRangeType);
                }}
                className="time-segment"
              >
                {TIME_RANGES.map(range => (
                  <IonSegmentButton key={range} value={range} className="time-segment-button">
                    <IonLabel>{range === '7days' ? '7 Days' : '30 Days'}</IonLabel>
                  </IonSegmentButton>
                ))}
              </IonSegment>
            </div>

            <IonGrid style={{ padding: 0 }}>
              {isLoading ? (
                <IonRow>
                  <IonCol size="12" className="loading-col">
                    <IonSpinner name="crescent" color="primary" />
                    <IonText>Loading dashboard statistics...</IonText>
                  </IonCol>
                </IonRow>
              ) : (
                <>
                  {/* Stat Cards */}
                  <IonRow style={{ margin: '0 -8px 16px -8px' }}>
                    {STAT_CARDS.map((card: any) => (
                      <IonCol key={card.key} size="12" size-sm="6" size-md="3" style={{ padding: '8px' }}>
                        <StatCard
                          cardKey={card.key}
                          title={card.title}
                          value={getStatValue(stats, card.key, totalFormSubmissions)}
                          onClick={card.view ? () => setSelectedView(card.view) : undefined}
                        />
                      </IonCol>
                    ))}
                  </IonRow>

                  {/* Form Type Cards */}
                  <h3 className="section-header">Real Property Tax Forms</h3>
                  <IonRow style={{ margin: '0 -8px 24px -8px' }}>
                    {FORM_TYPE_CARDS.map((card: any) => (
                      <IonCol key={card.key} size="12" size-md="4" style={{ padding: '8px' }}>
                        <StatCard
                          cardKey={card.key}
                          title={card.title}
                          value={getStatValue(stats, card.key, totalFormSubmissions)}
                          onClick={() => setSelectedView(card.view)}
                        />
                      </IonCol>
                    ))}
                  </IonRow>

                  {/* Charts */}
                  <h3 className="section-header">Activity Analytics Charts</h3>
                  {chartConfigs.map((chart, index) => (
                    <IonRow key={index} style={{ marginBottom: '24px' }}>
                      <IonCol size="12">
                        <IonCard className="dashboard-card">
                          <IonCardHeader className="dashboard-card-header">
                            <IonCardTitle className="dashboard-card-title">{chart.title}</IonCardTitle>
                          </IonCardHeader>
                          <IonCardContent className="chart-card-content">
                            {isLineChartLoading ? (
                              <div className="chart-loading">
                                <IonSpinner name="crescent" color="primary" />
                                <IonText>Loading chart data...</IonText>
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
                  <h3 className="section-header">Quick Summary ({timeRange === '7days' ? '7 Days' : '30 Days'})</h3>
                  <IonRow style={{ margin: '0 -8px 24px -8px' }}>
                    <IonCol size="12">
                      <IonCard className="dashboard-card">
                        <IonCardContent className="summary-grid">
                          <IonGrid style={{ padding: 0 }}>
                            <IonRow style={{ margin: 0 }}>
                              {summaryItems.map((item, index) => (
                                <IonCol key={index} size="6" size-md="3" style={{ padding: '8px' }}>
                                  <div className="summary-item-card">
                                    <div className="summary-item-val" style={{ color: `var(--ion-color-${item.color})` }}>
                                      {item.value.toLocaleString()}
                                    </div>
                                    <p className="summary-item-lbl">{item.label}</p>
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
          <div className="dashboard-container">
            <IonGrid style={{ padding: 0 }}>
              <IonRow style={{ margin: 0 }}>
                <IonCol size="12" size-md="8" offset-md="2" style={{ padding: 0 }}>
                  <IonCard className="dashboard-card">
                    <IonCardHeader className="dashboard-card-header">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <IonCardTitle className="dashboard-card-title">{getChartTitle()}</IonCardTitle>
                        <IonButton 
                          fill="solid" 
                          onClick={() => setSelectedView('overview')} 
                          color="primary"
                          shape="round"
                          style={{
                            '--box-shadow': '0 4px 10px rgba(112, 68, 255, 0.2)',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            height: '36px'
                          }}
                        >
                          <IonIcon slot="start" icon={arrowBack} />
                          Back to Overview
                        </IonButton>
                      </div>
                    </IonCardHeader>
                    <IonCardContent className="chart-card-content">
                      {isChartLoading ? (
                        <div className="chart-loading">
                          <IonSpinner name="crescent" color="primary" />
                          <IonText>Loading chart data...</IonText>
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