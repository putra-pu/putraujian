import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Search, 
  Bell, 
  LogOut,
  ChevronDown,
  User
} from 'lucide-react';

const Header = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white/40 backdrop-blur-md border-b border-white/40 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-sm">Beranda</span>
        <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        <span className="font-semibold text-slate-900 text-sm capitalize">{profile?.role} Dashboard</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Tahun Ajaran</p>
            <p className="text-xs font-bold text-brand-600">2023 / 2024 GANJIL</p>
          </div>
          <div className="h-8 w-[1px] bg-slate-200"></div>
          <div className="bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase">Sistem Online</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 group cursor-pointer relative">
          <div className="w-10 h-10 rounded-xl bg-white/80 border border-white flex items-center justify-center text-slate-600 shadow-sm transition-all group-hover:shadow-md">
            <User size={20} />
          </div>
          
          <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-md border border-white p-2 rounded-2xl shadow-xl w-52">
              <div className="px-4 py-3 border-b border-gray-50 mb-2 mt-1">
                <p className="text-xs font-black text-slate-900 truncate leading-none mb-1">{profile?.full_name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{profile?.role}</p>
              </div>
              <button className="flex items-center space-x-3 w-full px-4 py-2.5 hover:bg-slate-50 text-slate-600 rounded-xl transition text-xs font-semibold">
                <User size={14} />
                <span>Profil Akun</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-2.5 text-brand-600 hover:bg-brand-50 rounded-xl transition text-xs font-bold mt-1"
              >
                <LogOut size={14} />
                <span>Keluar Sistem</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
