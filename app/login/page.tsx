'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShoppingBasket, ShieldCheck, User, Phone, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // State untuk Tab
  const [mode, setMode] = useState<'pelanggan' | 'admin'>('pelanggan');
  
  // State Input Pelanggan
  const [nama, setNama] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  // State Input Admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State Loading & Error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- LOGIKA LOGIN PELANGGAN ---
  const handleLoginPelanggan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !whatsapp) {
      setErrorMsg('Nama dan Nomor WhatsApp wajib diisi.');
      return;
    }

    setIsLoading(true);
    // Simpan data pelanggan di memori browser (Local Storage)
    localStorage.setItem('alfa_nama_pelanggan', nama);
    localStorage.setItem('alfa_wa_pelanggan', whatsapp);
    
    // Arahkan langsung ke beranda belanja
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  // --- LOGIKA LOGIN ADMIN ---
  const handleLoginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg('Email dan Kata Sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      // Autentikasi dengan Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Berhasil, arahkan ke dashboard admin
      router.push('/admin');
    } catch (err: any) {
      setErrorMsg('Akses ditolak. Email atau sandi salah.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f9f1ff] min-h-screen flex items-center justify-center p-6 font-sans text-[#1d1a24]">
      <main className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgba(99,14,212,0.06)] flex flex-col gap-6 relative overflow-hidden transition-all duration-300">
        
        {/* Dekorasi Cahaya Atas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-[#d2bbff]/30 to-transparent pointer-events-none rounded-t-3xl transition-colors duration-500"></div>
        
        {/* Ikon Lingkaran (Berubah sesuai mode) */}
        <div className="flex justify-center relative z-10 mt-2">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(99,14,212,0.12)] transition-colors duration-500 ${mode === 'pelanggan' ? 'bg-[#eaddff] text-[#630ed4]' : 'bg-[#ffe0cd] text-[#a15100]'}`}>
            {mode === 'pelanggan' ? <ShoppingBasket size={42} /> : <ShieldCheck size={42} />}
          </div>
        </div>

        {/* Teks Header */}
        <div className="text-center space-y-2 relative z-10">
          <h1 className="text-3xl font-black tracking-tight">{mode === 'pelanggan' ? 'Masuk' : 'Portal Admin'}</h1>
          <p className="text-sm font-medium text-[#7b7487] max-w-[280px] mx-auto leading-relaxed">
            {mode === 'pelanggan' 
              ? 'Mulai belanja kebutuhan harian premium dengan AlfaShop.' 
              : 'Gunakan kredensial Anda untuk mengelola toko.'}
          </p>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex bg-[#fef7ff] border border-[#ffe4e6] p-1.5 rounded-2xl relative z-10 my-2">
          <button 
            type="button" onClick={() => { setMode('pelanggan'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${mode === 'pelanggan' ? 'bg-[#630ed4] text-white shadow-md' : 'text-[#7b7487] hover:text-[#1d1a24]'}`}
          >
            Pelanggan
          </button>
          <button 
            type="button" onClick={() => { setMode('admin'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${mode === 'admin' ? 'bg-[#a15100] text-white shadow-md' : 'text-[#7b7487] hover:text-[#1d1a24]'}`}
          >
            Admin Toko
          </button>
        </div>

        {/* Pesan Error */}
        {errorMsg && (
          <div className="bg-[#fff1f2] border border-[#ffdad6] text-[#ba1a1a] p-3 rounded-xl flex items-center gap-2 text-xs font-bold relative z-10 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* FORM PELANGGAN */}
        {mode === 'pelanggan' && (
          <form onSubmit={handleLoginPelanggan} className="flex flex-col gap-5 relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#4a4455] ml-1" htmlFor="fullName">Nama Lengkap</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#ccc3d8] pointer-events-none"><User size={20} /></span>
                <input 
                  id="fullName" type="text" value={nama} onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama Anda" 
                  className="w-full pl-12 pr-4 py-4 bg-[#fef7ff] rounded-xl border border-[#ccc3d8] text-sm font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#630ed4] focus:border-transparent transition-all placeholder:text-[#ccc3d8] placeholder:font-medium shadow-sm" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#4a4455] ml-1" htmlFor="whatsapp">Nomor WhatsApp</label>
              <div className="relative flex shadow-sm rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#630ed4] transition-all">
                <div className="flex items-center justify-center pl-4 pr-3 bg-[#f3ebfa] border-y border-l border-[#ccc3d8] text-xl select-none">🇮🇩</div>
                <input 
                  id="whatsapp" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="812 3456 7890" 
                  className="w-full pl-2 pr-4 py-4 bg-[#fef7ff] border-y border-r border-[#ccc3d8] border-l-0 text-sm font-bold text-[#1d1a24] focus:outline-none transition-all placeholder:text-[#ccc3d8] placeholder:font-medium" 
                />
              </div>
            </div>

            <button disabled={isLoading} type="submit" className="mt-4 w-full py-4 bg-[#630ed4] text-white text-sm font-bold rounded-xl shadow-[0_8px_20px_rgba(99,14,212,0.25)] hover:bg-[#732ee4] hover:shadow-[0_8px_25px_rgba(99,14,212,0.35)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Mulai Belanja'}
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        )}

        {/* FORM ADMIN */}
        {mode === 'admin' && (
          <form onSubmit={handleLoginAdmin} className="flex flex-col gap-5 relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#4a4455] ml-1" htmlFor="email">Email Admin</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#ccc3d8] pointer-events-none"><Mail size={20} /></span>
                <input 
                  id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@alfashop.com" 
                  className="w-full pl-12 pr-4 py-4 bg-[#fef7ff] rounded-xl border border-[#ccc3d8] text-sm font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#a15100] focus:border-transparent transition-all placeholder:text-[#ccc3d8] placeholder:font-medium shadow-sm" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#4a4455] ml-1" htmlFor="password">Kata Sandi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#ccc3d8] pointer-events-none"><Lock size={20} /></span>
                <input 
                  id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-4 bg-[#fef7ff] rounded-xl border border-[#ccc3d8] text-sm font-bold text-[#1d1a24] focus:outline-none focus:ring-2 focus:ring-[#a15100] focus:border-transparent transition-all placeholder:text-[#ccc3d8] placeholder:font-medium shadow-sm" 
                />
              </div>
            </div>

            <button disabled={isLoading} type="submit" className="mt-4 w-full py-4 bg-[#a15100] text-white text-sm font-bold rounded-xl shadow-[0_8px_20px_rgba(161,81,0,0.25)] hover:bg-[#c26200] hover:shadow-[0_8px_25px_rgba(161,81,0,0.35)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Masuk Dashboard'}
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        )}

      </main>
    </div>
  );
}