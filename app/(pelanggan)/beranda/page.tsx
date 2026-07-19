'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingBag, PackageOpen, X, CheckCircle2, ShoppingCart, Store, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPelanggan() {
  const router = useRouter();
  const [produk, setProduk] = useState<any[]>([]);
  const [produkFilter, setProdukFilter] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isTokoBuka, setIsTokoBuka] = useState(true);
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerIdx, setBannerIdx] = useState(0);

  const [kategoriAktif, setKategoriAktif] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [popupItem, setPopupItem] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<{teks: string, tipe: 'sukses' | 'error' | ''}>({teks: '', tipe: ''});

  const daftarKategori = ['Semua', 'Beras & Sembako', 'Minuman', 'Makanan Ringan', 'Mie & Instan', 'Sabun & Deterjen', 'Bumbu Dapur', 'Lainnya'];

  useEffect(() => {
    const userLoggedIn = localStorage.getItem('user');
    if (!userLoggedIn) {
      router.replace('/login');
      return; 
    }

    const loadData = async () => {
      try {
        const [resProduk, resPengaturan, resBanner] = await Promise.all([
          fetch('/api/produk'),
          fetch('/api/pengaturan'),
          fetch('/api/banner'),
        ]);

        const dataProduk = await resProduk.json();
        const dataPengaturan = await resPengaturan.json();
        const dataBanner = await resBanner.json();

        setProduk(dataProduk);
        setProdukFilter(dataProduk);
        setIsTokoBuka(dataPengaturan.isOpen);
        setBanners(Array.isArray(dataBanner) ? dataBanner : []);

        // Simpan ongkir ke localStorage agar bisa dibaca halaman checkout
        if (dataPengaturan.ongkir !== undefined) {
          localStorage.setItem('ongkir', String(dataPengaturan.ongkir || 0));
        }
      } catch (err) {
        console.error("Gagal load data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  useEffect(() => {
    let hasil = produk;
    if (kategoriAktif !== 'Semua') {
      hasil = hasil.filter(p => p.kategori?.toLowerCase() === kategoriAktif.toLowerCase());
    }
    if (searchQuery) {
      hasil = hasil.filter(p => p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    // Tampilkan produk yang 'tersedia' == true (toggle admin)
    setProdukFilter(hasil.filter(p => p.tersedia !== false && p.tersedia !== 0));
  }, [kategoriAktif, searchQuery, produk]);

  // Auto-rotate banner setiap 4 detik
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // 🔥 UPDATE: Logika Tambah ke Keranjang dengan Validasi Stok
  const tambahKeKeranjang = (langsungBeli = false) => {
    if (!popupItem || !isTokoBuka || popupItem.stok <= 0) return; 

    const keranjangLama = JSON.parse(localStorage.getItem('keranjang') || '[]');
    const indexBarang = keranjangLama.findIndex((item: any) => item.id === popupItem.id);
    
    if (indexBarang !== -1) {
      // Cek apakah jumlah di keranjang sudah melebihi batas stok
      if (keranjangLama[indexBarang].qty >= popupItem.stok) {
        setToastMessage({ teks: `Maaf, stok ${popupItem.nama_produk} hanya tersisa ${popupItem.stok}!`, tipe: 'error' });
        setTimeout(() => setToastMessage({teks: '', tipe: ''}), 3000);
        return;
      }
      keranjangLama[indexBarang].qty += 1;
    } else {
      keranjangLama.push({ ...popupItem, qty: 1 });
    }
    
    localStorage.setItem('keranjang', JSON.stringify(keranjangLama));
    window.dispatchEvent(new Event('storage'));
    
    setPopupItem(null); 
    
    if (langsungBeli) {
      router.push('/checkout');
    } else {
      setToastMessage({ teks: `${popupItem.nama_produk} berhasil masuk keranjang!`, tipe: 'sukses' });
      setTimeout(() => setToastMessage({teks: '', tipe: ''}), 3000);
    }
  };

  if (isLoading) return <div className="p-20 text-center font-bold text-[#500088] animate-pulse flex flex-col items-center justify-center min-h-screen">Memuat Katalog Alfashop...</div>;

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">

      {/* --- TOAST NOTIFICATION (Bisa Error / Sukses) --- */}
      {toastMessage.teks && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-5 w-[90%] max-w-[380px] ${toastMessage.tipe === 'sukses' ? 'bg-[#166534]' : 'bg-[#ba1a1a]'}`}>
          {toastMessage.tipe === 'sukses' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
          <span className="text-[13px] font-bold line-clamp-2">{toastMessage.teks}</span>
        </div>
      )}

      {/* --- PENGUMUMAN TOKO TUTUP --- */}
      {!isTokoBuka && (
        <div className="bg-[#fff1f2] border border-[#fecaca] text-[#ba1a1a] p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2">
          <Store size={24} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[14px] font-black">Mohon Maaf, Toko Sedang Tutup 🙏</h3>
            <p className="text-[12px] font-medium mt-1">Anda masih bisa melihat katalog, namun fitur pemesanan sedang dinonaktifkan sementara oleh Admin.</p>
          </div>
        </div>
      )}

      {/* --- SEARCH BAR --- */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-[#cfc2d4]" size={20} />
        </div>
        <input
          type="text"
          placeholder="Cari produk AlfaShop..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#cfc2d4] rounded-[16px] pl-10 pr-4 py-3 text-[14px] text-[#191c1d] placeholder:text-[#7e7383] focus:outline-none focus:border-[#500088] focus:ring-1 focus:ring-[#500088] shadow-sm transition-all"
        />
      </div>

      {/* --- BANNER PROMO DINAMIS DARI DATABASE --- */}
      {banners.length > 0 ? (
        <div className="w-full h-36 rounded-xl overflow-hidden relative shadow-sm">
          {/* Slides */}
          {banners.map((b, i) => (
            <div
              key={b.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === bannerIdx ? 1 : 0 }}
            >
              <img
                src={b.gambar_url}
                alt={b.judul || 'Banner Promo'}
                className="w-full h-full object-cover"
              />
              {b.judul && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-5">
                  <h2 className="text-lg font-bold text-white leading-tight">{b.judul}</h2>
                </div>
              )}
            </div>
          ))}
          {/* Dot indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBannerIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === bannerIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Fallback banner statis jika belum ada banner di database
        <div className="w-full h-36 rounded-xl overflow-hidden relative shadow-sm">
          <img alt="Promo Banner" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#500088]/90 to-transparent flex flex-col justify-center p-5">
            <span className="text-[10px] font-bold text-white bg-[#b4136d]/90 px-2 py-1 rounded-sm w-max mb-1 tracking-wider">PROMO SPESIAL</span>
            <h2 className="text-xl font-bold text-white">Diskon s/d 50%</h2>
            <p className="text-sm text-[#dfb7ff]">Untuk Produk Pilihan</p>
          </div>
        </div>
      )}

      {/* --- CATEGORY CHIPS --- */}
      <div className="w-full overflow-x-auto hide-scrollbar -mx-4 px-4 py-1">
        <div className="flex gap-2 w-max">
          {daftarKategori.map((kat) => (
            <button
              key={kat}
              onClick={() => setKategoriAktif(kat)}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all shadow-sm border ${kategoriAktif === kat
                ? 'bg-[#500088] text-white border-[#500088]'
                : 'bg-[#f3f4f5] text-[#4c4452] hover:bg-[#e1e3e4] border-[#cfc2d4]'
                }`}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[16px] font-bold text-[#191c1d]">Katalog Tersedia</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {produkFilter.length === 0 ? (
            <div className="col-span-2 text-center text-gray-400 py-10 flex flex-col items-center">
              <PackageOpen size={48} className="mb-2 opacity-20 text-[#500088]" />
              <p className="text-sm font-bold">Produk tidak ditemukan</p>
            </div>
          ) : (
            produkFilter.map((item) => (
              <div key={item.id} onClick={() => setPopupItem(item)} className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col border border-[#e1e3e4] active:scale-[0.98] transition-transform cursor-pointer group">
                <div className="w-full aspect-square relative bg-[#f3f4f5] flex items-center justify-center p-2 overflow-hidden">
                  {item.gambar_url ? (
                    <img alt={item.nama_produk} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" src={item.gambar_url} />
                  ) : (
                    <ShoppingBag size={40} className="text-[#cfc2d4]" />
                  )}
                  {/* Overlay jika toko tutup atau stok 0 */}
                  {(!isTokoBuka || item.stok <= 0) && <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>}
                </div>
                <div className="p-3 flex flex-col flex-grow justify-between gap-3">
                  <div>
                    <h4 className={`text-[13px] font-semibold line-clamp-2 leading-tight ${isTokoBuka && item.stok > 0 ? 'text-[#191c1d]' : 'text-[#7e7383]'}`}>{item.nama_produk}</h4>
                    
                    {/* 🔥 UPDATE: LABEL STOK DI GRID */}
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      {item.is_promo && (
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">PROMO</span>
                      )}
                      {item.stok > 0 ? (
                        <span className="text-[10px] font-bold text-[#059669] bg-[#ecfdf5] px-2 py-0.5 rounded border border-[#a7f3d0]">Sisa {item.stok}</span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#ba1a1a] bg-[#fff1f2] px-2 py-0.5 rounded border border-[#fecaca]">Stok Habis</span>
                      )}
                    </div>
                  </div>

                  <div>
                    {item.is_promo && (
                      <div className="text-[11px] text-gray-400 line-through mb-0.5 leading-none">Rp {item.harga_asli?.toLocaleString('id-ID')}</div>
                    )}
                    <div className={`text-[15px] font-black mb-2 ${isTokoBuka && item.stok > 0 ? 'text-[#b4136d]' : 'text-[#7e7383]'}`}>Rp {item.harga.toLocaleString('id-ID')}</div>
                    <button 
                      className={`w-full py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1 pointer-events-none transition-colors ${isTokoBuka && item.stok > 0 ? 'bg-[#f1dbff] text-[#500088]' : 'bg-[#f3f4f5] text-[#cfc2d4]'}`}
                    >
                      <ShoppingCart size={14} /> Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL POPUP (BOTTOM SHEET) --- */}
      {popupItem && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]" onClick={() => setPopupItem(null)}></div>
          <div className="fixed bottom-0 left-0 right-0 z-[110] bg-white rounded-t-[24px] shadow-2xl max-w-[428px] mx-auto animate-in slide-in-from-bottom duration-300 pb-safe">
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-[#cfc2d4]/50 rounded-full"></div>
            </div>
            <div className="px-4 pb-6 pt-2 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h2 className="text-[18px] font-bold text-[#191c1d] mt-1">Detail Produk</h2>
                <button onClick={() => setPopupItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e7e8e9] text-[#191c1d]"><X size={20} /></button>
              </div>
              
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-[#f8f9fa] border border-[#cfc2d4]/30 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                  {popupItem.gambar_url ? <img src={popupItem.gambar_url} className="w-full h-full object-cover" /> : <PackageOpen className="text-[#cfc2d4]" size={32} />}
                  {popupItem.stok <= 0 && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>}
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold text-[#191c1d] leading-tight">{popupItem.nama_produk}</h3>
                  {popupItem.is_promo && (
                    <p className="text-[13px] text-gray-400 line-through mt-1">Rp {popupItem.harga_asli?.toLocaleString('id-ID')}</p>
                  )}
                  <p className="text-[20px] font-black text-[#b4136d] mt-0.5">Rp {popupItem.harga.toLocaleString('id-ID')}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {popupItem.is_promo && (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">PROMO</span>
                    )}
                    <span className="px-2 py-0.5 bg-[#f1dbff] text-[#500088] text-[10px] font-bold rounded uppercase">
                      {popupItem.kategori || 'Umum'}
                    </span>
                    {/* 🔥 UPDATE: LABEL STOK DI POPUP */}
                    {popupItem.stok > 0 ? (
                      <span className="text-[10px] font-bold text-[#059669] bg-[#ecfdf5] px-2 py-0.5 rounded border border-[#a7f3d0]">Sisa {popupItem.stok}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#ba1a1a] bg-[#fff1f2] px-2 py-0.5 rounded border border-[#fecaca]">Stok Habis</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#f3f4f5] p-3 rounded-xl border border-[#cfc2d4]/20">
                <h4 className="text-[13px] font-bold text-[#191c1d] mb-1">Deskripsi :</h4>
                <p className="text-[13px] text-[#4c4452] leading-relaxed max-h-[100px] overflow-y-auto">
                  {popupItem.deskripsi || "Tidak ada deskripsi untuk produk ini."}
                </p>
              </div>

              {/* 🔥 UPDATE: TOMBOL ADD TO CART MULTI-KONDISI */}
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => tambahKeKeranjang(false)}
                  disabled={!isTokoBuka || popupItem.stok <= 0}
                  className={`flex-1 py-3.5 text-[#500088] transition-all rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] border-2 border-[#500088] ${
                    isTokoBuka && popupItem.stok > 0
                    ? 'hover:bg-[#f1dbff] active:scale-[0.98]' 
                    : 'border-[#cfc2d4] text-[#cfc2d4] cursor-not-allowed opacity-80'
                  }`}
                  title="Tambah ke Keranjang"
                >
                  <ShoppingCart size={20} />
                </button>
                <button 
                  onClick={() => tambahKeKeranjang(true)}
                  disabled={!isTokoBuka || popupItem.stok <= 0}
                  className={`flex-[3] py-3.5 text-white transition-all rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] ${
                    isTokoBuka && popupItem.stok > 0
                    ? 'bg-[#500088] active:scale-[0.98] shadow-sm' 
                    : 'bg-[#cfc2d4] cursor-not-allowed opacity-80'
                  }`}
                >
                  {!isTokoBuka 
                    ? 'Toko Sedang Tutup' 
                    : popupItem.stok <= 0 
                      ? 'Barang Habis' 
                      : 'Beli Sekarang'
                  }
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}