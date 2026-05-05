'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, QrCode, Plus, Minus, Trash2, PackageOpen, ChevronLeft, MoreHorizontal, Banknote, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Daftar Kategori
const DAFTAR_KATEGORI = ['Semua', 'Beras & Sembako', 'Minuman', 'Makanan Ringan', 'Mie & Instan', 'Sabun & Deterjen', 'Bumbu Dapur', 'Lainnya'];

interface CartItem {
  id: number;
  nama_produk: string;
  harga: number;
  gambar_url: string;
  quantity: number;
}

export default function KasirPOSPage() {
  const [produkList, setProdukList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Kasir
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [uangDibayar, setUangDibayar] = useState<number | ''>('');
  const [isCheckout, setIsCheckout] = useState(false);
  const [pesanSukses, setPesanSukses] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('produk').select('*').eq('tersedia', true).order('nama_produk', { ascending: true });
    setProdukList(data || []);
    setIsLoading(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // --- LOGIKA KERANJANG ---
  const handleAddToCart = (produk: any) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === produk.id);
      if (existing) return prev.map(item => item.id === produk.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { id: produk.id, nama_produk: produk.nama_produk, harga: produk.harga, gambar_url: produk.gambar_url, quantity: 1 }];
    });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter(item => item.id !== id));
    showToast("Barang dihapus dari pesanan");
  };

  const totalBelanja = cart.reduce((total, item) => total + (item.harga * item.quantity), 0);
  const kembalian = typeof uangDibayar === 'number' ? uangDibayar - totalBelanja : 0;

  // --- LOGIKA SCAN BARCODE (HARDWARE SCANNER SIMULATION) ---
  const handleScanClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      showToast("Siap memindai! Arahkan scanner ke barcode...");
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Alat scanner barcode otomatis menekan "Enter" setelah membaca kode
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      // Cari produk yang namanya persis sama (di dunia nyata ini dicocokkan dengan kolom barcode)
      const matchedProduct = produkList.find(p => p.nama_produk.toLowerCase() === searchQuery.toLowerCase().trim());
      
      if (matchedProduct) {
        handleAddToCart(matchedProduct);
        setSearchQuery(''); // Bersihkan kolom search otomatis setelah discan
        showToast(`✔ 1x ${matchedProduct.nama_produk} ditambahkan`);
      } else {
        showToast(`❌ Produk tidak ditemukan!`);
      }
    }
  };

  // --- LOGIKA PEMBAYARAN ---
  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Keranjang masih kosong!');
    if (typeof uangDibayar !== 'number' || uangDibayar < totalBelanja) {
      showToast('⚠️ Uang pembayaran kurang!');
      return;
    }
    setIsCheckout(true);

    try {
      const { error } = await supabase.from('pesanan').insert([{
        nama_pelanggan: 'Pelanggan Kasir',
        whatsapp: '-',
        alamat: 'Pembelian Langsung di Warung',
        total_harga: totalBelanja,
        status: 'Selesai',
        item_pesanan: cart.map(item => ({ name: item.nama_produk, price: item.harga, quantity: item.quantity }))
      }]);
      if (error) throw error;

      setPesanSukses(true);
      setCart([]);
      setUangDibayar('');
      setTimeout(() => setPesanSukses(false), 3000);
    } catch (err: any) {
      alert(`Gagal memproses pembayaran: ${err.message}`);
    } finally {
      setIsCheckout(false);
    }
  };

  // Filter Produk
  const filteredProduk = produkList.filter(p => {
    const matchSearch = p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori === 'Semua' ? true : p.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  return (
    <div className="flex h-screen bg-[#f9f1ff] font-sans text-[#1d1a24] overflow-hidden relative">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: -50, opacity: 0 }} animate={{ y: 16, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[999999] bg-[#1d1a24] text-white px-5 py-3 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl shadow-black/10 whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow flex flex-col h-full w-full">
        
        {/* TopAppBar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#e8dfee] flex items-center justify-between px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-[#f3ebfa] text-[#630ed4] rounded-full hover:bg-[#eaddff] transition-colors">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="font-bold text-xl text-[#1d1a24] tracking-tight">Lumina POS</h1>
              <p className="text-xs text-[#4a4455]">AlfaShop Offline Store</p>
            </div>
          </div>

          <div className="relative w-[400px]">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4455]" />
            <input 
              ref={searchInputRef}
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search atau Scan Barcode (Tekan Enter)..." 
              className="w-full pl-12 pr-4 py-3 bg-[#eddfe0]/30 border-2 border-transparent focus:border-[#7c3aed] rounded-full text-[#1d1a24] text-sm placeholder-[#4a4455]/50 transition-all outline-none" 
            />
          </div>

          <div className="flex items-center gap-4">
            {/* TOMBOL SCAN BARCODE SUDAH AKTIF */}
            <button onClick={handleScanClick} className="p-2 rounded-full hover:bg-[#eaddff] hover:text-[#630ed4] text-[#4a4455] transition-colors" title="Mode Scan Barcode">
              <QrCode size={24} />
            </button>
            <div className="h-10 w-10 rounded-full bg-[#7c3aed] text-[#ede0ff] flex items-center justify-center font-bold text-sm shadow-sm shadow-[#630ed4]/10">
              AD
            </div>
          </div>
        </header>

        {/* Split Layout */}
        <div className="flex-grow flex overflow-hidden p-6 gap-6">
          
          {/* ======================================= */}
          {/* LEFT: Quick Tap Products                */}
          {/* ======================================= */}
          <section className="flex-grow flex flex-col bg-[#ffffff] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#e8dfee] overflow-hidden">
            
            {/* Categories */}
            <div className="p-4 border-b border-[#e8dfee] flex items-center justify-between bg-white/50 backdrop-blur-sm z-10 sticky top-0">
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {DAFTAR_KATEGORI.map((kat) => (
                  <button 
                    key={kat} onClick={() => setFilterKategori(kat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${filterKategori === kat ? 'bg-[#7c3aed] text-[#ede0ff] border-transparent shadow-sm' : 'bg-[#fef7ff] text-[#1d1a24] border-[#ccc3d8] hover:bg-[#e8dfee]'}`}
                  >
                    {kat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="p-4 overflow-y-auto flex-grow content-start">
              {isLoading ? (
                 <div className="flex justify-center items-center h-full text-[#4a4455] font-bold animate-pulse">Memuat Produk...</div>
              ) : (
                <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProduk.map((produk) => (
                    <button 
                      key={produk.id} onClick={() => handleAddToCart(produk)}
                      className="group flex flex-col items-center justify-center p-4 h-36 rounded-lg bg-[#fef7ff] border border-[#e8dfee] hover:border-[#7c3aed] hover:shadow-md hover:shadow-[#630ed4]/5 transition-all text-center active:scale-95"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#eddfe0] flex items-center justify-center mb-3 group-hover:bg-[#eaddff] transition-colors overflow-hidden shrink-0">
                        {produk.gambar_url ? (
                           <img src={produk.gambar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                           <PackageOpen size={24} className="text-[#655c5d] group-hover:text-[#630ed4] transition-colors" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-[#1d1a24] line-clamp-2 leading-tight">{produk.nama_produk}</span>
                      <span className="text-xs font-bold text-[#630ed4] mt-1">Rp {produk.harga.toLocaleString('id-ID')}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ======================================= */}
          {/* RIGHT: Current Transaction (Cart)       */}
          {/* ======================================= */}
          <section className="w-[420px] flex-shrink-0 flex flex-col bg-[#ffffff] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#e8dfee] overflow-hidden">
            
            <div className="p-4 border-b border-[#e8dfee] bg-[#ffffff] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1d1a24]">Current Order</h2>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6] px-2 py-1 rounded-md transition-colors">Clear All</button>
                )}
                <span className="text-xs font-semibold text-[#4a4455] bg-[#e8dfee] px-3 py-1 rounded-full">KASIR</span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3">
              {cart.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-[#ccc3d8]">
                   <PackageOpen size={48} className="mb-2 opacity-50"/>
                   <span className="text-sm">Keranjang kosong</span>
                 </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start pb-3 border-b border-[#e8dfee]/50 last:border-0 last:pb-0">
                    <div className="flex-grow pr-4">
                      <h3 className="text-sm font-semibold text-[#1d1a24] line-clamp-1">{item.nama_produk}</h3>
                      <p className="text-xs text-[#4a4455] mt-1">{item.quantity} x Rp {item.harga.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-sm font-semibold text-[#1d1a24]">Rp {(item.harga * item.quantity).toLocaleString('id-ID')}</span>
                      
                      {/* TOMBOL PLUS, MINUS, & HAPUS SUDAH AKTIF */}
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-2 bg-[#f3ebfa] rounded-md p-1 border border-[#eaddff]">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-[#1d1a24] hover:text-[#ba1a1a] transition-colors shadow-sm"><Minus size={14} /></button>
                          <span className="text-sm font-semibold text-[#1d1a24] w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-md bg-[#7c3aed] flex items-center justify-center text-white hover:bg-[#630ed4] transition-colors shadow-sm"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-[#ba1a1a] hover:bg-[#ffdad6] rounded-md transition-colors ml-1" title="Hapus barang">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals & Actions (Kalkulator) */}
            <div className="p-4 bg-[#ffffff] border-t border-[#e8dfee] shadow-[0_-4px_20px_rgb(0,0,0,0.02)]">
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#4a4455]">Subtotal</span>
                <span className="text-sm text-[#1d1a24] font-semibold">Rp {totalBelanja.toLocaleString('id-ID')}</span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-[#1d1a24] w-1/2">Uang Diterima</span>
                <div className="w-1/2 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#7b7487]">Rp</span>
                  <input 
                    type="number" value={uangDibayar} onChange={(e) => setUangDibayar(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="w-full bg-[#f9f1ff] border-2 border-[#eaddff] rounded-lg pl-9 pr-3 py-2 text-right text-sm font-black text-[#630ed4] focus:outline-none focus:border-[#7c3aed] transition-colors placeholder:font-medium"
                  />
                </div>
              </div>

              <div className="border-t border-[#eaddff] border-dashed pt-4 mb-5 flex justify-between items-end">
                <span className="text-xl font-bold text-[#4a4455]">{kembalian >= 0 && uangDibayar !== '' ? 'Kembalian' : 'Total Bayar'}</span>
                <span className={`text-3xl font-black tracking-tight ${kembalian >= 0 && uangDibayar !== '' ? 'text-[#059669]' : 'text-[#630ed4]'}`}>
                  Rp {kembalian >= 0 && uangDibayar !== '' ? kembalian.toLocaleString('id-ID') : totalBelanja.toLocaleString('id-ID')}
                </span>
              </div>

              {/* TOMBOL UANG PAS (MEMANJANG FULL) */}
              <div className="mb-3">
                <button onClick={() => setUangDibayar(totalBelanja)} className="w-full py-3 px-4 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] text-sm font-bold hover:bg-[#d1fae5] transition-colors flex items-center justify-center gap-2 active:scale-95">
                  <CheckCircle2 size={18} /> Uang Pas
                </button>
              </div>
              
              {pesanSukses ? (
                <div className="w-full py-4 rounded-xl bg-[#059669] text-white text-lg font-black flex items-center justify-center gap-3 animate-in fade-in zoom-in shadow-lg shadow-[#059669]/20">
                  <CheckCircle2 size={24} /> Transaksi Sukses!
                </div>
              ) : (
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isCheckout || (typeof uangDibayar === 'number' && uangDibayar < totalBelanja)}
                  className="w-full py-4 rounded-xl bg-[#630ed4] text-[#ffffff] text-lg font-black hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-[#630ed4]/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-[#ccc3d8] disabled:active:scale-100 disabled:hover:shadow-none"
                >
                  {isCheckout ? 'Memproses...' : <><Banknote size={24} /> Bayar Tunai</>}
                </button>
              )}

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}