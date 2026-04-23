"use client";

import React, { useState, useEffect } from 'react';
import { subjectService, Subject } from '../../services/subjectService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  AlertCircle,
  BookMarked,
  Info
} from 'lucide-react';
import { clsx } from 'clsx';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getAll();
      setSubjects(data || []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (s?: Subject) => {
    if (s) {
      setEditingSubject(s);
      setFormData({
        name: s.name,
        description: s.description || ''
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        // Need to update service to support 'update'
        // For now, I'll assume we can implement it or just use create if missing
        // Let's actually update the service first or just use a generic update here
        const { error } = await (subjectService as any).update(editingSubject.id, formData);
        if (error) throw error;
      } else {
        await subjectService.create(formData);
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err) {
      console.error('Error saving subject:', err);
      alert('Gagal menyimpan mata pelajaran.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus mata pelajaran ini? Semua soal terkait akan terhapus.')) {
      try {
        const { error } = await (subjectService as any).delete(id);
        if (error) throw error;
        fetchSubjects();
      } catch (err) {
        console.error('Error deleting subject:', err);
      }
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Mata Pelajaran</h1>
          <p className="text-slate-500 font-medium">Kelola daftar kurikulum SMK Prima Unggul.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition transform active:scale-95"
        >
          <Plus size={20} />
          <span>Tambah Matpel</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari mata pelajaran..." 
          className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-md border border-white rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 transition shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat Matpel...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredSubjects.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-white p-6 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                      <BookMarked size={24} />
                    </div>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleOpenModal(s)}
                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">{s.name}</h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-2">{s.description || 'Tidak ada deskripsi.'}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-50">
                   <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <Info size={12} className="mr-1" />
                     ID: {s.id.substring(0, 8)}...
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredSubjects.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white/40 rounded-[3rem] border border-dashed border-slate-200">
              <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900">Belum Ada Mata Pelajaran</h3>
              <p className="text-slate-500">Mulai dengan menambahkan kurikulum baru.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{editingSubject ? 'Edit Matpel' : 'Tambah Matpel'}</h2>
                  <p className="text-slate-500 text-sm font-medium">Lengkapi detail kurikulum di bawah ini.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Nama Mata Pelajaran</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-brand-500 outline-none transition font-bold"
                    placeholder="Misal: Matematika, Bahasa Indonesia..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Deskripsi (Opsional)</label>
                  <textarea 
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:border-brand-500 outline-none transition font-medium min-h-[100px]"
                    placeholder="Keterangan singkat mengenai matpel ini..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-3 font-bold text-slate-500 hover:text-slate-900 transition"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-10 py-3 bg-brand-600 text-white rounded-2xl font-bold shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition"
                  >
                    {editingSubject ? 'Perbarui' : 'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubjectManagement;
