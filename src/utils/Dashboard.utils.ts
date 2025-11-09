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

    // Get all forms data from form_view
    const { data: allForms, error: formsError } = await supabase
      .from('form_view')
      .select('form_id, kind_description, class_id, status');

    let totalForms = 0;
    let totalLand = 0;
    let totalBuilding = 0;
    let totalMachinery = 0;

    if (formsError) {
      console.error('Forms query error:', formsError);
      setError('Failed to load forms data: ' + formsError.message);
    } else if (allForms) {
      totalForms = allForms.length;
      
      // Count by kind_description instead of kind_id
      totalLand = allForms.filter(form => 
        form.kind_description && form.kind_description.toLowerCase().includes('land')
      ).length;
      
      totalBuilding = allForms.filter(form => 
        form.kind_description && form.kind_description.toLowerCase().includes('building')
      ).length;
      
      totalMachinery = allForms.filter(form => 
        form.kind_description && form.kind_description.toLowerCase().includes('machinery')
      ).length;
    }

    // Get user statistics
    let totalUsers = 0, activeUsers = 0;
    try {
      // Get total users count
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) {
        console.error('Users count error:', usersError);
      } else {
        totalUsers = usersCount || 0;
      }

      // Get active users (not suspended)
      const { count: activeUsersCount, error: activeUsersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('suspended', false);
      
      if (activeUsersError) {
        console.error('Active users error:', activeUsersError);
        activeUsers = totalUsers;
      } else {
        activeUsers = activeUsersCount || 0;
      }

    } catch (userError) {
      console.error('User statistics error:', userError);
    }

    const finalStats: DashboardStats = {
      totalForms,
      totalLand,
      totalBuilding,
      totalMachinery,
      totalUsers,
      activeUsers
    };

    setStats(finalStats);

  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    setError('Failed to load dashboard data: ' + error.message);
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
    
    // Get all forms with kind_description from form_view
    const { data, error } = await supabase
      .from('form_view')
      .select('kind_description');
    
    if (error) {
      console.error('Kind distribution error:', error);
      throw error;
    }

    // Count by kind_description
    const landCount = data?.filter(form => 
      form.kind_description && form.kind_description.toLowerCase().includes('land')
    ).length || 0;
    
    const buildingCount = data?.filter(form => 
      form.kind_description && form.kind_description.toLowerCase().includes('building')
    ).length || 0;
    
    const machineryCount = data?.filter(form => 
      form.kind_description && form.kind_description.toLowerCase().includes('machinery')
    ).length || 0;

    const total = data?.length || 0;
    const processedData = [
      { kind_id: 1, count: landCount, percentage: total > 0 ? (landCount / total) * 100 : 0 },
      { kind_id: 2, count: buildingCount, percentage: total > 0 ? (buildingCount / total) * 100 : 0 },
      { kind_id: 3, count: machineryCount, percentage: total > 0 ? (machineryCount / total) * 100 : 0 }
    ];

    setKindData(processedData);
    
  } catch (error) {
    console.error('Error fetching kind distribution:', error);
    setKindData([]);
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
    
    // Map kind_id to kind_description for filtering
    const kindMap: Record<number, string> = {
      1: 'land',
      2: 'building', 
      3: 'machinery'
    };
    const kindDescription = kindMap[kindId];
    
    if (!kindDescription) {
      console.error('Invalid kindId:', kindId);
      setClassificationData([]);
      return;
    }
    
    const { data, error } = await supabase
      .from('form_view')
      .select('class_id, kind_description')
      .ilike('kind_description', `%${kindDescription}%`);
    
    if (error) {
      console.error('Classification distribution error:', error);
      throw error;
    }

    const classCounts: { [key: string]: number } = {};
    data?.forEach(item => { 
      if (item.class_id) {
        classCounts[item.class_id] = (classCounts[item.class_id] || 0) + 1;
      }
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
    setClassificationData([]);
  } finally {
    setIsChartLoading(false);
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
      // Use form_view with created_at
      const { data: formData, error: formError } = await supabase
        .from('form_view')
        .select('created_at, kind_id')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .in('kind_id', KIND_IDS);

      if (formError) {
        console.error('Error fetching form submissions:', formError);
        throw formError;
      }

      const processedData = dateLabels.map(date => {
        const dateForms = formData?.filter(form => 
          form.created_at && form.created_at.split('T')[0] === date
        ) || [];
        
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
      
    } catch (error) {
      console.error('Error fetching form submissions:', error);
      // Return empty data
      setFormSubmissionData(dateLabels.map(date => ({
        date,
        totalCount: 0,
        landCount: 0,
        buildingCount: 0,
        machineryCount: 0
      })));
    }
  } catch (error) {
    console.error('Error fetching form submissions:', error);
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
          activity.timestamp && activity.timestamp.split('T')[0] === date
        ) || [];
        return {
          date,
          loginCount: dateActivities.filter(a => a.activity_type === 'LOGIN').length,
          systemActionCount: dateActivities.filter(a => a.activity_type === 'SYSTEM_ACTION').length,
        };
      });
      
      setAdminActivityData(processedData);
      
    } catch {
      const emptyData = dateLabels.map(date => ({
        date,
        loginCount: 0,
        systemActionCount: 0,
      }));
      setAdminActivityData(emptyData);
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
          activity.timestamp && activity.timestamp.split('T')[0] === date
        ) || [];
        return { date, loginCount: dateActivities.length };
      });
      
      setUserActivityData(processedData);
      
    } catch {
      const emptyData = dateLabels.map(date => ({
        date, 
        loginCount: 0
      }));
      setUserActivityData(emptyData);
    }
  } catch (error) {
    console.error('Error fetching user activity:', error);
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
        .from('form_view')
        .select('created_at, status')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .eq('status', 'Inspected');

      const processedData = dateLabels.map(date => {
        const dateReviews = reviewedForms?.filter(form => 
          form.created_at && form.created_at.split('T')[0] === date
        ) || [];
        return { date, reviewCount: dateReviews.length };
      });
      
      setFormReviewData(processedData);
    } catch {
      const emptyData = dateLabels.map(date => ({
        date, 
        reviewCount: 0
      }));
      setFormReviewData(emptyData);
    }
  } catch (error) {
    console.error('Error fetching form review stats:', error);
  }
};