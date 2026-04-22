import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, ShieldCheck, GraduationCap, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const majors = [
    { code: 'TKJ', name: 'Teknik Komputer Jaringan' },
    { code: 'DKV', name: 'Desain Komunikasi Visual' },
    { code: 'AK', name: 'Akuntansi' },
    { code: 'BC', name: 'Broadcasting' },
    { code: 'MPLB', name: 'Manajemen Perkantoran & Layanan Bisnis' },
    { code: 'BD', name: 'Bisnis Digital' }
  ];

  return (
    <div className="min-h-screen bg-[#fef2f2] relative overflow-hidden">
      <div className="glass-background"></div>
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white/40 backdrop-blur-md border-b border-white relative z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-200">
            <BookOpen className="text-white" size={24} />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">CBT System SMKPU</span>
        </div>
        <Link 
          to="/login" 
          className="px-8 py-2.5 bg-brand-600 text-white rounded-full font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200 active:scale-95"
        >
          Masuk Aplikasi
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="px-6 py-20 lg:py-32 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/60 border border-white text-brand-600 text-xs font-black uppercase tracking-widest mb-10 shadow-sm backdrop-blur-sm">
            <ShieldCheck size={14} className="mr-2" />
            Sistem Informasi Ujian Terpadu
          </span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9]">
            Masa Depan <br />
            <span className="text-brand-600">Pendidikan Digital</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-lg md:text-xl font-medium mb-12 leading-relaxed">
            Platform Computer Based Test (CBT) resmi SMK Prima Unggul. 
            Menjamin integritas, kecepatan, dan akurasi evaluasi kompetensi akademik.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
            <Link 
              to="/login" 
              className="w-full md:w-auto px-10 py-5 bg-brand-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-3 shadow-2xl shadow-brand-500/30 hover:bg-brand-700 transition transform hover:-translate-y-1"
            >
              <span className="text-lg">Mulai Sesi Ujian</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>
      </header>

      {/* About Section */}
      <section className="py-24 px-6 relative z-10 bg-white/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em] mb-4">Profil Sekolah</h2>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">SMK Prima Unggul <br /> Unggul, Kompeten, Berkarakter</h3>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">
              SMK Prima Unggul adalah lembaga pendidikan vokasi terkemuka yang berdedikasi untuk menciptakan tenaga kerja profesional dan wirausahawan muda yang siap menghadapi tantangan industri 4.0. Melalui kurikulum yang terintegrasi dengan kebutuhan industri, kami memastikan setiap siswa memiliki kompetensi yang relevan dan karakter yang kuat.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="p-6 bg-white/40 rounded-3xl border border-white">
                <h4 className="font-black text-slate-900 mb-2 uppercase tracking-tight text-xs">Visi Kami</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Menjadi pusat keunggulan pendidikan vokasi yang menghasilkan lulusan berdaya saing global.</p>
              </div>
              <div className="p-6 bg-white/40 rounded-3xl border border-white">
                <h4 className="font-black text-slate-900 mb-2 uppercase tracking-tight text-xs">Misi Kami</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Menyelenggarakan pembelajaran berbasis proyek dan kemitraan strategis dengan dunia industri.</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg aspect-auto">
            <div className="relative group">
              <img 
                src="https://picsum.photos/seed/school/800/600" 
                alt="SMK Prima Unggul" 
                className="rounded-[3rem] shadow-2xl border-4 border-white transform group-hover:rotate-1 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -left-6 bg-brand-600 text-white p-8 rounded-3xl shadow-xl shadow-brand-500/20">
                <p className="text-4xl font-black mb-1">20+</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Mitra Industri Aktif</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Majors Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em] mb-4">Program Keahlian</h2>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">Jurusan Unggulan Kami</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {majors.map((major, idx) => (
            <motion.div
              key={major.code}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 text-brand-600 font-black text-xl shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-all">
                {major.code}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">{major.name}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed italic opacity-80">
                Pendaftaran program keahlian tersedia untuk siswa aktif semester ganjil/genap.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/50 py-16 px-8 relative z-10 bg-white/20 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">
          <p>© 2024 SMK Prima Unggul. Integrated Digital Education.</p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <a href="#" className="hover:text-brand-600 transition">Bantuan IT</a>
            <a href="#" className="hover:text-brand-600 transition">Pusat Data</a>
            <a href="#" className="hover:text-brand-600 transition">Keamanan</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
