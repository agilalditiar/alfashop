'use client';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
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
    // TODO: Logika Zustand keranjang dimasukkan di sini
  };

  return (
    // Tambahkan pb-32 agar konten tidak tertutup navigasi bawah!
    <div className="w-full min-h-screen bg-[#fef7ff] pb-32">
      
      {/* Tombol Kembali */}
      <div className="absolute top-4 left-4 z-20">
        <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-md text-[#7c3aed] active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* GAMBAR PRODUK: Dipaksa kotak presisi dan memenuhi layar */}
      <div className="w-full aspect-square bg-gray-100 relative overflow-hidden">
        <img 
          src="https://via.placeholder.com/500" // Ganti dengan variabel gambar dari database kamu
          alt="Tepung Terigu Segitiga Biru"
          className="absolute inset-0 w-full h-full object-cover" // Kunci agar tidak ada spasi putih
        />
      </div>

      {/* AREA DESKRIPSI: Melengkung estetik */}
      <div className="p-6 bg-white rounded-t-3xl -mt-6 relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] min-h-[50vh]">
        
        {/* Kategori */}
        <p className="text-xs font-black text-[#630ed4] uppercase tracking-widest mb-3">
          Kategori: Bumbu Dapur
        </p>

        {/* Judul Produk */}
        <h1 className="text-2xl sm:text-3xl font-black text-[#1d1a24] leading-tight break-words mb-3">
          Tepung Terigu Segitiga Biru 1kg - Ekonomis, Lembut, Cocok untuk Berbagai Kue
        </h1>
        
        {/* Harga */}
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-3xl font-black text-[#7c3aed]">Rp 16.000</span>
          <span className="text-sm font-semibold text-[#7b7487]">/Ecer</span>
        </div>

        {/* Garis Pemisah */}
        <div className="w-full h-px bg-[#ffe4e6] mb-6"></div>

        {/* Teks Deskripsi */}
        <div className="mb-8">
          <h3 className="font-bold text-[#1d1a24] mb-3 flex items-center gap-2">
            Detail Produk
          </h3>
          <p className="text-sm text-[#7b7487] leading-relaxed text-justify">
            Tepung terigu protein sedang yang cocok untuk membuat aneka makanan seperti bolu, brownies, cake pisang, martabak manis, muffin, kue lumpur, ayam goreng, dan aneka jajanan pasar lainnya.
          </p>
        </div>

        {/* Tombol Tambah ke Keranjang */}
        <button 
          onClick={handleAddToCart}
          className="w-full bg-[#630ed4] text-white py-4 rounded-2xl font-black shadow-[0_8px_20px_rgba(99,14,212,0.25)] hover:bg-[#732ee4] active:scale-[0.98] transition-all flex justify-center items-center gap-3"
        >
          <ShoppingCart size={22} />
          MASUKKAN KERANJANG
        </button>
      </div>
    </div>
  );
}