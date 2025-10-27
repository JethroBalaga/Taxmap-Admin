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
    IonIcon
} from '@ionic/react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';
import { supabase } from '../utils/supaBaseClient';
import '../CSS/Dashboard.css';
import { arrowBack } from 'ionicons/icons';

ChartJS.register(ArcElement, Tooltip, Legend);

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

    const chartOptions: ChartOptions<'pie'> = {
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
                    label: function (context) {
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
                                                                        <h3>{stats.totalLand}</h3>
                                                                    </IonText>
                                                                    <IonText color="medium">
                                                                        <p>Land Properties</p>
                                                                    </IonText>
                                                                </div>
                                                            </IonCol>
                                                            <IonCol size="12" size-md="4">
                                                                <div className="summary-item">
                                                                    <IonText color="warning">
                                                                        <h3>{stats.totalBuilding + stats.totalMachinery}</h3>
                                                                    </IonText>
                                                                    <IonText color="medium">
                                                                        <p>Structures & Equipment</p>
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

                {/* Charts Section */}
                {(selectedView === 'kinds' || selectedView === 'land' || selectedView === 'building' || selectedView === 'machinery') && (
                    <div className="charts-container">
                        <IonGrid>
                            <IonRow>
                                <IonCol size="12" size-md="8" offset-md="2">
                                    <IonCard>
                                        <IonCardHeader>
                                            <IonCardTitle>
                                                {selectedView === 'kinds' && 'Forms Distribution by Kind'}
                                                {selectedView === 'land' && 'Land Classification Distribution'}
                                                {selectedView === 'building' && 'Building Classification Distribution'}
                                                {selectedView === 'machinery' && 'Machinery Classification Distribution'}
                                            </IonCardTitle>
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
                                                        <Pie data={kindsChartData} options={chartOptions} />
                                                    )}
                                                    {(selectedView === 'land' || selectedView === 'building' || selectedView === 'machinery') &&
                                                        classificationData.length > 0 && (
                                                            <Pie data={classificationsChartData} options={chartOptions} />
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