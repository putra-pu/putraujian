import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertTriangle,
  Monitor,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { examService } from '../../services/examService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const ExamSession = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNav, setShowNav] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  const fetchExamData = async () => {
    try {
      const examData = await examService.getById(examId!);
      const questionsData = await examService.getQuestions(examId!);
      
      setExam(examData);
      setQuestions(questionsData);
      setTimeLeft(examData.duration_minutes * 60);

      // Load autosave from localStorage
      try {
        const saved = localStorage.getItem(`exam_autosave_${examId}_${user?.id}`);
        if (saved) {
          setAnswers(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to load autosave:', err);
      }
    } catch (err: any) {
      console.error('Error fetching exam data:', err);
      alert(`Gagal memuat data ujian: ${err.message || 'Cek koneksi.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Autosave to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0 && examId && user) {
      localStorage.setItem(`exam_autosave_${examId}_${user.id}`, JSON.stringify(answers));
    }
  }, [answers, examId, user]);

  // Timer logic
  useEffect(() => {
    if (loading || !exam) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, exam]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleSelect = (optionIdx: number) => {
    if (!questions[currentIdx]) return;
    setAnswers(prev => ({
      ...prev,
      [questions[currentIdx].id]: optionIdx
    }));
  };

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Calculate score
      let correctCount = 0;
      questions.forEach(q => {
        // Support both naming conventions (text/question_text and correct_answer/correct_option_idx)
        const qId = q.id;
        const correctAnswer = q.correct_answer !== undefined ? q.correct_answer : q.correct_option_idx;
        
        if (answers[qId] === correctAnswer) {
          correctCount++;
        }
      });

      const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

      if (!user?.id) {
        throw new Error('Sesi tidak valid: User tidak ditemukan. Silakan login ulang.');
      }

      // 1. Create Result Entry
      const { data: result, error: resError } = await supabase
        .from('results')
        .insert({
          exam_id: examId,
          student_id: user.id,
          score: score,
          total_correct: correctCount,
          total_questions: questions.length
        })
        .select()
        .single();

      if (resError) throw resError;

      // 2. Insert detailed answers
      const answerRows = questions.map(q => {
        const correctAnswer = q.correct_answer !== undefined ? q.correct_answer : q.correct_option_idx;
        return {
          result_id: result.id,
          question_id: q.id,
          selected_option_idx: answers[q.id] ?? null,
          is_correct: answers[q.id] === correctAnswer
        };
      });

      const { error: answersError } = await supabase.from('student_answers').insert(answerRows);
      if (answersError) throw answersError;

      // Clear autosave
      localStorage.removeItem(`exam_autosave_${examId}_${user?.id}`);
      
      navigate('/app/siswa');
    } catch (err: any) {
      console.error('Submission failed:', err);
      // Detailed error reporting for the user
      const errorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : 'Unknown error');
      alert(`Gagal mengirim jawaban: ${errorMsg}\n\nPastikan Anda sudah menjalankan SQL migrasi di Supabase.`);
      setIsSubmitting(false);
    }
  }, [examId, user, questions, answers, navigate, isSubmitting]);

  const handleSubmit = () => {
    setShowConfirmModal(true);
  };

  if (loading) return (
    <div className="fixed inset-0 bg-[#fef2f2] flex flex-col items-center justify-center z-50">
      <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-4" />
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Inisialisasi Sesi Ujian...</h2>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#fef2f2] flex flex-col z-50 overflow-hidden relative">
      <div className="glass-background"></div>
      
      {/* Header */}
      <header className="h-16 bg-white/40 backdrop-blur-md border-b border-white/40 flex items-center justify-between px-6 lg:px-12 shrink-0 z-20">
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-3 pr-6 border-r border-slate-200">
            <Monitor className="text-brand-600" size={24} />
            <h1 className="font-bold text-slate-900 tracking-tight">CBT System SMKPU</h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[200px]">{exam?.title}</p>
        </div>

        <div className="flex items-center space-x-6">
          <div className={cn(
            "flex items-center space-x-3 px-6 py-2 rounded-full font-black text-xl tabular-nums transition-all border",
            timeLeft < 300 
              ? "bg-red-50 text-red-600 border-red-200 animate-pulse" 
              : "bg-white/80 text-slate-900 border-white shadow-sm"
          )}>
            <Clock size={20} className={timeLeft < 300 ? "text-red-500" : "text-brand-500"} />
            <span>{formatTime(timeLeft)}</span>
          </div>
          
          <button 
            onClick={() => setShowNav(!showNav)}
            className="lg:hidden p-2 hover:bg-white/50 rounded-xl transition"
          >
            {showNav ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden z-10">
        {/* Question Panel */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="max-w-4xl mx-auto">
            {questions[currentIdx] ? (
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-white/80 border-2 border-white rounded-2xl flex items-center justify-center font-black text-brand-600 text-xl shadow-sm shrink-0 backdrop-blur-sm">
                    {currentIdx + 1}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-relaxed pt-2">
                    {questions[currentIdx].text || questions[currentIdx].question_text}
                  </h2>
                </div>

                <div className="grid gap-4">
                  {questions[currentIdx].options?.map((option: string, idx: number) => {
                    const isSelected = answers[questions[currentIdx].id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={cn(
                          "group flex items-center w-full p-6 text-left rounded-3xl border-2 transition-all duration-200 backdrop-blur-sm",
                          isSelected 
                            ? "bg-brand-600 border-brand-600 text-white shadow-xl shadow-brand-500/10" 
                            : "bg-white/60 border-white hover:border-brand-200 hover:bg-white/80"
                        )}
                      >
                        <span className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-6 transition-colors shrink-0",
                          isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-lg font-semibold">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <div className="py-20 text-center">
                <AlertTriangle size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900">Tidak Ada Soal Di Sesi Ini</h3>
                <p className="text-slate-500">Tanyakan kepada pengawas atau guru pengampu Anda.</p>
              </div>
            )}

            {/* Bottom Nav */}
            {questions.length > 0 && (
              <div className="mt-16 flex items-center justify-between">
                <button 
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="flex items-center space-x-2 px-6 py-3 bg-white/60 border border-white rounded-2xl font-bold text-slate-500 hover:bg-white/80 disabled:opacity-0 transition backdrop-blur-sm"
                >
                  <ChevronLeft size={20} />
                  <span>Sebelumnya</span>
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button 
                    onClick={() => setCurrentIdx(prev => prev + 1)}
                    className="flex items-center space-x-2 px-8 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-500/20 transform active:scale-95"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    className="flex items-center space-x-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
                  >
                    <Send size={20} />
                    <span>Selesaikan Ujian</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Nav */}
        <aside className={cn(
          "w-80 bg-white/70 backdrop-blur-xl border-l border-red-50 p-8 flex flex-col shrink-0 transition-all fixed inset-y-0 right-0 lg:relative lg:translate-x-0 overflow-y-auto z-30",
          showNav ? "translate-x-0 shadow-2xl" : "translate-x-full"
        )}>
          <div className="mb-8">
            <h3 className="font-black text-slate-900 text-lg mb-1 truncate">Navigasi Soal</h3>
            <p className="text-[10px] text-brand-600 font-bold uppercase tracking-widest">Klik angka untuk lompat</p>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIdx(idx);
                    setShowNav(false);
                  }}
                  className={cn(
                    "h-12 w-full rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 border",
                    isCurrent ? "bg-brand-600 text-white shadow-lg border-brand-400 scale-110 z-10" :
                    isAnswered ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white/40 text-slate-400 border-white"
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-8 border-t border-red-50">
            <div className="flex items-center space-x-4 text-amber-700 bg-amber-50 p-5 rounded-2xl border border-amber-100">
              <AlertTriangle size={24} className="shrink-0 opacity-80" />
              <p className="text-[10px] font-bold uppercase tracking-tight leading-normal">
                Jawaban Anda disimpan secara otomatis di perangkat ini.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-[100]"
          >
            <Loader2 className="w-16 h-16 text-brand-600 animate-spin mb-6" />
            <h2 className="text-2xl font-black">Mengirim Jawaban...</h2>
            <p className="text-gray-500 font-medium font-jakarta tracking-tight">Mohon tidak menutup halaman ini.</p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Selesaikan Ujian?</h2>
              <p className="text-slate-500 font-bold mb-8 italic">
                {questions.length - Object.keys(answers).length > 0 
                  ? `Masih ada ${questions.length - Object.keys(answers).length} soal yang belum Anda jawab.` 
                  : "Anda telah menjawab semua soal. Pastikan kembali jawaban Anda."}
              </p>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleAutoSubmit();
                  }}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition transform active:scale-95"
                >
                  YA, SELESAIKAN SEKARANG
                </button>
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition"
                >
                  BELUM, LANJUTKAN LAGI
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamSession;
