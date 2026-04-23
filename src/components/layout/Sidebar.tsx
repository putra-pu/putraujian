import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  Settings,
  LayoutDashboard,
  FileQuestion
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  const currentRole = profile?.role || 'student';
  
  const getDashboardPath = () => {
    if (currentRole === 'admin') return '/app/admin';
    if (currentRole === 'teacher') return '/app/guru';
    return '/app/siswa';
  };

  const menuItems = [
    { 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: getDashboardPath(), 
      roles: ['admin', 'teacher', 'student'] 
    },
    { 
      label: 'Manajemen User', 
      icon: Users, 
      path: '/app/admin/users', 
      roles: ['admin'] 
    },
    { 
      label: 'Manajemen Matpel', 
      icon: BookOpen, 
      path: '/app/guru/subjects', 
      roles: ['admin', 'teacher'] 
    },
    { 
      label: 'Bank Soal (LMS)', 
      icon: FileQuestion, 
      path: '/app/guru/questions', 
      roles: ['admin', 'teacher'] 
    },
    { 
      label: 'Jadwal Ujian', 
      icon: Calendar, 
      path: '/app/guru/exams', 
      roles: ['admin', 'teacher'] 
    },
    { 
      label: 'Sesi Ujian Aktif', 
      icon: ClipboardList, 
      path: '/app/siswa/exams', 
      roles: ['student'] 
    },
    { 
      label: 'Hasil & Rekapitulasi', 
      icon: BarChart3, 
      path: '/app/results', 
      roles: ['admin', 'teacher', 'student'] 
    },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(currentRole)
  );

  return (
    <aside className="w-72 bg-white/70 backdrop-blur-xl border-r border-red-100 flex flex-col h-full z-10 shadow-lg">
      <div className="p-6 border-b border-red-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-slate-900 leading-none uppercase text-sm">CBT System</h1>
            <p className="text-[10px] uppercase font-bold text-brand-600 tracking-wider mt-1">SMK Prima Unggul</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Menu Utama</div>
        {filteredMenu.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group font-semibold",
                isActive 
                  ? "bg-brand-50 text-brand-700 shadow-sm border border-brand-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-900")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-red-50 space-y-3">
        <div className="bg-white/40 border border-white/50 p-4 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-white flex items-center justify-center text-slate-600 font-bold text-xs">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate leading-none mb-1">{profile?.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{profile?.role}</p>
            </div>
          </div>
          <button className="w-full py-2 bg-white/60 border border-white rounded-xl text-xs font-bold text-slate-500 hover:text-brand-600 hover:border-brand-100 transition shadow-sm">
            Bantuan IT
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
