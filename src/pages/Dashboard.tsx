import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { 
  Users, 
  FileQuestion, 
  Calendar, 
  BarChart3, 
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';

const Dashboard = () => {
  const { profile } = useAuth();

  const stats = [
    { label: 'Total Siswa', value: '1,240', icon: Users, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Bank Soal', value: '850', icon: FileQuestion, color: 'bg-brand-600', trend: '+45' },
    { label: 'Ujian Aktif', value: '4', icon: Calendar, color: 'bg-amber-500', trend: 'Sedang Berjalan' },
    { label: 'Rata-rata Nilai', value: '82.4', icon: BarChart3, color: 'bg-emerald-500', trend: '+2.1' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Halo, {profile?.full_name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 font-medium">Berikut adalah ringkasan sistem CBT SMK Prima Unggul hari ini.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.trend}</span>
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1 tabular-nums">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-3xl border border-white p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight text-xs">Jadwal Ujian Tersedia</h2>
            <button className="text-sm font-bold text-brand-600 hover:underline">Lihat Semua</button>
          </div>
          
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="group bg-white/40 p-6 rounded-3xl border border-white hover:border-brand-100 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-[10px] font-bold uppercase tracking-wider">
                    {i === 1 ? 'Teknik Komputer & Jaringan' : 'Mata Pelajaran Umum'}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-1">
                  {i === 1 ? 'Administrasi Infrastruktur Jaringan' : 'Pendidikan Kewarganegaraan'}
                </h4>
                <p className="text-slate-500 text-sm mb-6">Ujian Tengah Semester Ganjil - Teori Dasar</p>
                
                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                    <Clock size={16} className="text-brand-500" />
                    <span>90 Menit</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                    <FileQuestion size={16} className="text-brand-500" />
                    <span>40 Soal</span>
                  </div>
                </div>
                
                <button className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-200 transition-all transform active:scale-[0.98]">
                  Mulai Ujian
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Internal Announcement */}
          <div className="bg-brand-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-brand-500/20">
            <div className="relative z-10">
              <TrendingUp className="mb-6 opacity-80" size={40} />
              <h2 className="text-2xl font-bold mb-2">Pusat Informasi</h2>
              <p className="text-brand-100 text-sm mb-8 leading-relaxed">
                Pastikan perangkat Anda terhubung dengan stabil sebelum memulai sesi ujian manapun.
              </p>
              <button className="w-full py-3 bg-white text-brand-600 rounded-xl text-sm font-bold shadow-lg hover:bg-brand-50 transition">
                Buka Panduan
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl shadow-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
