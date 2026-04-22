import { supabase } from '../lib/supabase';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correct_answer: number;
  subject_id: string;
}

export const questionService = {
  async getAll() {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        subjects(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(question: Omit<Question, 'id'>) {
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Question>) {
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
