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
    // Gunakan h-full agar pas dengan tinggi layout utama
    <div className="flex flex-col min-h-full bg-[#fef7ff]">
      
      {/* TOMBOL KEMBALI */}
      <button 
        onClick={() => router.back()} 
        className="absolute top-4 left-4 z-[99] flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-md border border-[#ffe4e6] rounded-full shadow-md text-[#1d1a24] active:scale-90 transition-transform"
      >
        <ArrowLeft size={20} />
      </button>

      {/* AREA GAMBAR (Tidak perlu padding berlebih agar pas) */}
      <div className="w-full aspect-square bg-white flex-shrink-0 flex items-center justify-center">
        <img 
          src="https://via.placeholder.com/500" // Nanti ganti dengan gambar database
          alt="Mie Sedaap Goreng"
          className="w-full h-full object-contain p-4" 
        />
      </div>

      {/* AREA DESKRIPSI (flex-1 agar mengisi sisa ruang di bawah gambar) */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-20 px-6 pt-8 shadow-[0_-10px_25px_rgba(0,0,0,0.04)] flex-1 flex flex-col">
        
        <p className="text-[10px] font-black text-[#630ed4] uppercase tracking-widest mb-3">
          Kategori: Mie & Instan
        </p>

        <h1 className="text-2xl font-black text-[#1d1a24] leading-snug break-words mb-2">
          Mie Sedaap Goreng
        </h1>
        
        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-3xl font-black text-[#7c3aed]">Rp 3.500</span>
          <span className="text-sm font-bold text-[#7b7487]">/Ecer</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1.5 bg-[#f3ebfa] text-[#630ed4] rounded-full text-xs font-bold border border-[#eaddff]">
            ✓ Pilihan Terbaik
          </span>
          <span className="px-3 py-1.5 bg-[#ecfdf5] text-[#059669] rounded-full text-xs font-bold border border-[#a7f3d0]">
            🌱 Segar & Aman
          </span>
        </div>

        <div className="w-full h-px bg-[#f3ebfa] mb-6"></div>

        <div className="mb-8">
          <h3 className="text-sm font-black text-[#1d1a24] mb-3">
            Deskripsi Produk
          </h3>
          <p className="text-sm text-[#7b7487] leading-relaxed text-justify">
            Original Mie Sedaap Mie goreng dari indonesia. 90g/pack. Keluaran dari Wingsfood indonesia. Original imported from indonesia. #rasa original indonesia.
          </p>
        </div>

        {/* 
          TOMBOL KERANJANG (DIPERBAIKI)
          mt-auto: Mendorong tombol ke posisi paling bawah yang tersisa.
          sticky bottom-0: Memastikan dia menempel di layar bawah tanpa merusak layout.
        */}
        <div className="mt-auto sticky bottom-0 left-0 w-full bg-white pt-2 pb-6 z-30">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-[#630ed4] text-white py-4 rounded-2xl font-black shadow-[0_8px_20px_rgba(99,14,212,0.25)] hover:bg-[#732ee4] active:scale-95 transition-transform flex justify-center items-center gap-2"
          >
            <ShoppingCart size={22} />
            Tambah ke Keranjang
          </button>
        </div>

      </div>
    </div>
  );
}