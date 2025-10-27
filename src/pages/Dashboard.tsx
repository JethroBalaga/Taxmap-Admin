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
  IonLabel
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

interface ActivityData {
  date: string;
  loginCount: number;
  formViewCount: number;
  formSubmitCount: number;
}

interface FormSubmissionData {
  date: string;
  landCount: number;
  buildingCount: number;
  machineryCount: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    totalLand: 0,
    totalBuilding: 0,
    totalMachinery: 0
  });
  const [kindData, setKindData] = useState<KindData[]>([]);
  const [classificationData, setClassificationData] = useState<ClassificationData[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'kinds' | 'land' | 'building' | 'machinery'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  
  // New state for line charts
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [formSubmissionData, setFormSubmissionData] = useState<FormSubmissionData[]>([]);
  const [isLineChartLoading, setIsLineChartLoading] = useState(false);

  // Fetch overall statistics
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
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

      setStats({
        totalForms: totalForms || 0,
        totalLand: landCount,
        totalBuilding: buildingCount,
        totalMachinery: machineryCount
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
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
    } finally {
      setIsChartLoading(false);
    }
  };

  // Generate date labels based on time range
  const generateDateLabels = (days: number): string[] => {
    const labels = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toISOString().split('T')[0]);
    }
    return labels;
  };

  // Fetch user activity data for line chart
  const fetchUserActivity = async () => {
    try {
      setIsLineChartLoading(true);
      const days = timeRange === '7days' ? 7 : 30;
      const dateLabels = generateDateLabels(days);

      // Get login activity
      const { data: loginData, error: loginError } = await supabase
        .from('user_activity_logs')
        .select('timestamp, activity_type')
        .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .in('activity_type', ['LOGIN', 'FORM_VIEW', 'FORM_SUBMIT']);

      if (loginError) throw loginError;

      // Process activity data
      const processedActivity: ActivityData[] = dateLabels.map(date => {
        const dateActivities = loginData?.filter(activity => 
          activity.timestamp.split('T')[0] === date
        ) || [];

        return {
          date,
          loginCount: dateActivities.filter(a => a.activity_type === 'LOGIN').length,
          formViewCount: dateActivities.filter(a => a.activity_type === 'FORM_VIEW').length,
          formSubmitCount: dateActivities.filter(a => a.activity_type === 'FORM_SUBMIT').length
        };
      });

      setActivityData(processedActivity);

    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setIsLineChartLoading(false);
    }
  };

  // Fetch form submission data for line chart
  const fetchFormSubmissions = async () => {
    try {
      setIsLineChartLoading(true);
      const days = timeRange === '7days' ? 7 : 30;
      const dateLabels = generateDateLabels(days);

      // Get form submissions
      const { data: formData, error: formError } = await supabase
        .from('formtbl')
        .select('created_at, kind_id')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .in('kind_id', [1, 2, 3]);

      if (formError) throw formError;

      // Process form submission data
      const processedFormData: FormSubmissionData[] = dateLabels.map(date => {
        const dateForms = formData?.filter(form => 
          form.created_at.split('T')[0] === date
        ) || [];

        return {
          date,
          landCount: dateForms.filter(f => f.kind_id === 1).length,
          buildingCount: dateForms.filter(f => f.kind_id === 2).length,
          machineryCount: dateForms.filter(f => f.kind_id === 3).length
        };
      });

      setFormSubmissionData(processedFormData);

    } catch (error) {
      console.error('Error fetching form submissions:', error);
    } finally {
      setIsLineChartLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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

  useEffect(() => {
    const loadLineChartData = async () => {
      await Promise.all([fetchUserActivity(), fetchFormSubmissions()]);
    };

    if (selectedView === 'overview') {
      loadLineChartData();
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
      case 1: return '#10dc60'; // Green for Land
      case 2: return '#3880ff'; // Blue for Building
      case 3: return '#ffce00'; // Yellow for Machinery
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

  // User Activity Chart Data
  const activityChartData = {
    labels: activityData.map(item => {
      const date = new Date(item.date);
      return timeRange === '7days' 
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Logins',
        data: activityData.map(item => item.loginCount),
        borderColor: '#3880ff',
        backgroundColor: 'rgba(56, 128, 255, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Form Views',
        data: activityData.map(item => item.formViewCount),
        borderColor: '#ffce00',
        backgroundColor: 'rgba(255, 206, 0, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Form Submissions',
        data: activityData.map(item => item.formSubmitCount),
        borderColor: '#10dc60',
        backgroundColor: 'rgba(16, 220, 96, 0.1)',
        borderWidth: 3,
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
        label: 'Land Forms',
        data: formSubmissionData.map(item => item.landCount),
        borderColor: '#10dc60',
        backgroundColor: 'rgba(16, 220, 96, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Building Forms',
        data: formSubmissionData.map(item => item.buildingCount),
        borderColor: '#3880ff',
        backgroundColor: 'rgba(56, 128, 255, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Machinery Forms',
        data: formSubmissionData.map(item => item.machineryCount),
        borderColor: '#ffce00',
        backgroundColor: 'rgba(255, 206, 0, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
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
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} (${percentage}%)`;
          }
        }
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
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
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

  // Calculate totals for line chart summary
  const totalLogins = activityData.reduce((sum, item) => sum + item.loginCount, 0);
  const totalFormViews = activityData.reduce((sum, item) => sum + item.formViewCount, 0);
  const totalFormSubmissions = activityData.reduce((sum, item) => sum + item.formSubmitCount, 0);

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
            {selectedView === 'overview' && 'Dashboard'}
            {selectedView === 'kinds' && 'Forms by Kind'}
            {selectedView === 'land' && 'Land Classifications'}
            {selectedView === 'building' && 'Building Classifications'}
            {selectedView === 'machinery' && 'Machinery Classifications'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {selectedView === 'overview' && (
          <div className="dashboard-container">
            {/* Time Range Selector for Line Charts */}
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
                  <h2>Forms Overview</h2>
                </IonCol>
              </IonRow>

              {isLoading ? (
                <IonRow>
                  <IonCol size="12" className="loading-col">
                    <IonSpinner />
                    <IonText>Loading statistics...</IonText>
                  </IonCol>
                </IonRow>
              ) : (
                <>
                  {/* Stat Cards */}
                  <IonRow>
                    <IonCol size="6" size-md="3">
                      <StatCard
                        title="Total Forms"
                        value={stats.totalForms}
                        color="#3880ff"
                        onClick={() => setSelectedView('kinds')}
                      />
                    </IonCol>
                    <IonCol size="6" size-md="3">
                      <StatCard
                        title="Land"
                        value={stats.totalLand}
                        color="#10dc60"
                        onClick={() => setSelectedView('land')}
                      />
                    </IonCol>
                    <IonCol size="6" size-md="3">
                      <StatCard
                        title="Building"
                        value={stats.totalBuilding}
                        color="#3880ff"
                        onClick={() => setSelectedView('building')}
                      />
                    </IonCol>
                    <IonCol size="6" size-md="3">
                      <StatCard
                        title="Machinery"
                        value={stats.totalMachinery}
                        color="#ffce00"
                        onClick={() => setSelectedView('machinery')}
                      />
                    </IonCol>
                  </IonRow>

                  {/* Line Charts Section */}
                  <IonRow>
                    <IonCol size="12">
                      <IonCard>
                        <IonCardHeader>
                          <IonCardTitle>User Activity Over Time</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          {isLineChartLoading ? (
                            <div className="chart-loading">
                              <IonSpinner />
                              <IonText>Loading activity data...</IonText>
                            </div>
                          ) : (
                            <div className="chart-container">
                              <Line data={activityChartData} options={lineChartOptions} />
                            </div>
                          )}
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="12">
                      <IonCard>
                        <IonCardHeader>
                          <IonCardTitle>Form Submission Rate Over Time</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          {isLineChartLoading ? (
                            <div className="chart-loading">
                              <IonSpinner />
                              <IonText>Loading form data...</IonText>
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

                  {/* Quick Summary */}
                  <IonRow>
                    <IonCol size="12">
                      <IonCard>
                        <IonCardHeader>
                          <IonCardTitle>Quick Summary</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          <IonGrid>
                            <IonRow>
                              <IonCol size="12" size-md="4">
                                <div className="summary-item">
                                  <IonText color="primary">
                                    <h3>{stats.totalForms}</h3>
                                  </IonText>
                                  <IonText color="medium">
                                    <p>Total Forms Submitted</p>
                                  </IonText>
                                </div>
                              </IonCol>
                              <IonCol size="12" size-md="4">
                                <div className="summary-item">
                                  <IonText color="success">
                                    <h3>{totalLogins}</h3>
                                  </IonText>
                                  <IonText color="medium">
                                    <p>User Logins ({timeRange})</p>
                                  </IonText>
                                </div>
                              </IonCol>
                              <IonCol size="12" size-md="4">
                                <div className="summary-item">
                                  <IonText color="warning">
                                    <h3>{totalFormSubmissions}</h3>
                                  </IonText>
                                  <IonText color="medium">
                                    <p>Forms Submitted ({timeRange})</p>
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