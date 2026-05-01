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
    // PERBAIKAN: Hapus min-h-screen, ganti dengan w-full saja dan padding bawah yang cukup
    <div className="w-full pb-28">
      
      {/* Tombol Kembali (Melayang) */}
      <div className="absolute top-4 left-4 z-20">
        <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-md text-[#7c3aed] active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* GAMBAR PRODUK: Dibuat pas dengan lebar layar HP (aspect-square) */}
      <div className="w-full aspect-square bg-white relative">
        <img 
          src="https://via.placeholder.com/500" // Nanti ganti link gambarnya
          alt="Tepung Terigu Segitiga Biru"
          className="w-full h-full object-cover" 
        />
      </div>

      {/* AREA DESKRIPSI (Naik sedikit menutupi gambar agar estetik) */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 px-6 pt-8 pb-6 shadow-[0_-8px_20px_rgba(0,0,0,0.04)]">
        
        {/* Kategori */}
        <p className="text-[10px] font-black text-[#630ed4] uppercase tracking-widest mb-3">
          Kategori: Bumbu Dapur
        </p>

        {/* Judul Produk */}
        <h1 className="text-2xl font-black text-[#1d1a24] leading-snug break-words mb-2">
          Tepung Terigu Segitiga Biru 1kg - Ekonomis, Lembut
        </h1>
        
        {/* Harga */}
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-3xl font-black text-[#7c3aed]">Rp 16.000</span>
          <span className="text-sm font-bold text-[#7b7487]">/Ecer</span>
        </div>

        <div className="w-full h-px bg-[#f3ebfa] mb-6"></div>

        {/* Detail Produk */}
        <div className="mb-8">
          <h3 className="text-sm font-black text-[#1d1a24] mb-3">
            Detail Produk
          </h3>
          <p className="text-sm text-[#7b7487] leading-relaxed text-justify">
            Tepung terigu protein sedang yang cocok untuk membuat aneka makanan seperti bolu, brownies, cake pisang, martabak manis, muffin, kue lumpur, ayam goreng, dan aneka jajanan pasar lainnya.
          </p>
        </div>

        {/* Tombol Keranjang */}
        <button 
          onClick={handleAddToCart}
          className="w-full bg-[#630ed4] text-white py-4 rounded-2xl font-black shadow-[0_8px_20px_rgba(99,14,212,0.25)] hover:bg-[#732ee4] active:scale-95 transition-all flex justify-center items-center gap-2"
        >
          <ShoppingCart size={20} />
          MASUKKAN KERANJANG
        </button>

      </div>
    </div>
  );
}