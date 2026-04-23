"use client";

import React, { useState, useEffect } from 'react';
import { userService, UserProfile } from '../../services/userService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Shield, 
  Trash2, 
  MoreVertical,
  CheckCircle2,
  X,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { clsx } from 'clsx';

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (id: string, role: 'admin' | 'teacher' | 'student') => {
    try {
      await userService.updateRole(id, role);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus user ini?')) {
      try {
        await userService.delete(id);
        fetchUsers();
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-600';
      case 'teacher': return 'bg-brand-100 text-brand-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen User</h1>
          <p className="text-slate-500 font-medium">Kelola hak akses dan identitas pengguna sistem CBT.</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold border border-emerald-100">
          <UserCheck size={20} />
          <span>{users.length} Akun Terdaftar</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari nama atau username..." 
          className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-md border border-white rounded-3xl outline-none focus:ring-2 focus:ring-brand-500/20 transition shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Singkronisasi Data User...</p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-md rounded-[3rem] border border-white overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 italic">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Info Pengguna</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role / Hak Akses</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Terdaftar Pada</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-white/40 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-600 text-sm">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-none mb-1">{user.full_name}</p>
                        <p className="text-xs text-slate-500">@{user.username || 'user'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <span className={clsx(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                        getRoleBadge(user.role)
                      )}>
                        {user.role}
                      </span>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleUpdateRole(user.id, 'admin')}
                          className="p-1 hover:bg-purple-50 text-purple-400 hover:text-purple-600 rounded"
                          title="Set as Admin"
                        >
                          <Shield size={14} />
                        </button>
                        <button 
                          onClick={() => handleUpdateRole(user.id, 'teacher')}
                          className="p-1 hover:bg-brand-50 text-brand-400 hover:text-brand-600 rounded"
                          title="Set as Teacher"
                        >
                          <UserPlus size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 text-xs font-medium">
                    {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
              Tidak ada data user yang ditemukan.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
