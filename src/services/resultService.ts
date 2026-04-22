import { supabase } from '../lib/supabase';

export interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  score: number;
  total_correct: number;
  total_questions: number;
  created_at: string;
  exams?: {
    title: string;
    subjects?: {
      name: string;
    }
  };
}

export const resultService = {
  async getMyResults() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('results')
      .select(`
        *,
        exams (
          title,
          subjects (name)
        )
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getAllResults() {
    const { data, error } = await supabase
      .from('results')
      .select(`
        *,
        profiles!results_student_id_fkey (full_name),
        exams (
          title,
          subjects (name)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
