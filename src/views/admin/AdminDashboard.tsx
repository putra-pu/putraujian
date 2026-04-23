"use client";

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, Users, FileQuestion, Calendar, BarChart3, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const AdminDashboard = () => {
  const { profile } = useAuth();

  const stats = [
    { label: 'Total User', value: '124', icon: Users, color: 'bg-blue-500' },
    { label: 'Bank Soal', value: '450', icon: FileQuestion, color: 'bg-emerald-500' },
    { label: 'Ujian Aktif', value: '3', icon: Calendar, color: 'bg-brand-600' },
    { label: 'Rata-rata Nilai', value: '82.4', icon: BarChart3, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center space-x-3 mb-2">
          <ShieldCheck className="text-brand-600" size={24} />
          <span className="text-xs font-black text-brand-600 uppercase tracking-[0.3em]">Administrator Portal</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Selamat Datang, {profile?.full_name || 'Admin'}</h1>
        <p className="text-slate-500 font-medium">Panel kontrol utama sistem CBT SMK Prima Unggul.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">Aktivitas Terkini</h2>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Pembaruan sistem oleh Admin IT</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Baru saja • Infrastruktur</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-brand-600 p-8 rounded-[2.5rem] shadow-2xl shadow-brand-500/20 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-black mb-4 uppercase tracking-tight">Kesehatan Sistem</h2>
            <p className="text-brand-100 font-medium mb-8 leading-relaxed opacity-80">Semua layanan Cloud Run and Supabase berjalan optimal. Database terhubung dengan enkripsi AES-256.</p>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
              <span className="text-xs font-black uppercase tracking-widest text-brand-100">Operational: 100%</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
