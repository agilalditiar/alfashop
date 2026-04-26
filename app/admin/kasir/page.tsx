'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// IMPORT DIPERBAIKI: PackageOpen sudah ditambahkan di bawah ini
import { Search, ShoppingCart, Plus, Minus, Trash2, Receipt, CheckCircle2, User, Image as ImageIcon, PackageOpen } from 'lucide-react';

// Daftar Kategori (Sama dengan Manajemen Produk)
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
  const [namaPelanggan, setNamaPelanggan] = useState('Pelanggan Kasir');
  const [uangDibayar, setUangDibayar] = useState('');
  const [isCheckout, setIsCheckout] = useState(false);
  const [pesanSukses, setPesanSukses] = useState(false);

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    setIsLoading(true);
    // Hanya ambil produk yang tersedia/aktif
    const { data } = await supabase.from('produk').select('*').eq('tersedia', true).order('nama_produk', { ascending: true });
    setProdukList(data || []);
    setIsLoading(false);
  };

  // --- LOGIKA KERANJANG ---
  const handleAddToCart = (produk: any) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === produk.id);
      if (existing) {
        return prev.map(item => item.id === produk.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: produk.id, nama_produk: produk.nama_produk, harga: produk.harga, gambar_url: produk.gambar_url, quantity: 1 }];
    });
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
  };

  const totalBelanja = cart.reduce((total, item) => total + (item.harga * item.quantity), 0);
  const kembalian = parseInt(uangDibayar) - totalBelanja;

  // --- LOGIKA PEMBAYARAN ---
  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Keranjang masih kosong!');
    setIsCheckout(true);

    try {
      const pesananBaru = {
        nama_pelanggan: namaPelanggan || 'Pelanggan Kasir',
        whatsapp: '-', // Transaksi offline tidak perlu WA
        alamat: 'Pembelian Langsung di Warung',
        total_harga: totalBelanja,
        status: 'Selesai', // Langsung selesai karena dibayar di tempat
        item_pesanan: cart.map(item => ({
          name: item.nama_produk,
          price: item.harga,
          quantity: item.quantity
        }))
      };

      const { error } = await supabase.from('pesanan').insert([pesananBaru]);
      if (error) throw error;

      // Sukses
      setPesanSukses(true);
      setCart([]);
      setUangDibayar('');
      setNamaPelanggan('Pelanggan Kasir');
      
      // Hilangkan pesan sukses setelah 3 detik
      setTimeout(() => setPesanSukses(false), 3000);

    } catch (err: any) {
      alert(`Gagal memproses pembayaran: ${err.message}`);
    } finally {
      setIsCheckout(false);
    }
  };

  // Filter Etalase
  const filteredProduk = produkList.filter(p => {
    const matchSearch = p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori === 'Semua' ? true : p.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#fef7ff] font-sans text-[#1d1a24]">
      
      {/* ========================================== */}
      {/* BAGIAN KIRI: ETALASE PRODUK */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header POS */}
        <div className="bg-white p-6 border-b border-[#ffe4e6] flex flex-col gap-4 z-10 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-[#1d1a24] tracking-tight">Kasir AlfaShop</h2>
              <p className="text-xs font-medium text-[#7b7487] mt-1">Pilih barang untuk ditambahkan ke struk pesanan.</p>
            </div>
            <div className="relative w-72">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ccc3d8]" />
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama barang..." 
                className="w-full bg-[#fef7ff] border border-[#ffe4e6] rounded-full pl-11 pr-4 py-2.5 text-sm font-bold focus:border-[#630ed4] outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Filter Kategori Bulat-Bulat */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {DAFTAR_KATEGORI.map((kat) => (
              <button 
                key={kat} onClick={() => setFilterKategori(kat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${filterKategori === kat ? 'bg-[#630ed4] text-white shadow-md' : 'bg-[#fef7ff] text-[#7b7487] border border-[#ffe4e6] hover:text-[#630ed4] hover:bg-[#f3ebfa]'}`}
              >
                {kat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Produk */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fef7ff]/50">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center text-[#ccc3d8] font-bold animate-pulse">Memuat rak barang...</div>
          ) : filteredProduk.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#7b7487]">
              <PackageOpen size={48} className="text-[#ccc3d8] mb-3" />
              <p className="font-medium text-sm">Barang tidak ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
              {filteredProduk.map((produk) => (
                <div 
                  key={produk.id} 
                  onClick={() => handleAddToCart(produk)}
                  className="bg-white rounded-2xl border border-[#ffe4e6] overflow-hidden cursor-pointer hover:border-[#630ed4] hover:shadow-[0_8px_24px_rgba(124,58,237,0.08)] transition-all group flex flex-col active:scale-95"
                >
                  <div className="h-32 bg-[#f9f1ff] flex items-center justify-center overflow-hidden relative">
                    {produk.gambar_url ? (
                      <img src={produk.gambar_url} alt={produk.nama_produk} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <ImageIcon size={32} className="text-[#d2bbff]" />
                    )}
                    <div className="absolute inset-0 bg-[#630ed4]/0 group-hover:bg-[#630ed4]/10 transition-colors flex items-center justify-center">
                      <div className="bg-white text-[#630ed4] rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 shadow-lg">
                        <Plus size={20} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-[10px] font-black text-[#630ed4] uppercase tracking-wider mb-1 line-clamp-1">{produk.kategori || 'Lainnya'}</p>
                    <h4 className="text-sm font-black text-[#1d1a24] leading-tight mb-2 flex-1">{produk.nama_produk}</h4>
                    <div className="flex justify-between items-end mt-auto">
                      <p className="text-sm font-black text-[#1d1a24]">Rp {produk.harga.toLocaleString('id-ID')}</p>
                      <p className="text-[10px] font-bold text-[#7b7487] bg-[#fef7ff] px-1.5 py-0.5 rounded">/{produk.satuan}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* BAGIAN KANAN: STRUK PESANAN (KERANJANG) */}
      {/* ========================================== */}
      <div className="w-96 bg-white border-l border-[#ffe4e6] flex flex-col h-full shadow-[-4px_0_24px_rgba(124,58,237,0.03)] z-20">
        
        {/* Header Keranjang */}
        <div className="p-6 border-b border-[#ffe4e6] bg-[#fef7ff]/30">
          <h3 className="text-lg font-black text-[#1d1a24] flex items-center gap-2">
            <Receipt size={20} className="text-[#630ed4]"/> Struk Pembelian
          </h3>
          
          <div className="mt-4 relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b7487]" />
            <input 
              type="text" value={namaPelanggan} onChange={(e) => setNamaPelanggan(e.target.value)}
              placeholder="Nama Pelanggan (Opsional)"
              className="w-full bg-[#fef7ff] border border-[#ffe4e6] rounded-xl pl-9 pr-4 py-2 text-sm font-bold focus:border-[#630ed4] outline-none"
            />
          </div>
        </div>

        {/* Daftar Barang Belanjaan */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#fef7ff]/10">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#ccc3d8]">
              <ShoppingCart size={48} className="mb-4 opacity-50" />
              <p className="text-sm font-bold">Keranjang masih kosong</p>
              <p className="text-xs font-medium text-[#7b7487] mt-1 text-center">Klik produk di etalase untuk<br/>menambahkannya ke sini.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cart.map((item) => (
                <div key={item.id} className="bg-white border border-[#ffe4e6] rounded-xl p-3 flex gap-3 shadow-sm group">
                  <div className="w-12 h-12 rounded-lg bg-[#f9f1ff] overflow-hidden shrink-0">
                    {item.gambar_url ? <img src={item.gambar_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-3 text-[#d2bbff]"/>}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-black text-[#1d1a24] truncate leading-tight">{item.nama_produk}</h4>
                      <button onClick={() => removeFromCart(item.id)} className="text-[#ccc3d8] hover:text-[#ba1a1a] transition-colors"><Trash2 size={14}/></button>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-sm font-black text-[#630ed4]">Rp {(item.harga * item.quantity).toLocaleString('id-ID')}</p>
                      
                      {/* Kontrol Kuantitas */}
                      <div className="flex items-center bg-[#fef7ff] border border-[#ffe4e6] rounded-lg">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-[#7b7487] hover:text-[#630ed4]"><Minus size={14}/></button>
                        <span className="w-6 text-center text-xs font-black text-[#1d1a24]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-[#7b7487] hover:text-[#630ed4]"><Plus size={14}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel Checkout Terpadu */}
        <div className="bg-white border-t border-[#ffe4e6] p-6 shadow-[0_-4px_24px_rgba(124,58,237,0.03)]">
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-[#7b7487]">Total Belanja</span>
            <span className="text-2xl font-black text-[#1d1a24]">Rp {totalBelanja.toLocaleString('id-ID')}</span>
          </div>

          {/* Input Uang Dibayar */}
          <div className="mb-4">
            <label className="block text-[10px] font-black text-[#7b7487] uppercase tracking-widest mb-1.5">Uang Diterima (Rp)</label>
            <input 
              type="number" value={uangDibayar} onChange={(e) => setUangDibayar(e.target.value)}
              placeholder="0"
              className="w-full bg-[#fef7ff] border border-[#ffe4e6] rounded-xl px-4 py-3 text-lg font-black focus:border-[#630ed4] outline-none text-[#630ed4]"
            />
          </div>

          {/* Info Kembalian */}
          {uangDibayar && parseInt(uangDibayar) >= totalBelanja && (
            <div className="flex justify-between items-center mb-4 bg-[#ecfdf5] p-3 rounded-xl border border-[#a7f3d0]">
              <span className="text-xs font-black text-[#059669] uppercase tracking-wider">Kembalian</span>
              <span className="text-sm font-black text-[#059669]">Rp {kembalian.toLocaleString('id-ID')}</span>
            </div>
          )}

          {/* Alert Sukses Animasi */}
          {pesanSukses ? (
            <div className="w-full py-4 bg-[#059669] text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={20} /> Pembayaran Berhasil!
            </div>
          ) : (
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckout || (uangDibayar !== '' && parseInt(uangDibayar) < totalBelanja)}
              className="w-full py-4 bg-[#630ed4] text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:bg-[#732ee4] transition-all active:scale-95 disabled:opacity-50 disabled:bg-[#ccc3d8] disabled:active:scale-100 shadow-lg shadow-[#630ed4]/20"
            >
              {isCheckout ? 'Memproses...' : 'Selesaikan Pembayaran'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}