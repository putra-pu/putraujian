"use client";

import React, { useState, useEffect } from 'react';
import { questionService, Question } from '../../services/questionService';
import { subjectService, Subject } from '../../services/subjectService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  MoreVertical,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown
} from 'lucide-react';

import { clsx } from 'clsx';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    question_text: '',
    options: ['', '', '', '', ''],
    correct_option_idx: 0,
    subject_id: '',
    category: ''
  });

  useEffect(() => {
    fetchQuestions();
    fetchSubjects();
  }, []);

  const fetchQuestions = async () => {
    try {
      const data = await questionService.getAll();
      setQuestions(data || []);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAll();
      setSubjects(data || []);
      // Auto-select first subject if empty
      if (data && data.length > 0 && !formData.subject_id) {
        setFormData(prev => ({ ...prev, subject_id: data[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const handleOpenModal = (q?: any) => {
    if (q) {
      setEditingQuestion(q);
      setFormData({
        question_text: q.question_text || q.text,
        options: q.options || ['', '', '', '', ''],
        correct_option_idx: q.correct_option_idx || q.correct_answer || 0,
        subject_id: q.subject_id || (subjects.length > 0 ? subjects[0].id : ''),
        category: q.category || ''
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        question_text: '',
        options: ['', '', '', '', ''],
        correct_option_idx: 0,
        subject_id: subjects.length > 0 ? subjects[0].id : '',
        category: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await questionService.update(editingQuestion.id, {
          text: formData.question_text,
          options: formData.options,
          correct_answer: formData.correct_option_idx,
          subject_id: formData.subject_id
        } as any);
      } else {
        await questionService.create({
          text: formData.question_text,
          options: formData.options,
          correct_answer: formData.correct_option_idx,
          subject_id: formData.subject_id
        } as any);
      }
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      console.error('Error saving question:', err);
      alert('Gagal menyimpan soal. Pastikan database sudah terkonfigurasi.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus soal ini?')) {
      try {
        await questionService.delete(id);
        fetchQuestions();
      } catch (err) {
        console.error('Error deleting question:', err);
      }
    }
  };

  const filteredQuestions = questions.filter(q => 
    (q.question_text || q.text || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bank Soal (LMS)</h1>
          <p className="text-slate-500 font-medium">Kelola database soal ujian SMK Prima Unggul.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition transform active:scale-95"
        >
          <Plus size={20} />
          <span>Tambah Soal Baru</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari teks soal..." 
            className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-md border border-white rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 transition shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-3 bg-white/60 border border-white rounded-2xl font-bold text-slate-600 flex items-center space-x-2 hover:bg-white transition">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat Data Soal...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredQuestions.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/60 backdrop-blur-md rounded-3xl border border-white p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-lg mb-2 leading-relaxed">
                        {q.question_text || q.text}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white rounded-lg text-[10px] font-black uppercase text-slate-400 border border-slate-100">
                          {q.subjects?.name || 'Mata Pelajaran'}
                        </span>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
                          {q.options?.length || 0} Opsi Jawaban
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleOpenModal(q)}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(q.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-20 bg-white/40 rounded-[3rem] border border-dashed border-slate-200">
              <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900">Belum Ada Soal</h3>
              <p className="text-slate-500">Mulai dengan menambahkan soal baru ke dalam sistem.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}</h2>
                  <p className="text-slate-500 text-sm font-medium">Lengkapi detail soal di bawah ini.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Teks Pertanyaan</label>
                  <textarea 
                    className="w-full p-6 bg-slate-50 rounded-3xl border border-transparent focus:border-brand-500 outline-none transition font-medium min-h-[120px]"
                    placeholder="Tuliskan pertanyaan di sini..."
                    value={formData.question_text}
                    onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Opsi Jawaban</label>
                    {formData.options.map((opt, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div 
                          onClick={() => setFormData({...formData, correct_option_idx: i})}
                          className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer transition-all",
                            formData.correct_option_idx === i ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          )}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                        <input 
                          type="text" 
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...formData.options];
                            newOpts[i] = e.target.value;
                            setFormData({...formData, options: newOpts});
                          }}
                          className="flex-1 p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-brand-500 outline-none transition"
                          placeholder={`Jawaban ${String.fromCharCode(65 + i)}...`}
                          required
                        />
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">Klik huruf (A-E) untuk menandai sebagai jawaban benar.</p>
                  </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Mata Pelajaran</label>
                        <div className="relative">
                          <select 
                            value={formData.subject_id}
                            onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                            className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-brand-500 outline-none transition appearance-none font-bold text-slate-700"
                            required
                          >
                            <option value="">Pilih Mata Pelajaran...</option>
                            {subjects.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                        {subjects.length === 0 && (
                          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider px-1">
                            Belum ada mata pelajaran. Silakan buat di menu Manajemen Matpel.
                          </p>
                        )}
                      </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Kategori / Topik</label>
                      <input 
                        type="text" 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-brand-500 outline-none transition"
                        placeholder="Misal: Semester 1, UTS, dll."
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end space-x-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 font-bold text-slate-500 hover:text-slate-900 transition"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSubmit}
                  className="px-10 py-3 bg-brand-600 text-white rounded-2xl font-bold shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition"
                >
                  {editingQuestion ? 'Perbarui Soal' : 'Simpan Soal'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionManagement;
