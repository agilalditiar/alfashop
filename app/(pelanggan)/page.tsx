'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, PackageOpen, Plus, Search, CheckCircle2, ArrowLeft, Heart, CheckCircle, Leaf, Clock, Minus, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// DAFTAR KATEGORI (Disamakan dengan halaman Admin)
const DAFTAR_KATEGORI = [
  'Semua', 
  'Beras & Sembako', 
  'Minuman', 
  'Makanan Ringan', 
  'Mie & Instan', 
  'Sabun & Deterjen', 
  'Bumbu Dapur', 
  'Lainnya'
];

export default function PelangganBeranda() {
  const [produkList, setProdukList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // STATE DIPERBARUI: Menggunakan filter kategori
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProduk, setSelectedProduk] = useState<any>(null);
  const [modalQty, setModalQty] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [flyingItems, setFlyingItems] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduk = async () => {
      const { data } = await supabase.from('produk').select('*').eq('tersedia', true);
      setProdukList(data || []);
      setIsLoading(false);
    };
    fetchProduk();
  }, []);

  useEffect(() => {
    if (selectedProduk) setModalQty(1);
  }, [selectedProduk]);

  const handleTambahCepat = (e: React.MouseEvent, produk: any) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    addToCart({ ...produk, qty: 1 });
    if (navigator.vibrate) navigator.vibrate(50);

    const id = Date.now();
    setFlyingItems((prev) => [...prev, { id, x: startX, y: startY }]);
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    }, 800);

    setToastMessage(`1x ${produk.nama_produk} ditambahkan`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleBeliDariModal = (e: React.MouseEvent) => {
    if (!selectedProduk) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    addToCart({ ...selectedProduk, qty: modalQty });
    if (navigator.vibrate) navigator.vibrate(50);

    const id = Date.now();
    setFlyingItems((prev) => [...prev, { id, x: startX, y: startY }]);
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    }, 800);

    setToastMessage(`${modalQty}x ${selectedProduk.nama_produk} ditambahkan`);
    setTimeout(() => setToastMessage(null), 2500);
    setSelectedProduk(null); 
  };

  // LOGIKA DIPERBARUI: Menyaring berdasarkan kolom kategori
  const filteredProduk = produkList.filter((p) => {
    const kategoriProduk = p.kategori || 'Lainnya'; // Jaga-jaga jika ada data lama yang kolom kategorinya kosong
    const matchKategori = filterKategori === 'Semua' ? true : kategoriProduk === filterKategori;
    const matchSearch = p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKategori && matchSearch;
  });

  return (
    <div className="px-5 pt-6 pb-8 relative">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: -50, opacity: 0 }} animate={{ y: 16, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[150] bg-[#1d1a24] text-white px-5 py-3 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl shadow-black/10"
          >
            <CheckCircle2 size={16} className="text-[#34d399]" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. BANNER PROMO VIOLET */}
      <div className="bg-gradient-to-br from-[#8b5cf6] to-[#630ed4] rounded-[2rem] p-6 text-white shadow-[0_8px_30px_rgba(99,14,212,0.2)] mb-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#c4b5fd]/30 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <span className="inline-block bg-[#fff1f2] text-[#fb7185] text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 shadow-sm border border-[#ffe4e6]">PROMO SPESIAL</span>
          <h2 className="text-[22px] font-black leading-tight mb-2 tracking-tight text-white drop-shadow-md">Belanja Hemat <br/> Kebutuhan Dapur</h2>
          <p className="text-[#eaddff] text-xs font-medium max-w-[85%] leading-relaxed">Dapatkan produk segar berkualitas langsung ke pintu Anda.</p>
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ccc3d8]" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari kebutuhan dapur..." 
          className="w-full bg-white border border-[#ffe4e6] rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-[#1d1a24] shadow-[0_4px_20px_rgba(124,58,237,0.03)] focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent outline-none transition-all placeholder:text-[#ccc3d8] placeholder:font-medium"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7b7487] bg-[#f3ebfa] p-1.5 rounded-full hover:text-[#ba1a1a] transition-colors active:scale-90"
          >
            <Plus size={14} className="rotate-45" />
          </button>
        )}
      </div>

      {/* 3. FILTER KATEGORI DIPERBARUI */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-4 hide-scrollbar">
        {DAFTAR_KATEGORI.map((kat) => (
          <button 
            key={kat}
            onClick={() => setFilterKategori(kat)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 ${filterKategori === kat ? 'bg-[#7c3aed] text-white shadow-md' : 'bg-[#fff1f2] text-[#7c3aed] border border-[#ffe4e6] hover:bg-[#ffe4e6]'}`}
          >
            {kat}
          </button>
        ))}
      </div>

      {/* 4. KARTU PRODUK VIOLET-ROSE */}
      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white rounded-xl border border-[#ffe4e6] p-4 animate-pulse flex flex-col gap-3">
               <div className="w-full aspect-square bg-[#fff1f2] rounded-lg"></div><div className="h-4 bg-[#eaddff] rounded w-3/4"></div>
            </div>
          ))
        ) : filteredProduk.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-[#ccc3d8]">
            <PackageOpen size={48} className="mb-3" />
            <p className="text-sm font-medium text-center px-4">
              {searchQuery ? `"${searchQuery}" tidak ditemukan.` : 'Kategori ini sedang kosong.'}
            </p>
          </div>
        ) : filteredProduk.map((produk) => (
          <div 
            key={produk.id} 
            onClick={() => setSelectedProduk(produk)}
            className="cursor-pointer bg-white rounded-2xl border border-[#ffe4e6] overflow-hidden shadow-[0_4px_20px_rgba(124,58,237,0.02)] flex flex-col hover:border-[#d2bbff] transition-colors group active:scale-[0.98]"
          >
            <div className="aspect-square relative bg-[#fff1f2] p-4 overflow-hidden">
              {produk.gambar_url ? (
                <img src={produk.gambar_url} alt={produk.nama_produk} className="w-full h-full object-cover drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#ccc3d8]"><PackageOpen size={32}/></div>
              )}
              {/* LABEL DIPERBARUI: Menampilkan Kategori */}
              <span className="absolute top-2 left-2 max-w-[90%] truncate bg-white/80 backdrop-blur-sm text-[#fb7185] text-[9px] font-bold px-2.5 py-1 rounded-full border border-[#ffe4e6] uppercase tracking-wider">
                {produk.kategori || 'Lainnya'}
              </span>
            </div>

            <div className="p-3.5 flex flex-col flex-grow bg-white z-10">
              <h3 className="text-sm font-bold text-[#1d1a24] line-clamp-2 mb-1">{produk.nama_produk}</h3>
              <div className="mt-auto flex flex-col gap-3 pt-2">
                <span className="text-lg font-black text-[#fb7185] leading-none">Rp {produk.harga.toLocaleString('id-ID')}</span>
                
                <button 
                  onClick={(e) => handleTambahCepat(e, produk)}
                  className="w-full bg-[#7c3aed] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-[#630ed4] transition-colors active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ShoppingCart size={16} /> Beli
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. MODAL DETAIL PRODUK LAYAR PENUH */}
      <AnimatePresence>
        {selectedProduk && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[120] bg-[#fef7ff] overflow-y-auto"
          >
            {/* Top App Bar Modal */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 py-4 w-full border-b border-[#ffe4e6]/50 shadow-[0_8px_30px_rgb(124,58,237,0.03)]">
              <button onClick={() => setSelectedProduk(null)} className="text-[#630ed4] hover:bg-[#fff1f2] transition-colors active:scale-95 p-2 rounded-full">
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-lg font-semibold tracking-tight text-[#1d1a24]">Detail Produk</h1>
              <button className="text-[#630ed4] hover:bg-[#fff1f2] transition-colors active:scale-95 p-2 rounded-full">
                <Heart size={24} />
              </button>
            </header>

            <main className="pb-32">
              {/* Hero Image Section */}
              <div className="relative w-full h-[350px] bg-[#f9f1ff] flex items-center justify-center p-8 overflow-hidden">
                {selectedProduk.gambar_url ? (
                  <img alt={selectedProduk.nama_produk} className="w-full h-full object-contain drop-shadow-2xl relative z-10" src={selectedProduk.gambar_url}/>
                ) : (
                  <PackageOpen size={100} className="text-[#ccc3d8] relative z-10"/>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#fef7ff] via-transparent to-transparent z-20"></div>
              </div>

              {/* Product Content */}
              <div className="px-6 -mt-8 relative z-30">
                <div className="bg-white p-6 rounded-t-[32px] shadow-[0_-10px_40px_rgba(124,58,237,0.05)] border-x border-t border-[#ffe4e6]/50">
                  
                  {/* Title & Price */}
                  <div className="flex flex-col gap-2 mb-6">
                    {/* INFO DIPERBARUI: Menampilkan Kategori Asli */}
                    <span className="text-[10px] font-extrabold text-[#630ed4] uppercase tracking-widest">
                      KATEGORI: {selectedProduk.kategori || 'Lainnya'}
                    </span>
                    <h2 className="text-3xl font-black text-[#1d1a24] leading-tight">{selectedProduk.nama_produk}</h2>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-[#630ed4]">Rp {selectedProduk.harga.toLocaleString('id-ID')}</span>
                      <span className="text-base text-[#7b7487] font-medium">/{selectedProduk.satuan}</span>
                    </div>
                  </div>

                  {/* Features Chips */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    <div className="bg-[#eddfe0] px-4 py-1.5 rounded-full flex items-center gap-1.5">
                      <CheckCircle size={16} className="text-[#6c6263]" />
                      <span className="text-[12px] font-bold text-[#6c6263]">Pilihan Terbaik</span>
                    </div>
                    <div className="bg-[#eddfe0] px-4 py-1.5 rounded-full flex items-center gap-1.5">
                      <Leaf size={16} className="text-[#6c6263]" />
                      <span className="text-[12px] font-bold text-[#6c6263]">Segar & Aman</span>
                    </div>
                    <div className="bg-[#eddfe0] px-4 py-1.5 rounded-full flex items-center gap-1.5">
                      <Clock size={16} className="text-[#6c6263]" />
                      <span className="text-[12px] font-bold text-[#6c6263]">Tersedia</span>
                    </div>
                  </div>

                  {/* Description Bento Grid Style */}
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    <div className="bg-[#f9f1ff] p-5 rounded-2xl border border-[#ffe4e6]/50">
                      <h3 className="text-sm font-bold text-[#1d1a24] mb-2">Deskripsi Produk</h3>
                      <p className="text-sm text-[#4a4455] leading-relaxed">
                        {selectedProduk.deskripsi || "Penuhi kebutuhan dapur Anda dengan produk berkualitas dari AlfaShop. Kondisi barang dijamin baik dan siap diantar langsung ke rumah Anda."}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between mb-4 bg-[#e8dfee] p-4 rounded-2xl">
                    <span className="text-sm font-bold text-[#1d1a24]">Jumlah Pembelian</span>
                    <div className="flex items-center gap-4 bg-white rounded-full p-1 border border-[#ccc3d8]">
                      <button onClick={() => setModalQty(Math.max(1, modalQty - 1))} className="w-10 h-10 rounded-full text-[#4a4455] flex items-center justify-center hover:bg-[#fff1f2] hover:text-[#ba1a1a] transition-colors">
                        <Minus size={20} />
                      </button>
                      <span className="text-base font-black w-4 text-center">{modalQty}</span>
                      <button onClick={() => setModalQty(modalQty + 1)} className="w-10 h-10 rounded-full bg-[#630ed4] text-white flex items-center justify-center shadow-lg shadow-[#630ed4]/20 active:scale-90 transition-transform">
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </main>

            {/* Bottom Action Bar Modal */}
            <div className="fixed bottom-0 left-0 w-full z-50 bg-white px-6 pb-8 pt-4 border-t border-[#ffe4e6]/50 shadow-[0_-10px_40px_rgba(124,58,237,0.05)]">
              <div className="flex gap-4 max-w-screen-xl mx-auto items-center">
                
                {/* TOMBOL TANYA */}
                <button 
                  onClick={() => {
                    if(!selectedProduk) return;
                    const pesan = `Halo Admin AlfaShop! 👋%0ASaya ingin bertanya tentang produk *${selectedProduk.nama_produk}* (Harga: Rp ${selectedProduk.harga.toLocaleString('id-ID')}).%0A%0AApakah stoknya masih ada?`;
                    window.open(`https://wa.me/6287728450708?text=${pesan}`, '_blank');
                  }}
                  className="flex flex-col items-center justify-center text-[#7b7487] px-4 py-2 hover:text-[#630ed4] transition-colors active:scale-95"
                >
                  <MessageCircle size={24} className="mb-1" />
                  <span className="text-[11px] font-bold">Tanya</span>
                </button>

                <button 
                  onClick={handleBeliDariModal}
                  className="flex-1 bg-[#630ed4] text-white font-bold text-sm py-4 rounded-2xl shadow-xl shadow-[#630ed4]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} /> Tambah ke Keranjang
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. LAYER ANIMASI TERBANG (Overlay) */}
      <AnimatePresence>
        {flyingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ left: item.x, top: item.y, opacity: 1, scale: 1 }}
            animate={{ left: "50%", top: "90vh", opacity: 0.2, scale: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.45, 0, 0.55, 1] }}
            className="fixed w-10 h-10 bg-[#fb7185] rounded-full z-[200] flex items-center justify-center pointer-events-none shadow-lg shadow-[#fb7185]/50 border-2 border-white"
          >
            <Plus size={20} className="text-white" />
          </motion.div>
        ))}
      </AnimatePresence>

    </div>
  );
}