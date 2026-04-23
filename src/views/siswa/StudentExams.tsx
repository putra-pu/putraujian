"use client";

import React, { useState, useEffect } from 'react';
import { examService } from '../../services/examService';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'motion/react';
import { 
  PlayCircle, 
  Clock, 
  FileText, 
  Calendar,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentExams = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const data = await examService.getAll();
      // Filter only active exams for students
      setExams(data?.filter((e: any) => e.is_active) || []);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sesi Ujian Tersedia</h1>
        <p className="text-slate-500 font-medium">Pilih jadwal ujian aktif untuk memulai pengerjaan.</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs text-center">Sinkronisasi Jadwal Ujian...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam, i) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white p-8 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{exam.subjects?.name || 'UMUM'}</span>
                <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                  <FileText size={20} />
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2 truncate group-hover:text-brand-600 transition-colors uppercase tracking-tight">{exam.title}</h3>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed line-clamp-2">
                {exam.description || 'Instruksi pengerjaan tidak tersedia. Pastikan akun dalam kondisi aktif.'}
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  <Clock size={16} className="text-brand-500" />
                  <span>Durasi: {exam.duration_minutes} Menit</span>
                </div>
              </div>

              <Link 
                to={`/app/exam/${exam.id}`}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-slate-800 transition shadow-lg shadow-slate-200 group-hover:translate-y-[-2px]"
              >
                <PlayCircle size={20} />
                <span>MULAI SESI SEKARANG</span>
              </Link>
            </motion.div>
          ))}

          {exams.length === 0 && (
            <div className="lg:col-span-3 text-center py-20 bg-white/40 rounded-[3rem] border border-dashed border-slate-200">
              <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900">Belum Ada Ujian</h3>
              <p className="text-slate-500 font-medium">Hubungi wali kelas atau admin IT jika jadwal belum muncul.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentExams;
