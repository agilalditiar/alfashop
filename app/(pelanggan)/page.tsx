'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, PackageOpen, Plus, Search, CheckCircle2, ArrowLeft, Heart, CheckCircle, Leaf, Clock, Minus, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleBeliDariModal = () => {
    if (!selectedProduk) return;
    
    // Karena posisi absolute/fixed berubah di modal, animasi terbang kita pusatkan dari tengah
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

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

  const filteredProduk = produkList.filter((p) => {
    const kategoriProduk = p.kategori || 'Lainnya';
    const matchKategori = filterKategori === 'Semua' ? true : kategoriProduk === filterKategori;
    const matchSearch = p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKategori && matchSearch;
  });

  return (
    <div className="px-5 pt-6 pb-28 relative">
      
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

      {/* 3. FILTER KATEGORI */}
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

      {/* 4. KARTU PRODUK */}
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

      {/* ========================================================= */}
      {/* 5. MODAL DETAIL PRODUK (SUDAH DIKUNCI & ANTI BOCOR!) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {selectedProduk && (
          // LAPIS LUAR: Layar gelap menutupi seluruh monitor dan memusatkan pop-up
          <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center sm:p-4">
            
            <motion.div 
              initial={{ opacity: 0, y: "100%" }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              // LAPIS DALAM: Dikunci seukuran HP (max-w-md), h-[100dvh] atau setinggi layar penuh
              className="w-full max-w-md h-[95dvh] sm:h-full bg-[#fef7ff] relative flex flex-col rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden"
            >
              
              {/* HEADER MODAL (Absolute di dalam HP) */}
              <header className="absolute top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 py-4 border-b border-[#ffe4e6]/50">
                <button onClick={() => setSelectedProduk(null)} className="text-[#630ed4] hover:bg-[#fff1f2] transition-colors active:scale-95 p-2 rounded-full bg-white shadow-sm border border-[#ffe4e6]">
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-sm font-black tracking-tight text-[#1d1a24] uppercase">Detail Produk</h1>
                <button className="text-[#fb7185] hover:bg-[#fff1f2] transition-colors active:scale-95 p-2 rounded-full bg-white shadow-sm border border-[#ffe4e6]">
                  <Heart size={20} />
                </button>
              </header>

              {/* AREA SCROLL KONTEN */}
              <main className="flex-1 overflow-y-auto pt-20 pb-28 hide-scrollbar">
                
                {/* Hero Image */}
                <div className="relative w-full aspect-square bg-white flex items-center justify-center p-8">
                  {selectedProduk.gambar_url ? (
                    <img alt={selectedProduk.nama_produk} className="w-full h-full object-contain drop-shadow-xl" src={selectedProduk.gambar_url}/>
                  ) : (
                    <PackageOpen size={80} className="text-[#ccc3d8]" />
                  )}
                </div>

                {/* Konten Text */}
                <div className="px-6 -mt-8 relative z-30">
                  <div className="bg-white p-6 rounded-[2rem] shadow-[0_-10px_40px_rgba(124,58,237,0.06)] border border-[#ffe4e6]">
                    
                    <span className="text-[10px] font-black text-[#630ed4] uppercase tracking-widest mb-3 block">
                      KATEGORI: {selectedProduk.kategori || 'Lainnya'}
                    </span>
                    
                    <h2 className="text-2xl font-black text-[#1d1a24] leading-snug mb-3">
                      {selectedProduk.nama_produk}
                    </h2>
                    
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-black text-[#630ed4]">Rp {selectedProduk.harga.toLocaleString('id-ID')}</span>
                      <span className="text-sm text-[#7b7487] font-bold">/{selectedProduk.satuan}</span>
                    </div>

                    {/* Chips */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <div className="bg-[#f3ebfa] text-[#630ed4] px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#eaddff]">
                        <CheckCircle size={14} /> <span className="text-xs font-bold">Pilihan Terbaik</span>
                      </div>
                      <div className="bg-[#ecfdf5] text-[#059669] px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#a7f3d0]">
                        <Leaf size={14} /> <span className="text-xs font-bold">Segar & Aman</span>
                      </div>
                    </div>

                    <div className="w-full h-px bg-[#ffe4e6] mb-6"></div>

                    {/* Jumlah Pembelian */}
                    <div className="flex items-center justify-between mb-6 bg-[#f9f1ff] p-4 rounded-2xl border border-[#ffe4e6]">
                      <span className="text-sm font-black text-[#1d1a24]">Jumlah Pembelian</span>
                      <div className="flex items-center gap-3 bg-white rounded-full p-1 border border-[#eaddff] shadow-sm">
                        <button onClick={() => setModalQty(Math.max(1, modalQty - 1))} className="w-8 h-8 rounded-full flex items-center justify-center text-[#7b7487] active:scale-90 transition-transform">
                          <Minus size={16} />
                        </button>
                        <span className="text-sm font-black w-4 text-center">{modalQty}</span>
                        <button onClick={() => setModalQty(modalQty + 1)} className="w-8 h-8 rounded-full bg-[#630ed4] text-white flex items-center justify-center active:scale-90 transition-transform shadow-md">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Deskripsi */}
                    <div>
                      <h3 className="text-sm font-black text-[#1d1a24] mb-2">Deskripsi Produk</h3>
                      <p className="text-sm text-[#7b7487] leading-relaxed text-justify">
                        {selectedProduk.deskripsi || "Penuhi kebutuhan dapur Anda dengan produk berkualitas dari AlfaShop. Kondisi barang dijamin baik dan siap diantar langsung ke rumah Anda."}
                      </p>
                    </div>

                  </div>
                </div>
              </main>

              {/* TOMBOL KERANJANG MODAL (Absolute di bawah kotak HP) */}
              <div className="absolute bottom-0 left-0 w-full bg-white px-6 pb-6 pt-4 border-t border-[#ffe4e6] z-50">
                <div className="flex gap-3 items-center">
                  <button 
                    onClick={() => {
                      const pesan = `Halo Admin AlfaShop! 👋%0ASaya ingin bertanya tentang produk *${selectedProduk.nama_produk}* (Harga: Rp ${selectedProduk.harga.toLocaleString('id-ID')}).%0A%0AApakah stoknya masih ada?`;
                      window.open(`https://wa.me/6287728450708?text=${pesan}`, '_blank');
                    }}
                    className="flex flex-col items-center justify-center text-[#7c3aed] bg-[#f9f1ff] border border-[#eaddff] rounded-2xl px-4 py-3 active:scale-95 transition-all"
                  >
                    <MessageCircle size={20} className="mb-1" />
                    <span className="text-[10px] font-black">Tanya</span>
                  </button>

                  <button 
                    onClick={handleBeliDariModal}
                    className="flex-1 bg-[#630ed4] text-white font-black text-sm py-4 rounded-2xl shadow-[0_8px_20px_rgba(99,14,212,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} /> Masukkan Keranjang
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. LAYER ANIMASI TERBANG */}
      <AnimatePresence>
        {flyingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ left: item.x, top: item.y, opacity: 1, scale: 1 }}
            animate={{ left: "50%", top: "90vh", opacity: 0.2, scale: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.45, 0, 0.55, 1] }}
            className="fixed w-10 h-10 bg-[#fb7185] rounded-full z-[9999] flex items-center justify-center pointer-events-none shadow-lg shadow-[#fb7185]/50 border-2 border-white"
          >
            <Plus size={20} className="text-white" />
          </motion.div>
        ))}
      </AnimatePresence>

    </div>
  );
}