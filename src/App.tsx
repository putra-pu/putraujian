/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import GuruDashboard from './pages/guru/GuruDashboard';
import SiswaDashboard from './pages/siswa/SiswaDashboard';
import StudentExams from './pages/siswa/StudentExams';
import ResultsHistory from './pages/exams/ResultsHistory';
import ExamSession from './pages/exams/ExamSession';
import QuestionManagement from './pages/questions/QuestionManagement';
import UserManagement from './pages/users/UserManagement';
import ExamManagement from './pages/exams/ExamManagement';
import SubjectManagement from './pages/subjects/SubjectManagement';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen bg-[#fef2f2] flex flex-col items-center justify-center p-8 text-center">
    <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-brand-600 mb-8 border border-white">
      <AlertTriangle size={48} />
    </div>
    <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">404 - Halaman Hilang</h1>
    <p className="text-slate-500 font-medium max-w-md mb-8 leading-relaxed">
      Sistem tidak dapat menemukan halaman yang Anda cari. Pastikan link sudah benar atau kembali ke dashboard.
    </p>
    <Link 
      to="/" 
      className="inline-flex items-center space-x-2 px-8 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition"
    >
      <Home size={20} />
      <span>Kembali ke Beranda</span>
    </Link>
  </div>
);

const ConfigWarning = () => {
  const { isConfigured } = useAuth();
  if (isConfigured) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[9999] bg-amber-500 text-white px-4 py-2 flex items-center justify-center space-x-3 shadow-lg text-sm font-bold animate-in slide-in-from-top duration-500">
      <AlertTriangle size={18} />
      <span>Supabase belum dikonfigurasi. Mohon atur VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di Secrets.</span>
      <button 
        onClick={() => window.open('https://supabase.com', '_blank')}
        className="px-3 py-1 bg-white text-amber-600 rounded-lg whitespace-nowrap"
      >
        Lengkapi Setup
      </button>
    </div>
  );
};

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  
  // Jika auth login berhasil tapi profil gagal dimuat (misal: RLS issue)
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="text-amber-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Profil Gagal Dimuat</h2>
        <p className="text-slate-500 max-w-md">Sistem tidak dapat menemukan data profil Anda. Silakan coba Refresh atau hubungi IT.</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-brand-600 text-white rounded-xl font-bold">Refresh Sekarang</button>
      </div>
    );
  }

  if (roles && !roles.includes(profile.role)) {
    console.warn(`Unauthorized access attempt. Role: ${profile.role}, Required: ${roles}`);
    const target = profile.role === 'admin' ? '/app/admin' : profile.role === 'teacher' ? '/app/guru' : '/app/siswa';
    return <Navigate to={target} />;
  }

  return <>{children}</>;
};

const AppLayout = () => {
  const { profile } = useAuth();
  
  return (
    <div className="flex h-screen bg-transparent relative overflow-hidden">
      <div className="glass-background"></div>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden z-10 relative">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          <Routes>
            {/* Redirect /app to role-specific dashboard based on actual profile */}
            <Route 
              path="/" 
              element={
                !profile ? <div className="p-8">Memuat rute...</div> :
                profile.role === 'admin' ? <Navigate to="admin" replace /> :
                profile.role === 'teacher' ? <Navigate to="guru" replace /> :
                <Navigate to="siswa" replace />
              } 
            />
            
            {/* Admin Routes */}
            <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
            
            {/* Guru Routes */}
            <Route path="guru" element={<ProtectedRoute roles={['teacher', 'admin']}><GuruDashboard /></ProtectedRoute>} />
            <Route path="guru/subjects" element={<ProtectedRoute roles={['teacher', 'admin']}><SubjectManagement /></ProtectedRoute>} />
            <Route path="guru/questions" element={<ProtectedRoute roles={['teacher', 'admin']}><QuestionManagement /></ProtectedRoute>} />
            <Route path="guru/exams" element={<ProtectedRoute roles={['teacher', 'admin']}><ExamManagement /></ProtectedRoute>} />

            {/* Siswa Routes */}
            <Route path="siswa" element={<ProtectedRoute roles={['student']}><SiswaDashboard /></ProtectedRoute>} />
            <Route path="siswa/exams" element={<ProtectedRoute roles={['student']}><StudentExams /></ProtectedRoute>} />
            
            {/* Shared Routes */}
            <Route path="results" element={<ProtectedRoute roles={['student', 'teacher', 'admin']}><ResultsHistory /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ConfigWarning />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app/exam/:examId" element={<ProtectedRoute><ExamSession /></ProtectedRoute>} />
          <Route 
            path="/app/*" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

