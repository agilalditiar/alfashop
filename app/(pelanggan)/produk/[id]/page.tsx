'use client';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function DetailProduk() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const handleAddToCart = () => {
    if (!user) {
      alert("Oops! Silakan Login terlebih dahulu untuk mulai berbelanja.");
      router.push('/login');
      return;
    }
    alert("Produk berhasil ditambahkan ke keranjang!");
  };

  return (
    // Tambahkan 'relative' di sini agar tombol back tidak lari ke luar angkasa
    <div className="w-full flex flex-col pb-28 relative">
      
      {/* TOMBOL KEMBALI (Super Prioritas) */}
      <button 
        onClick={() => router.back()} 
        className="absolute top-4 left-4 z-[99] flex items-center justify-center w-11 h-11 bg-white border border-[#ffe4e6] rounded-full shadow-lg text-[#1d1a24] active:scale-90 transition-transform"
      >
        <ArrowLeft size={24} />
      </button>

      {/* AREA GAMBAR (Background putih agar menyatu dengan gambar produk) */}
      <div className="w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
        <img 
          src="https://via.placeholder.com/500" // Nanti ganti dengan gambar database
          alt="Mie Sedaap Goreng"
          className="w-full h-full object-contain" // object-contain memastikan gambar tidak terpotong
        />
      </div>

      {/* AREA DESKRIPSI (Melengkung naik ke atas gambar) */}
      <div className="bg-white rounded-t-3xl -mt-8 relative z-20 px-6 pt-8 pb-8 shadow-[0_-10px_25px_rgba(0,0,0,0.06)] min-h-[55vh] flex flex-col">
        
        {/* Kategori */}
        <p className="text-[10px] font-black text-[#630ed4] uppercase tracking-widest mb-3">
          Kategori: Mie & Instan
        </p>

        {/* Judul Produk */}
        <h1 className="text-2xl sm:text-3xl font-black text-[#1d1a24] leading-snug break-words mb-2">
          Mie Sedaap Goreng
        </h1>
        
        {/* Harga */}
        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-3xl font-black text-[#7c3aed]">Rp 3.500</span>
          <span className="text-sm font-bold text-[#7b7487]">/Ecer</span>
        </div>

        {/* Badges / Label Tambahan */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1.5 bg-[#f3ebfa] text-[#630ed4] rounded-full text-xs font-bold border border-[#eaddff] flex items-center gap-1">
            ✓ Pilihan Terbaik
          </span>
          <span className="px-3 py-1.5 bg-[#ecfdf5] text-[#059669] rounded-full text-xs font-bold border border-[#a7f3d0] flex items-center gap-1">
            🌱 Segar & Aman
          </span>
          <span className="px-3 py-1.5 bg-[#fff1f2] text-[#e11d48] rounded-full text-xs font-bold border border-[#ffe4e6] flex items-center gap-1">
            ⏱️ Tersedia
          </span>
        </div>

        <div className="w-full h-px bg-[#f3ebfa] mb-6"></div>

        {/* Detail Teks */}
        <div className="mb-10">
          <h3 className="text-sm font-black text-[#1d1a24] mb-3">
            Detail Produk
          </h3>
          <p className="text-sm text-[#7b7487] leading-relaxed text-justify">
            Mie Sedaap Goreng dengan taburan bawang goreng kress yang nikmat. Diproses secara higienis dengan tekstur mie yang kenyal dan tidak mudah hancur. Cocok untuk dinikmati kapan saja.
          </p>
        </div>

        {/* Tombol Keranjang (Otomatis terdorong ke paling bawah konten) */}
        <button 
          onClick={handleAddToCart}
          className="w-full mt-auto bg-[#630ed4] text-white py-4 rounded-2xl font-black shadow-[0_8px_20px_rgba(99,14,212,0.25)] hover:bg-[#732ee4] active:scale-95 transition-transform flex justify-center items-center gap-2"
        >
          <ShoppingCart size={22} />
          MASUKKAN KERANJANG
        </button>

      </div>
    </div>
  );
}