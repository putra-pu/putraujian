import React, { useState, useEffect } from 'react';
import { examService, Exam } from '../../services/examService';
import { subjectService, Subject } from '../../services/subjectService';
import { questionService } from '../../services/questionService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Clock, 
  ToggleLeft, 
  ToggleRight,
  Edit2, 
  Trash2,
  AlertCircle,
  FileText,
  X,
  ChevronDown,
  Settings,
  Check
} from 'lucide-react';

import { clsx } from 'clsx';

const ExamManagement = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null);

  // Question selection state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedExamForQuestions, setSelectedExamForQuestions] = useState<any>(null);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [examQuestionIds, setExamQuestionIds] = useState<Set<string>>(new Set());
  const [qSearchTerm, setQSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    duration_minutes: 60,
    is_active: true
  });

  useEffect(() => {
    fetchExams();
    fetchSubjects();
  }, []);

  const fetchExams = async () => {
    try {
      const data = await examService.getAll();
      setExams(data || []);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAll();
      setSubjects(data || []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const handleOpenQuestionModal = async (exam: any) => {
    setSelectedExamForQuestions(exam);
    setIsQuestionModalOpen(true);
    setLoading(true);
    try {
      const [qs, examQs] = await Promise.all([
        questionService.getAll(),
        examService.getQuestions(exam.id)
      ]);
      setAllQuestions(qs || []);
      setExamQuestionIds(new Set(examQs.map((q: any) => q.id)));
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionInExam = async (questionId: string) => {
    if (!selectedExamForQuestions) return;
    
    const isLinked = examQuestionIds.has(questionId);
    try {
      if (isLinked) {
        await examService.removeQuestionFromExam(selectedExamForQuestions.id, questionId);
        setExamQuestionIds(prev => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
      } else {
        await examService.addQuestionToExam(selectedExamForQuestions.id, questionId);
        setExamQuestionIds(prev => new Set([...prev, questionId]));
      }
    } catch (err) {
      console.error('Failed to toggle question:', err);
      alert('Gagal memperbarui daftar soal.');
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await examService.toggleActive(id, !currentStatus);
      fetchExams();
    } catch (err) {
      console.error('Failed to toggle exam:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus jadwal ujian ini?')) {
      try {
        await examService.delete(id);
        fetchExams();
      } catch (err) {
        console.error('Failed to delete exam:', err);
      }
    }
  };

  const handleOpenModal = (exam?: any) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        title: exam.title,
        description: exam.description || '',
        subject_id: exam.subject_id || (subjects.length > 0 ? subjects[0].id : ''),
        duration_minutes: exam.duration_minutes || 60,
        is_active: exam.is_active
      });
    } else {
      setEditingExam(null);
      setFormData({
        title: '',
        description: '',
        subject_id: subjects.length > 0 ? subjects[0].id : '',
        duration_minutes: 60,
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExam) {
        await examService.update(editingExam.id, formData);
      } else {
        await examService.create(formData);
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (err) {
      console.error('Error saving exam:', err);
      alert('Gagal menyimpan jadwal ujian.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Jadwal Ujian</h1>
          <p className="text-slate-500 font-medium">Manajemen sesi dan durasi ujian SMK Prima Unggul.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition transform active:scale-95"
        >
          <Plus size={20} />
          <span>Buat Jadwal Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat Jadwal Ujian...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white p-8 shadow-sm group hover:shadow-xl hover:shadow-brand-500/5 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-2">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    exam.is_active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                    {exam.is_active ? 'Status: Aktif' : 'Status: Nonaktif'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={() => handleOpenModal(exam)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(exam.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 size={18} /></button>
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2 truncate group-hover:text-brand-600 transition-colors uppercase tracking-tight">{exam.title}</h3>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed line-clamp-2">{exam.description || 'Tidak ada deskripsi ujian.'}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  <FileText size={16} className="text-brand-500" />
                  <span>{exam.subjects?.name || 'Mata Pelajaran Umum'}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  <Clock size={16} className="text-brand-500" />
                  <span>Durasi: {exam.duration_minutes} Menit</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status Aktivasi</span>
                  <button 
                    onClick={() => handleToggle(exam.id, exam.is_active)}
                    className="flex items-center space-x-2 font-bold text-sm text-slate-900"
                  >
                    {exam.is_active ? <ToggleRight className="text-brand-600" size={32} /> : <ToggleLeft className="text-slate-300" size={32} />}
                  </button>
                </div>
                <button 
                  onClick={() => handleOpenQuestionModal(exam)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-slate-200 flex items-center space-x-2 hover:bg-slate-800 transition"
                >
                  <Settings size={14} />
                  <span>Atur Soal</span>
                </button>
              </div>
            </div>
          ))}

          {exams.length === 0 && (
            <div className="md:col-span-2 text-center py-20 bg-white/40 rounded-[3rem] border border-dashed border-slate-200">
              <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900">Belum Ada Jadwal</h3>
              <p className="text-slate-500">Klik tombol "Buat Jadwal Baru" untuk memulai sesi CBT.</p>
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
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Konfigurasi Ujian</h2>
                  <p className="text-slate-500 text-sm font-medium uppercase tracking-widest text-[10px]">Detail Sesi Akademik</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Judul Ujian</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-brand-500 outline-none transition font-bold"
                    placeholder="Misal: Ujian Akhir Semester Ganjil"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Deskripsi Singkat</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-brand-500 outline-none transition min-h-[80px]"
                    placeholder="Instruksi tambahan bagi siswa..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Durasi (Menit)</label>
                    <input 
                      type="number" 
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                      className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-brand-500 outline-none transition"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Mata Pelajaran</label>
                    <div className="relative">
                      <select 
                        value={formData.subject_id}
                        onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-brand-500 outline-none transition appearance-none font-bold"
                        required
                      >
                        <option value="">Pilih Matpel...</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                </div>
              </form>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 font-bold text-slate-500">Batal</button>
                <button onClick={handleSubmit} className="px-10 py-3 bg-brand-600 text-white rounded-2xl font-bold shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition">
                  {editingExam ? 'Update Jadwal' : 'Simpan Jadwal'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Question Selection Modal */}
      <AnimatePresence>
        {isQuestionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuestionModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-brand-50 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]"
            >
              <div className="p-8 bg-white flex items-center justify-between border-b border-brand-100">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Pilih Soal Ujian</h2>
                  <p className="text-slate-500 text-sm font-medium">Ujian: <span className="text-brand-600 font-bold">{selectedExamForQuestions?.title}</span></p>
                </div>
                <button onClick={() => setIsQuestionModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 bg-brand-50/50">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Cari dari bank soal..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-brand-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 transition shadow-sm font-medium"
                    value={qSearchTerm}
                    onChange={(e) => setQSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {allQuestions
                  .filter(q => (q.text || q.question_text || '').toLowerCase().includes(qSearchTerm.toLowerCase()))
                  .map((q) => {
                    const isSelected = examQuestionIds.has(q.id);
                    return (
                      <div 
                        key={q.id}
                        onClick={() => toggleQuestionInExam(q.id)}
                        className={clsx(
                          "p-5 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group",
                          isSelected 
                            ? "bg-white border-brand-500 shadow-xl shadow-brand-500/10" 
                            : "bg-white/40 border-transparent hover:border-brand-200"
                        )}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={clsx(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                            isSelected ? "bg-brand-600 text-white" : "bg-white text-slate-400 border border-slate-100"
                          )}>
                            {isSelected ? <Check size={24} /> : <Plus size={20} />}
                          </div>
                          <div>
                            <p className="text-slate-900 font-bold line-clamp-1">{q.text || q.question_text}</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {q.subjects?.name || 'Mata Pelajaran'}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="px-4 py-1.5 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest">Terpilih</span>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="p-8 bg-white border-t border-brand-100 flex items-center justify-between">
                <div className="text-slate-500 font-bold">
                  <span className="text-brand-600 font-black text-2xl pr-2">{examQuestionIds.size}</span> 
                  Soal Dipilih
                </div>
                <button 
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-black shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition transform active:scale-95"
                >
                  SELESAI & SIMPAN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamManagement;
