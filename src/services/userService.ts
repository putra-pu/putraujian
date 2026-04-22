import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student';
  created_at: string;
}

export const userService = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as UserProfile[];
  },

  async updateRole(id: string, role: 'admin' | 'teacher' | 'student') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .rpc('delete_user_hard', { target_user_id: id });
    
    if (error) throw error;
  }
};
