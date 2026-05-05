'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; 
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cartStore';
import { 
  ShoppingCart, PackageOpen, Plus, Search, CheckCircle2, 
  ArrowLeft, Heart, CheckCircle, Leaf, Minus, MessageCircle, 
  AlertCircle, Home, History 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// KATEGORI SUDAH DISESUAIKAN DENGAN GAMBAR DROPDOWN DATABASE
const DAFTAR_KATEGORI = [
  'Semua', 'Beras & Sembako', 'Minuman', 'Makanan Ringan', 'Mie & Instan', 'Sabun & Deterjen', 'Bumbu Dapur', 'Lainnya'
];

export default function PelangganBeranda() {
  const [produkList, setProdukList] = useState<any[]>([]);
  const [isTokoBuka, setIsTokoBuka] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false); 
  
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProduk, setSelectedProduk] = useState<any>(null);
  const [modalQty, setModalQty] = useState(1);
  const [isLiked, setIsLiked] = useState(false); 
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [flyingItems, setFlyingItems] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.items) || [];
  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);

  // ==========================================
  // USE EFFECT: FETCH DATA & REAL-TIME SUPABASE
  // ==========================================
  useEffect(() => {
    setIsMounted(true);
    fetchData();

    // Sihir Real-time: Pantau saklar buka/tutup toko dari Admin
    const channelStatusToko = supabase
      .channel('pantau-toko')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pengaturan', filter: 'id=eq.1' },
        (payload) => {
          setIsTokoBuka(payload.new.is_open);
          if (!payload.new.is_open) {
             showToast("Toko baru saja ditutup oleh Admin 🛑");
          } else {
             showToast("Hore! Toko sudah buka kembali 🎉");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelStatusToko);
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [
      { data: produkData },
      { data: pengaturanData }
    ] = await Promise.all([
      supabase.from('produk').select('*').eq('tersedia', true),
      supabase.from('pengaturan').select('is_open').eq('id', 1).single()
    ]);

    setProdukList(produkData || []);
    if (pengaturanData) setIsTokoBuka(pengaturanData.is_open);
    setIsLoading(false);
  };

  useEffect(() => {
    if (selectedProduk) {
      setModalQty(1);
      setIsLiked(false);
    }
  }, [selectedProduk]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleTambahCepat = (e: React.MouseEvent, produk: any) => {
    e.stopPropagation();
    if (!isTokoBuka) {
      showToast("Maaf, toko sedang tutup 🙏");
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    addToCart({ ...produk, qty: 1 });
    if (navigator.vibrate) navigator.vibrate(50);

    const id = Date.now();
    setFlyingItems((prev) => [...prev, { id, x: startX, y: startY }]);
    setTimeout(() => setFlyingItems((prev) => prev.filter((item) => item.id !== id)), 800);

    showToast(`1x ${produk.nama_produk} ditambahkan`);
  };

  const handleBeliDariModal = () => {
    if (!selectedProduk) return;
    if (!isTokoBuka) {
      showToast("Maaf, toko sedang tutup 🙏");
      return;
    }

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    addToCart({ ...selectedProduk, qty: modalQty });
    if (navigator.vibrate) navigator.vibrate(50);

    const id = Date.now();
    setFlyingItems((prev) => [...prev, { id, x: startX, y: startY }]);
    setTimeout(() => setFlyingItems((prev) => prev.filter((item) => item.id !== id)), 800);

    showToast(`${modalQty}x ${selectedProduk.nama_produk} ditambahkan`);
    setSelectedProduk(null); 
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    showToast(!isLiked ? "Ditambahkan ke favorit ❤️" : "Dihapus dari favorit 🤍");
  };

  const filteredProduk = produkList.filter((p) => {
    const kategoriProduk = p.kategori || 'Lainnya';
    const matchKategori = filterKategori === 'Semua' ? true : kategoriProduk === filterKategori;
    const matchSearch = p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKategori && matchSearch;
  });

  return (
    <div className="bg-[#fef7ff] text-[#1d1a24] min-h-screen pb-24 font-sans relative flex flex-col w-full">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: -50, opacity: 0 }} animate={{ y: 16, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[999999] bg-[#1d1a24] text-white px-5 py-3 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl shadow-black/10 whitespace-nowrap"
          >
            <CheckCircle2 size={16} className={toastMessage.includes('tutup') ? "text-[#fb7185]" : "text-[#34d399]"} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-6 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1">
        
        {/* INDIKATOR TOKO */}
        {!isLoading && (
          <div className="flex justify-end mb-4">
            <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-full shadow-sm ${isTokoBuka ? 'bg-[#ecfdf5] border-[#d1fae5]' : 'bg-[#fff1f2] border-[#ffe4e6]'}`}>
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTokoBuka ? 'bg-[#34d399]' : 'bg-[#fb7185]'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isTokoBuka ? 'bg-[#10b981]' : 'bg-[#e11d48]'}`}></span>
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isTokoBuka ? 'text-[#059669]' : 'text-[#e11d48]'}`}>
                {isTokoBuka ? 'Toko Sedang Buka' : 'Toko Sedang Tutup'}
              </span>
            </div>
          </div>
        )}

        {/* Banner Peringatan Tutup */}
        {!isLoading && !isTokoBuka && (
          <div className="bg-[#fff1f2] border border-[#fb7185]/30 rounded-2xl p-4 mb-6 flex gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={24} className="text-[#e11d48] shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <h3 className="text-[#e11d48] text-sm font-black mb-1">Pemesanan Dimatikan</h3>
              <p className="text-[#be123c] text-xs font-medium leading-relaxed text-justify">
                Maaf, pemesanan online saat ini sedang ditutup oleh Admin. Anda tetap dapat melihat katalog produk kami.
              </p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#630ed4] rounded-[2rem] p-6 text-white shadow-[0_8px_30px_rgba(99,14,212,0.2)] mb-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#c4b5fd]/30 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <span className="inline-block bg-[#fff1f2] text-[#fb7185] text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 shadow-sm border border-[#ffe4e6]">PROMO SPESIAL</span>
            <h2 className="text-[22px] font-black leading-tight mb-2 tracking-tight text-white drop-shadow-md">Belanja Hemat <br/> Kebutuhan Dapur</h2>
          </div>
        </div>

        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ccc3d8]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari kebutuhan dapur..." className="w-full bg-white border border-[#ffe4e6] rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-[#1d1a24] shadow-[0_4px_20px_rgba(124,58,237,0.03)] focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent outline-none transition-all placeholder:text-[#ccc3d8]" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7b7487] bg-[#f3ebfa] p-1.5 rounded-full hover:text-[#ba1a1a] active:scale-90"><Plus size={14} className="rotate-45" /></button>
          )}
        </div>

        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 mb-4 hide-scrollbar">
          {DAFTAR_KATEGORI.map((kat) => (
            <button key={kat} onClick={() => setFilterKategori(kat)} className={`whitespace-nowrap px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[14px] font-bold transition-all active:scale-95 ${filterKategori === kat ? 'bg-[#7c3aed] text-white shadow-md' : 'bg-[#fff1f2] text-[#7c3aed] border border-[#ffe4e6] hover:bg-[#ffe4e6]'}`}>
              {kat}
            </button>
          ))}
        </div>

        {/* ========================================== */}
        {/* GRID SUDAH DIKUNCI 2 KOLOM (ANTI-GEPENG)   */}
        {/* ========================================== */}
        <div className="grid grid-cols-2 gap-4">
          {isLoading ? (
            [1, 2, 3, 4].map(n => <div key={n} className="bg-white rounded-xl border border-[#ffe4e6] p-4 animate-pulse"><div className="w-full aspect-square bg-[#fff1f2] rounded-lg mb-3"></div><div className="h-4 bg-[#eaddff] rounded w-3/4"></div></div>)
          ) : filteredProduk.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center text-[#ccc3d8]"><PackageOpen size={48} className="mb-3" /><p className="text-sm font-medium">Produk tidak ditemukan.</p></div>
          ) : filteredProduk.map((produk) => (
            <div key={produk.id} onClick={() => setSelectedProduk(produk)} className="cursor-pointer bg-[#ffffff] rounded-xl border border-[#ffe4e6] overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(124,58,237,0.02)] active:scale-[0.98] transition-transform">
              <div className="aspect-square relative bg-[#fff1f2] p-4">
                {produk.gambar_url ? <img src={produk.gambar_url} alt={produk.nama_produk} className="w-full h-full object-contain drop-shadow-md hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-[#ccc3d8]"><PackageOpen size={32}/></div>}
                <span className="absolute top-2 left-2 max-w-[90%] truncate bg-[#fff1f2] text-[#fb7185] text-[10px] sm:text-[12px] font-bold px-2 py-1 rounded-full border border-[#ffe4e6]">{produk.kategori || 'Lainnya'}</span>
              </div>
              <div className="p-3 flex flex-col flex-grow bg-white">
                <h3 className="text-[13px] sm:text-[14px] font-bold text-[#1d1a24] line-clamp-2 mb-1 leading-snug">{produk.nama_produk}</h3>
                <div className="mt-auto flex flex-col gap-2 pt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[16px] sm:text-[20px] font-black text-[#fb7185]">Rp {produk.harga.toLocaleString('id-ID')}</span>
                    <span className="text-[10px] sm:text-[12px] font-medium text-[#7b7487]">/{produk.satuan}</span>
                  </div>
                  
                  <button 
                    onClick={(e) => handleTambahCepat(e, produk)} 
                    disabled={!isTokoBuka}
                    className={`w-full text-white text-[12px] sm:text-[14px] font-bold py-2 rounded-lg active:scale-95 flex items-center justify-center gap-1.5 transition-colors ${isTokoBuka ? 'bg-[#7c3aed] hover:bg-[#8b5cf6]' : 'bg-[#ccc3d8] cursor-not-allowed opacity-70'}`}
                  >
                    <ShoppingCart size={16} className="shrink-0" /> <span className="truncate">{isTokoBuka ? 'Keranjang' : 'Tutup'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* BOTTOM NAV BAR (Menu Bawah - Mobile Only) */}
      <nav className="md:hidden bg-white/90 backdrop-blur-lg border-t border-[#ffe4e6] font-sans text-[11px] font-semibold fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-safe h-20 z-40 shadow-[0_-4px_20px_rgba(124,58,237,0.05)] rounded-t-2xl">
        <a className="flex flex-col items-center justify-center bg-[#fff1f2] text-[#7c3aed] rounded-xl px-4 py-1.5 active:scale-95 transition-all" href="#">
          <Home size={22} className="mb-1 fill-current" />
          Beranda
        </a>
        <a className="flex flex-col items-center justify-center text-[#71717a] hover:text-[#7c3aed] px-4 py-1.5 active:scale-95 transition-all relative" href="/keranjang">
          <div className="relative">
            <ShoppingCart size={22} className="mb-1" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#fb7185] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </div>
          Keranjang
        </a>
        <a className="flex flex-col items-center justify-center text-[#71717a] hover:text-[#7c3aed] px-4 py-1.5 active:scale-95 transition-all" href="#">
          <History size={22} className="mb-1" />
          Riwayat
        </a>
      </nav>

      {/* MODAL BOTTOM SHEET DETAIL PRODUK */}
      {isMounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedProduk && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center sm:p-4 font-sans"
            >
              <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-md h-[95dvh] sm:h-[90vh] bg-[#fef7ff] relative flex flex-col rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden"
              >
                
                <header className="absolute top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 py-4 border-b border-[#ffe4e6]/50">
                  <button onClick={() => setSelectedProduk(null)} className="text-[#7c3aed] active:scale-95 p-2 rounded-full bg-white shadow-sm border border-[#ffe4e6]"><ArrowLeft size={20} /></button>
                  <h1 className="text-sm font-black tracking-tight text-[#1d1a24] uppercase">Detail Produk</h1>
                  <button onClick={handleToggleLike} className="text-[#fb7185] active:scale-90 transition-transform p-2 rounded-full bg-white shadow-sm border border-[#ffe4e6]">
                    <Heart size={20} className={isLiked ? "fill-current" : ""} />
                  </button>
                </header>

                <main className="flex-1 overflow-y-auto pt-20 pb-28 hide-scrollbar">
                  <div className="relative w-full aspect-square bg-[#fff1f2] flex items-center justify-center p-8">
                    {selectedProduk.gambar_url ? <img alt={selectedProduk.nama_produk} className="w-full h-full object-contain drop-shadow-xl" src={selectedProduk.gambar_url}/> : <PackageOpen size={80} className="text-[#ccc3d8]" />}
                  </div>

                  <div className="px-6 -mt-8 relative z-30">
                    <div className="bg-white p-6 rounded-[2rem] shadow-[0_-10px_40px_rgba(124,58,237,0.06)] border border-[#ffe4e6]">
                      <span className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest mb-3 block">KATEGORI: {selectedProduk.kategori || 'Lainnya'}</span>
                      <h2 className="text-2xl font-black text-[#1d1a24] leading-snug mb-3">{selectedProduk.nama_produk}</h2>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-3xl font-black text-[#fb7185]">Rp {selectedProduk.harga.toLocaleString('id-ID')}</span>
                        <span className="text-sm text-[#7b7487] font-bold">/{selectedProduk.satuan}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        <div className="bg-[#f3ebfa] text-[#7c3aed] px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#eaddff]"><CheckCircle size={14} /> <span className="text-xs font-bold">Pilihan Terbaik</span></div>
                        <div className="bg-[#ecfdf5] text-[#059669] px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#a7f3d0]"><Leaf size={14} /> <span className="text-xs font-bold">Segar & Aman</span></div>
                      </div>

                      <div className="w-full h-px bg-[#ffe4e6] mb-6"></div>

                      <div className="flex items-center justify-between mb-6 bg-[#fff1f2] p-4 rounded-2xl border border-[#ffe4e6]">
                        <span className="text-sm font-black text-[#1d1a24]">Jumlah Beli</span>
                        
                        <div className={`flex items-center gap-3 rounded-full p-1 border shadow-sm transition-colors ${isTokoBuka ? 'bg-white border-[#ffe4e6]' : 'bg-[#e8dfee] border-[#ccc3d8] opacity-70'}`}>
                          <button disabled={!isTokoBuka} onClick={() => setModalQty(Math.max(1, modalQty - 1))} className="w-8 h-8 flex items-center justify-center text-[#7b7487] active:scale-90"><Minus size={16} /></button>
                          <span className="text-sm font-black w-4 text-center">{modalQty}</span>
                          <button disabled={!isTokoBuka} onClick={() => setModalQty(modalQty + 1)} className={`w-8 h-8 rounded-full text-white flex items-center justify-center active:scale-90 shadow-md ${isTokoBuka ? 'bg-[#7c3aed]' : 'bg-[#ccc3d8]'}`}><Plus size={16} /></button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-[#1d1a24] mb-2">Deskripsi Produk</h3>
                        <p className="text-sm text-[#7b7487] leading-relaxed text-justify">{selectedProduk.deskripsi || "Kondisi barang dijamin baik dan siap diantar langsung ke rumah Anda."}</p>
                      </div>
                    </div>
                  </div>
                </main>

                <div className="absolute bottom-0 left-0 w-full bg-white px-6 pb-6 pt-4 border-t border-[#ffe4e6] z-50">
                  <div className="flex gap-3 items-center">
                    <button onClick={() => window.open(`https://wa.me/6287728450708?text=Halo Admin! Saya mau tanya soal *${selectedProduk.nama_produk}*.`, '_blank')} className="flex flex-col items-center text-[#7c3aed] bg-[#f9f1ff] border border-[#eaddff] rounded-2xl px-4 py-3 active:scale-95"><MessageCircle size={20} className="mb-1" /><span className="text-[10px] font-black">Tanya</span></button>
                    
                    <button 
                      onClick={handleBeliDariModal} 
                      disabled={!isTokoBuka}
                      className={`flex-1 text-white font-black text-sm py-4 rounded-2xl flex justify-center gap-2 transition-all ${isTokoBuka ? 'bg-[#7c3aed] shadow-[0_8px_20px_rgba(99,14,212,0.25)] active:scale-[0.98]' : 'bg-[#ccc3d8] cursor-not-allowed opacity-70 shadow-none'}`}
                    >
                      <ShoppingCart size={20} className="shrink-0" /> <span className="truncate">{isTokoBuka ? 'Masukkan Keranjang' : 'Toko Tutup'}</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body 
      )}

      {/* ANIMASI TERBANG */}
      <AnimatePresence>
        {flyingItems.map((item) => (
          <motion.div key={item.id} initial={{ left: item.x, top: item.y, opacity: 1, scale: 1 }} animate={{ left: "50%", top: "90vh", opacity: 0.2, scale: 0.3 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="fixed w-10 h-10 bg-[#fb7185] rounded-full z-[999999] flex justify-center items-center pointer-events-none shadow-lg border-2 border-white"><Plus size={20} className="text-white" /></motion.div>
        ))}
      </AnimatePresence>

    </div>
  );
}