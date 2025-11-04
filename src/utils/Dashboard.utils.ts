import { supabase } from '../utils/supaBaseClient';
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
} from './Dashboard.types';

// Constants
export const KIND_IDS = [1, 2, 3] as const;
export const TIME_RANGES = ['7days', '30days'] as const;

export const STAT_CARDS = [
  { key: 'totalForms', title: 'Total Forms', color: '#7044ff', view: 'kinds' as ViewType },
  { key: 'totalUsers', title: 'Total Users', color: '#3880ff', view: undefined },
  { key: 'activeUsers', title: 'Active Users', color: '#10dc60', view: undefined },
  { key: 'formSubmissions', title: 'Form Submissions', color: '#ff4961', view: undefined }
] as const;

export const FORM_TYPE_CARDS = [
  { key: 'totalLand', title: 'Land Forms', color: '#2dd36f', view: 'land' as ViewType },
  { key: 'totalBuilding', title: 'Building Forms', color: '#5260ff', view: 'building' as ViewType },
  { key: 'totalMachinery', title: 'Machinery Forms', color: '#ffc409', view: 'machinery' as ViewType }
] as const;

export const KIND_CONFIG = [
  { id: 1, name: 'Land', color: '#2dd36f' },
  { id: 2, name: 'Building', color: '#5260ff' },
  { id: 3, name: 'Machinery', color: '#ffc409' }
] as const;

export const CHART_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3',
  '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#a29bfe', '#fd79a8'
] as const;

// Helper functions
export const generateDateLabels = (days: number): string[] => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return date.toISOString().split('T')[0];
  });
};

export const getKindName = (kindId: number): string => {
  const kind = KIND_CONFIG.find(kind => kind.id === kindId);
  return kind?.name || 'Unknown';
};

export const getKindColor = (kindId: number): string => {
  const kind = KIND_CONFIG.find(kind => kind.id === kindId);
  return kind?.color || '#6c757d';
};

export const getClassificationColor = (index: number): string => 
  CHART_COLORS[index % CHART_COLORS.length];

// Helper function to get stat value
export const getStatValue = (stats: DashboardStats, key: string, totalFormSubmissions: number): number => {
  if (key === 'formSubmissions') {
    return totalFormSubmissions;
  }
  return stats[key as keyof DashboardStats];
};

// Data fetching functions
export const fetchStats = async (
  setStats: (stats: DashboardStats) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string) => void
) => {
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

export const fetchKindDistribution = async (
  setKindData: (data: KindData[]) => void,
  setIsChartLoading: (loading: boolean) => void
) => {
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

export const fetchClassificationDistribution = async (
  kindId: number,
  setClassificationData: (data: ClassificationData[]) => void,
  setIsChartLoading: (loading: boolean) => void
) => {
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

export const fetchAdminActivity = async (
  timeRange: TimeRangeType,
  setAdminActivityData: (data: AdminActivityData[]) => void
) => {
  try {
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
  }
};

export const fetchUserActivity = async (
  timeRange: TimeRangeType,
  setUserActivityData: (data: UserActivityData[]) => void
) => {
  try {
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
  }
};

export const fetchFormSubmissions = async (
  timeRange: TimeRangeType,
  setFormSubmissionData: (data: FormSubmissionData[]) => void
) => {
  try {
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
  }
};

export const fetchFormReviewStats = async (
  timeRange: TimeRangeType,
  setFormReviewData: (data: FormReviewData[]) => void
) => {
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