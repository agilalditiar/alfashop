'use client';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore'; 

export default function DetailProduk() {
  const router = useRouter();
  
  // Memanggil status login dari otak Zustand yang baru dibuat
  const user = useUserStore((state) => state.user);

  // Fungsi pencegat saat tombol keranjang dipencet
  const handleAddToCart = () => {
    if (!user) {
      alert("Oops! Silakan Login terlebih dahulu untuk mulai berbelanja.");
      router.push('/login'); // Lempar ke halaman login
      return;
    }
    
    // Jika sudah login, lanjutkan aksi tambah keranjang
    alert("Produk berhasil ditambahkan ke keranjang!");
    
    // TODO: Nanti panggil fungsi addToCart dari useCartStore kamu di sini
    // contoh: addToCart({ id: 1, nama_produk: 'Beras', harga: 65000, qty: 1 })
  };

  return (
    <div className="w-full min-h-screen bg-[#fef7ff] pb-24">
      
      {/* Tombol Kembali */}
      <div className="absolute top-4 left-4 z-20">
        <Link href="/" className="flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-md text-[#7c3aed] active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </Link>
      </div>

      {/* Gambar Produk */}
      <div className="w-full aspect-square bg-white relative">
        <img 
          src="https://via.placeholder.com/500" // Nanti sesuaikan dengan URL gambar Supabase
          alt="Gambar Produk"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Area Deskripsi */}
      <div className="p-5 bg-white rounded-t-3xl -mt-6 relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] min-h-[50vh]">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight break-words">
          Beras Maknyus 5 Kg Premium
        </h1>
        <p className="text-xl font-black text-[#7c3aed] mt-2">Rp 65.000</p>

        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 mb-2">Deskripsi Produk</h3>
          <p className="text-sm text-gray-600 leading-relaxed text-justify">
            Beras kualitas premium yang diproses dengan teknologi modern sehingga menghasilkan tekstur nasi yang pulen dan wangi. Cocok untuk hidangan keluarga sehari-hari.
          </p>
        </div>

        {/* Tombol Tambah ke Keranjang (Sudah dilindungi penjaga cerdas) */}
        <button 
          onClick={handleAddToCart}
          className="w-full mt-8 bg-[#7c3aed] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-200 active:scale-95 transition-transform flex justify-center items-center gap-2"
        >
          <ShoppingCart size={20} />
          Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
}