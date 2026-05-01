'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { ArrowLeft, User, Phone, MapPin, LogOut, Edit2, Save, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilPage() {
  const router = useRouter();
  
  // Panggil data dan fungsi dari Zustand
  const { user, login, logout } = useUserStore();
  
  // State untuk mode edit dan data form
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    whatsapp: '',
    alamat: ''
  });

  // Isi form otomatis dengan data user saat halaman dimuat
  useEffect(() => {
    if (user) {
      setFormData({
        nama: user.name || '',
        whatsapp: user.phone || '',
        alamat: user.address || ''
      });
    } else {
      // Jika terdeteksi belum login tapi masuk ke halaman ini, lempar ke beranda
      router.push('/');
    }
  }, [user, router]);

  // Fungsi simpan perubahan
  const handleSave = () => {
    // Kita gunakan fungsi 'login' dari Zustand untuk menimpa/memperbarui data di memori
    login({
      name: formData.nama,
      phone: formData.whatsapp,
      address: formData.alamat
    });
    setIsEditing(false);
    alert("Data profil berhasil diperbarui!");
  };

  // Fungsi Logout
  const handleLogout = () => {
    const konfirmasi = window.confirm("Apakah Anda yakin ingin keluar dari akun?");
    if (konfirmasi) {
      logout(); // Hapus memori di Zustand & localStorage
      router.push('/'); // Lempar ke Beranda
    }
  };

  // Cegah error render jika data user belum siap
  if (!user) return null; 

  return (
    <div className="w-full min-h-screen bg-[#fef7ff] pb-32">
      
      {/* HEADER */}
      <div className="bg-white px-5 pt-6 pb-4 flex items-center gap-3 border-b border-[#ffe4e6] sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 bg-[#fef7ff] rounded-xl border border-[#ffe4e6] text-[#7b7487] active:scale-90 transition-all">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-[#1d1a24] tracking-tight">Profil Saya</h1>
      </div>

      <div className="px-5 mt-6 max-w-2xl mx-auto space-y-6">
        
        {/* KARTU PROFIL ATAS */}
        <div className="bg-white rounded-3xl border border-[#ffe4e6] p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-[#eaddff] to-[#f9f1ff]"></div>
          
          <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg text-[#630ed4] flex items-center justify-center font-black text-3xl relative z-10">
            {user.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          
          <h2 className="mt-3 text-xl font-black text-[#1d1a24]">{user.name}</h2>
          <p className="text-sm font-semibold text-[#7b7487]">+62 {user.phone}</p>
        </div>

        {/* KARTU EDIT DATA */}
        <div className="bg-white rounded-3xl border border-[#ffe4e6] p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-black text-[#630ed4] uppercase tracking-widest">Data Pribadi</h3>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isEditing ? 'bg-[#ecfdf5] text-[#059669] active:scale-95' : 'bg-[#f3ebfa] text-[#7c3aed] active:scale-95'}`}
            >
              {isEditing ? <><Save size={14} /> Simpan</> : <><Edit2 size={14} /> Edit Data</>}
            </button>
          </div>

          {/* Input Nama */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#7b7487] ml-1 flex items-center gap-1.5"><User size={14}/> Nama Lengkap</label>
            <input 
              type="text" 
              value={formData.nama} 
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all outline-none ${isEditing ? 'bg-[#fef7ff] border border-[#7c3aed] text-[#1d1a24]' : 'bg-gray-50 border border-transparent text-gray-500'}`}
            />
          </div>

          {/* Input WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#7b7487] ml-1 flex items-center gap-1.5"><Phone size={14}/> Nomor WhatsApp</label>
            <input 
              type="tel" 
              value={formData.whatsapp} 
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all outline-none ${isEditing ? 'bg-[#fef7ff] border border-[#7c3aed] text-[#1d1a24]' : 'bg-gray-50 border border-transparent text-gray-500'}`}
            />
          </div>

          {/* Input Alamat */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#7b7487] ml-1 flex items-center gap-1.5"><MapPin size={14}/> Alamat Lengkap</label>
            <textarea 
              rows={3}
              value={formData.alamat} 
              onChange={(e) => setFormData({...formData, alamat: e.target.value})}
              disabled={!isEditing}
              placeholder={isEditing ? "Masukkan alamat lengkap Anda..." : "Alamat belum diatur"}
              className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all outline-none resize-none ${isEditing ? 'bg-[#fef7ff] border border-[#7c3aed] text-[#1d1a24]' : 'bg-gray-50 border border-transparent text-gray-500'}`}
            />
          </div>
        </div>

        {/* TOMBOL LOGOUT */}
        <button 
          onClick={handleLogout}
          className="w-full mt-4 bg-[#fff1f2] border border-[#ffe4e6] text-[#e11d48] py-4 rounded-2xl font-black shadow-sm hover:bg-[#ffe4e6] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
        >
          <LogOut size={20} />
          KELUAR AKUN
        </button>

      </div>
    </div>
  );
}