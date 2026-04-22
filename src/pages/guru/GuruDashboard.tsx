import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, FileQuestion, GraduationCap, ClipboardList, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

const GuruDashboard = () => {
  const { profile } = useAuth();

  const teacherStats = [
    { label: 'Bank Soal Saya', value: '42', icon: FileQuestion, color: 'bg-indigo-500' },
    { label: 'Jadwal Aktif', value: '2', icon: ClipboardList, color: 'bg-brand-600' },
    { label: 'Siswa Ujian', value: '156', icon: GraduationCap, color: 'bg-emerald-500' },
    { label: 'Selesai Dinilai', value: '88%', icon: TrendingUp, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="text-brand-600" size={24} />
          <span className="text-xs font-black text-brand-600 uppercase tracking-[0.3em]">Instructor Portal</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Halo, Bpk/Ibu {profile?.full_name?.split(' ')[0] || 'Guru'}</h1>
        <p className="text-slate-500 font-medium">Platform manajemen evaluasi akademik SMK Prima Unggul.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teacherStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all group"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
              <stat.icon size={24} />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 font-display uppercase tracking-tight">Ujian Mendatang</h2>
          <div className="space-y-4">
            {[1, 2].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 font-bold">
                    MK
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Ujian Kompetensi Keahlian (UKK)</h4>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">Besok, 08:00 WIB • TKJ XII-1</p>
                  </div>
                </div>
                <button className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase text-brand-600 hover:bg-brand-50 transition">
                  Siapkan Soal
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-dashed border-slate-200">
          <h2 className="text-lg font-black text-slate-900 mb-4 tracking-tight uppercase">Bantuan Guru</h2>
          <p className="text-sm text-slate-500 font-medium mb-6">Butuh panduan pembuatan soal berbasis HOTS atau integrasi gambar?</p>
          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-tight hover:bg-slate-800 transition">
            Lihat Dokumentasi
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuruDashboard;
