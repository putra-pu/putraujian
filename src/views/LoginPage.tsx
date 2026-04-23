"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2, AlertCircle, BookOpen, GraduationCap } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) throw signInError;
      if (!user) throw new Error('User data not found');

      // Fetch profile to determine role for redirection (master data from profiles table)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Profile fail-safe: defaulting to student role');
      }

      const role = profile?.role || 'student';
      
      if (role === 'admin') navigate('/app/admin');
      else if (role === 'teacher') navigate('/app/guru');
      else navigate('/app/siswa');
    } catch (err: any) {
      setError(err.message || 'Login gagal, periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative bg-[#fef2f2] overflow-hidden">
      <div className="glass-background"></div>
      
      {/* Left Column: Form */}
      <div className="flex items-center justify-center p-8 z-10">
        <div className="w-full max-w-md bg-white/40 backdrop-blur-xl p-8 lg:p-12 rounded-[2.5rem] border border-white shadow-2xl shadow-brand-500/10">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-200">
              <BookOpen className="text-white" size={24} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">CBT System</span>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Selamat Datang</h1>
          <p className="text-slate-500 mb-10 font-bold uppercase text-[10px] tracking-widest leading-none">Akses Portal CBT SMK Prima Unggul</p>

          {error && (
            <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl flex items-start space-x-3 text-red-600 text-sm mb-8">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-Mail Address</label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/60 border border-white rounded-2xl outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm"
                  placeholder="nama@smkprima.sch.id"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Account Password</label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/60 border border-white rounded-2xl outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-brand-500/20 transform active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Masuk Sekarang</span>}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            Butuh Bantuan? Hubungi <a href="#" className="text-brand-600 hover:underline">Unit Layanan Teknologi</a>
          </p>
        </div>
      </div>

      {/* Right Column: Visual */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 relative z-10">
        <div className="relative w-full max-w-lg aspect-square bg-white/20 backdrop-blur-xl rounded-[4rem] border border-white/40 flex flex-col items-center justify-center text-center p-16 shadow-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-24 h-24 bg-brand-600 text-white rounded-3xl flex items-center justify-center mb-12 shadow-2xl shadow-brand-500/30 rotate-6"
          >
            <GraduationCap size={44} />
          </motion.div>
          <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Membangun <br /> Generasi Digital Unggul</h2>
          <p className="text-slate-600 text-lg font-medium leading-relaxed">
            Sistem evaluasi akademik terpadu untuk mencetak lulusan kompeten yang siap bersaing secara global.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
