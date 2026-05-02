'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';

// TODO: Ganti dengan data produk asli dari database Supabase kamu nanti
const dataProduk = [
  { id: 1, name: 'Mie Sedaap Goreng', price: 3500, category: 'MIE & INSTAN', image: 'https://via.placeholder.com/500' },
  { id: 2, name: 'Kapal Api Special Mix 1 renteng', price: 21500, category: 'MINUMAN', image: 'https://via.placeholder.com/500' },
  { id: 3, name: 'Beras Maknyus 5 Kg', price: 65000, category: 'BERAS & SEMBAKO', image: 'https://via.placeholder.com/500' },
  { id: 4, name: 'Tepung Terigu Segitiga Biru 1kg', price: 16000, category: 'BUMBU DAPUR', image: 'https://via.placeholder.com/500' },
];

const kategoriList = ['Semua', 'Beras & Sembako', 'Minuman', 'Mie & Instan', 'Bumbu Dapur'];

export default function BerandaPage() {
  const [kategoriAktif, setKategoriAktif] = useState('Semua');

  return (
    <div className="p-5 space-y-6 pb-28 relative">
      
      {/* BANNER PROMO */}
      <div className="bg-gradient-to-br from-[#7c3aed] to-[#630ed4] rounded-3xl p-6 text-white shadow-[0_10px_30px_rgba(124,58,237,0.3)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm border border-white/20">
          Promo Spesial
        </span>
        <h2 className="text-2xl font-black mt-4 leading-tight">Belanja Hemat<br/>Kebutuhan Dapur</h2>
        <p className="text-xs text-white/80 mt-2 font-medium">Dapatkan produk segar berkualitas langsung ke pintu Anda.</p>
      </div>

      {/* KOLOM PENCARIAN */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ccc3d8]" />
        <input 
          type="text" 
          placeholder="Cari kebutuhan dapur..." 
          className="w-full bg-white border border-[#ffe4e6] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#1d1a24] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] transition-all placeholder:text-[#ccc3d8]"
        />
      </div>

      {/* FILTER KATEGORI */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {kategoriList.map((kat) => (
          <button 
            key={kat}
            onClick={() => setKategoriAktif(kat)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
              kategoriAktif === kat 
                ? 'bg-[#630ed4] text-white border-[#630ed4] shadow-md' 
                : 'bg-white text-[#7b7487] border-[#ffe4e6] hover:border-[#ccc3d8]'
            }`}
          >
            {kat}
          </button>
        ))}
      </div>

      {/* DAFTAR PRODUK (GRID) */}
      <div className="grid grid-cols-2 gap-4">
        {dataProduk.map((item) => (
          // PERUBAHAN UTAMA DI SINI:
          // Membungkus kartu dengan Link, bukan div onClick pembuka Pop-up!
          <Link 
            href={`/produk/${item.id}`} 
            key={item.id} 
            className="bg-white rounded-3xl border border-[#ffe4e6] p-3 flex flex-col h-full shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(99,14,212,0.08)] transition-all group"
          >
            <div className="w-full aspect-square bg-[#f9f1ff] rounded-2xl mb-3 overflow-hidden flex items-center justify-center p-2 relative">
              <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-[#e11d48] text-[8px] font-black px-2 py-1 rounded-full uppercase border border-[#ffe4e6]">
                {item.category.split(' ')[0]}
              </span>
              <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
            </div>
            
            <h3 className="text-[13px] font-black text-[#1d1a24] mb-1 line-clamp-2 leading-tight">
              {item.name}
            </h3>
            
            <div className="mt-auto pt-3">
              <p className="text-sm font-black text-[#7c3aed] mb-3">
                Rp {item.price.toLocaleString('id-ID')}
              </p>
              
              {/* Tombol keranjang ini hanya pemanis karena seluruh kartu bisa diklik menuju detail */}
              <div className="w-full bg-[#fef7ff] border border-[#eaddff] text-[#630ed4] py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 group-hover:bg-[#630ed4] group-hover:text-white transition-colors">
                <ShoppingCart size={14} /> Beli
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}