import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import GuruDashboard from './pages/guru/GuruDashboard';
import SiswaDashboard from './pages/siswa/SiswaDashboard';
import UserManagement from './pages/users/UserManagement';
import SubjectManagement from './pages/subjects/SubjectManagement';
import QuestionManagement from './pages/questions/QuestionManagement';
import ExamManagement from './pages/exams/ExamManagement';
import StudentExams from './pages/siswa/StudentExams';
import ResultsHistory from './pages/exams/ResultsHistory';
import ExamSession from './pages/exams/ExamSession';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fef2f2]">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    const defaultPath = profile.role === 'admin' ? '/app/admin' : 
                        profile.role === 'teacher' ? '/app/guru' : '/app/siswa';
    return <Navigate to={defaultPath} replace />;
  }

  return (
    <div className="flex h-screen bg-transparent relative overflow-hidden">
      <div className="glass-background"></div>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden z-10 relative">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/app/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/app/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="/app/guru" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <GuruDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/app/guru/subjects" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <SubjectManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/app/guru/questions" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <QuestionManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/app/guru/exams" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <ExamManagement />
            </ProtectedRoute>
          } />

          <Route path="/app/siswa" element={
            <ProtectedRoute allowedRoles={['student']}>
              <SiswaDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/app/siswa/exams" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentExams />
            </ProtectedRoute>
          } />
          
          <Route path="/app/results" element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
              <ResultsHistory />
            </ProtectedRoute>
          } />
          
          <Route path="/app/exam/:examId" element={
            <ProtectedRoute allowedRoles={['student']}>
              <ExamSession />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
