"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { GraduationCap, Timer, Trophy, History, PlayCircle, BookCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { resultService, ExamResult } from '../../services/resultService';
import { examService } from '../../services/examService';

const SiswaDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    highestScore: 0,
    totalExams: 0
  });
  const [activeExams, setActiveExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [results, exams] = await Promise.all([
        resultService.getMyResults(),
        examService.getAll()
      ]);

      const scores = results.map((r: ExamResult) => Number(r.score));
      setStats({
        highestScore: scores.length > 0 ? Math.max(...scores) : 0,
        totalExams: results.length
      });

      setActiveExams(exams.filter((e: any) => e.is_active).slice(0, 2));
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="relative p-10 bg-brand-600 rounded-[3rem] shadow-2xl shadow-brand-500/20 text-white overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <GraduationCap className="text-brand-100" size={32} />
            <span className="text-sm font-black text-brand-100 uppercase tracking-[0.4em]">Student Dashboard</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4">Semangat Belajar, {profile?.full_name?.split(' ')[0] || 'Siswa'}!</h1>
          <p className="text-brand-100/80 font-medium text-lg max-w-xl leading-relaxed">Wujudkan impianmu dengan ketekunan. Selesaikan ujian tepat waktu dan peroleh hasil terbaik untuk masa depanmu.</p>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full -mb-20 -mr-20 blur-3xl opacity-50" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-400 rounded-full -mt-10 -mr-10 blur-2xl opacity-40" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Sesi Ujian Aktif</h2>
            <Link to="/app/siswa/exams" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">Lihat Semua</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeExams.map((exam) => (
              <motion.div 
                key={exam.id}
                whileHover={{ y: -5 }}
                className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Sedang Berjalan</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-brand-600 transition-colors uppercase truncate">{exam.title}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed line-clamp-2">{exam.description || 'Tidak ada deskripsi.'}</p>
                </div>
                <Link 
                  to="/app/siswa/exams"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-slate-200"
                >
                  <PlayCircle size={20} />
                  <span>Masuk Sesi</span>
                </Link>
              </motion.div>
            ))}

            {activeExams.length === 0 && (
              <div className="md:col-span-2 bg-slate-100/50 backdrop-blur-md p-12 rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-4 border border-slate-200">
                  <Timer size={32} />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Belum Ada Sesi Ujian Baru</p>
                <p className="text-xs text-slate-400 mt-2">Cek kembali nanti untuk jadwal terbaru.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 px-4 uppercase tracking-tight">Pencapaian</h2>
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-sm space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm shadow-amber-200">
                <Trophy size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Skor Tertinggi</p>
                <p className="text-3xl font-black text-slate-900 tabular-nums">{Number(stats.highestScore).toFixed(1)}</p>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex items-center space-x-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shadow-indigo-200">
                <History size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ujian Selesai</p>
                <p className="text-3xl font-black text-slate-900 tabular-nums">{stats.totalExams}</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/app/results')}
              className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm flex items-center justify-center space-x-2 hover:bg-slate-50 transition shadow-sm"
            >
              <BookCheck size={20} />
              <span>Lihat Rekap Nilai</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiswaDashboard;
