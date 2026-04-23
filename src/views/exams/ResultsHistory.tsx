"use client";

import React, { useState, useEffect } from 'react';
import { resultService, ExamResult } from '../../services/resultService';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'motion/react';
import { History, Trophy, Calendar, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { clsx } from 'clsx';

const ResultsHistory = () => {
  const { profile } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isStaff = profile?.role === 'admin' || profile?.role === 'teacher';

  useEffect(() => {
    fetchResults();
  }, [profile]);

  const fetchResults = async () => {
    if (!profile) return;
    try {
      const data = isStaff 
        ? await resultService.getAllResults() 
        : await resultService.getMyResults();
      setResults(data || []);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {isStaff ? 'Rekapitulasi Nilai Siswa' : 'Riwayat Ujian Saya'}
        </h1>
        <p className="text-slate-500 font-medium">
          {isStaff ? 'Pantau performa akademik seluruh siswa dalam sistem.' : 'Rekapitulasi nilai dan performa akademik Anda.'}
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Menarik Data Nilai...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {results.map((res, i) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-brand-500/5 transition-all"
            >
              <div className="flex items-center space-x-6">
                <div className={clsx(
                  "w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg",
                  res.score >= 75 ? "bg-emerald-50 text-emerald-600 shadow-emerald-500/10" : "bg-amber-50 text-amber-600 shadow-amber-500/10"
                )}>
                  {res.score >= 75 ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{res.exams?.title || 'Ujian Terhapus'}</h3>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {isStaff && (
                      <div className="flex items-center space-x-2 text-brand-600 text-[10px] font-black uppercase tracking-widest">
                        <User size={14} />
                        <span>{res.profiles?.full_name || 'Siswa'}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <Calendar size={14} />
                      <span>{new Date(res.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <Trophy size={14} />
                      <span>{res.total_correct} / {res.total_questions} Benar</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-8 px-6 py-4 bg-white/40 rounded-3xl border border-white">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Skor Akhir</p>
                  <p className={clsx(
                    "text-4xl font-black tabular-nums",
                    res.score >= 75 ? "text-emerald-600" : "text-slate-900"
                  )}>{Number(res.score).toFixed(1)}</p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</p>
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    res.score >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-600"
                  )}>
                    {res.score >= 75 ? 'LULUS' : 'REMIDI'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {results.length === 0 && (
            <div className="text-center py-20 bg-white/40 rounded-[3rem] border border-dashed border-slate-200">
              <History size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900">Riwayat Kosong</h3>
              <p className="text-slate-500">Anda belum menyelesaikan ujian apapun.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsHistory;
