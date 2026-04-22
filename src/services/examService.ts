import { supabase } from '../lib/supabase';

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  duration_minutes: number;
  is_active: boolean;
}

export const examService = {
  async getAll() {
    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        subjects(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(exam: Omit<Exam, 'id'>) {
    const { data, error } = await supabase
      .from('exams')
      .insert(exam)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Exam>) {
    const { data, error } = await supabase
      .from('exams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async toggleActive(id: string, is_active: boolean) {
    const { error } = await supabase
      .from('exams')
      .update({ is_active })
      .eq('id', id);
    
    if (error) throw error;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        subjects(name)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getQuestions(examId: string) {
    const { data, error } = await supabase
      .from('exam_questions')
      .select(`
        question_id,
        questions (*)
      `)
      .eq('exam_id', examId);
    
    if (error) throw error;
    return data.map(item => item.questions);
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async addQuestionToExam(examId: string, questionId: string) {
    const { data, error } = await supabase
      .from('exam_questions')
      .insert({ exam_id: examId, question_id: questionId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeQuestionFromExam(examId: string, questionId: string) {
    const { error } = await supabase
      .from('exam_questions')
      .delete()
      .eq('exam_id', examId)
      .eq('question_id', questionId);
    
    if (error) throw error;
  }
};
