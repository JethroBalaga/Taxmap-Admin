import { supabase } from './supaBaseClient';

export const isAdmin = async (userEmail: string) => {
  const { data, error } = await supabase
    .from('admins')
    .select('admin_id')
    .eq('user_email', userEmail)
    .single();
  
  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
  
  return !!data;
};