'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag, MapPin, User, Truck, PackageOpen, Navigation, Map, ChevronLeft, Store } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // STATE BARU: Untuk melacak pilihan metode pengiriman
  const [metodeKirim, setMetodeKirim] = useState('Antar Kurir');
  
  const cart = useCartStore((state) => state.cart);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [formData, setFormData] = useState({ 
    nama: '', 
    whatsapp: '', 
    alamat: '',
    lokasi_maps: '' 
  });

  // 1. Ambil data tersimpan (Auto-fill)
  useEffect(() => {
    const user = localStorage.getItem('alfaShopUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      setFormData(prev => ({ 
        ...prev, 
        nama: parsedUser.name || '', 
        whatsapp: parsedUser.phone || '',
        alamat: parsedUser.address || '' 
      }));
    }
  }, []);

  // 2. Fungsi Sharelok GPS
  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("Browser Anda tidak mendukung GPS.");
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setFormData(prev => ({ ...prev, lokasi_maps: mapsUrl }));
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
        alert("Gagal mengambil lokasi. Pastikan izin lokasi aktif atau gunakan HTTPS.");
      }
    );
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0);
  // Ongkir Rp 2.000 HANYA JIKA pilih Antar Kurir
  const ongkosKirim = (subtotal > 0 && metodeKirim === 'Antar Kurir') ? 2000 : 0; 
  const totalAkhir = subtotal + ongkosKirim;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Keranjang kosong!');
    setIsSubmitting(true);

    // Simpan ke memori HP agar tidak ngetik lagi
    localStorage.setItem('alfaShopUser', JSON.stringify({
        name: formData.nama,
        phone: formData.whatsapp,
        address: formData.alamat
    }));

    // Sesuaikan alamat berdasarkan metode
    const alamatFinal = metodeKirim === 'Ambil di Toko' 
      ? 'Ambil di Toko' 
      : formData.alamat + (formData.lokasi_maps ? ` (Lokasi GPS: ${formData.lokasi_maps})` : '');

    const { error } = await supabase.from('pesanan').insert([{
      nama_pelanggan: formData.nama,
      whatsapp: formData.whatsapp,
      alamat: alamatFinal,
      total_harga: totalAkhir,
      item_pesanan: cart.map(c => ({ id: c.id, name: c.nama_produk, price: c.harga, quantity: c.qty, type: c.satuan })),
      status: 'Menunggu'
    }]);

    if (!error) {
      const nomorAdmin = "6287728450708"; 
      
      // 1. Format Detail Pesanan
      let detailPesanan = cart.map(item => 
        `▪️ ${item.qty}x ${item.nama_produk} *(Rp ${(item.harga * item.qty).toLocaleString('id-ID')})*`
      ).join('%0A');
      
      // 2. Format Link GPS (Hanya jika Antar Kurir dan ada GPS)
      const linkGps = (formData.lokasi_maps && metodeKirim === 'Antar Kurir') ? `%0A📍 *Sharelok GPS:*%0A${formData.lokasi_maps}` : '';
      const alamatTampil = metodeKirim === 'Ambil di Toko' ? 'Ambil Sendiri di Toko' : formData.alamat;
      
      // 3. Format Pesan Keseluruhan (Ditambah info Metode Kirim)
      const pesanWA = `Halo Admin AlfaShop! 🛒 Ada pesanan baru nih.%0A%0A👤 *DATA PEMBELI:*%0A- Nama: ${formData.nama}%0A- WA: ${formData.whatsapp}%0A- Metode: *${metodeKirim}*%0A- Alamat: ${alamatTampil}${linkGps}%0A%0A🛍️ *DETAIL PESANAN:*%0A${detailPesanan}%0A%0A💰 *TOTAL BAYAR: Rp ${totalAkhir.toLocaleString('id-ID')}*%0A%0AMohon segera diproses ya. Terima kasih! 🙏`;
      
      window.open(`https://wa.me/${nomorAdmin}?text=${pesanWA}`, '_blank');
      clearCart(); 
      router.push('/sukses'); 
    } else {
      alert("Terjadi kesalahan saat menyimpan pesanan. Silakan coba lagi.");
    }
    setIsSubmitting(false);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
        <div className="w-20 h-20 bg-[#fff1f2] rounded-full flex items-center justify-center mb-4 border border-[#ffe4e6]">
          <PackageOpen size={40} className="text-[#fb7185]" />
        </div>
        <h2 className="text-xl font-black text-[#1d1a24]">Keranjang Kosong</h2>
        <p className="text-sm text-[#7b7487] mt-2 mb-8">Wah, belanjaanmu masih kosong nih.</p>
        <Link href="/" className="bg-[#7c3aed] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#7c3aed]/20">Mulai Belanja</Link>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 max-w-2xl mx-auto pb-32">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-xl border border-[#ffe4e6] text-[#7b7487] active:scale-90 transition-all">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-[#1d1a24] tracking-tight">Checkout</h1>
      </div>

      <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
        
        {/* INFO PENERIMA */}
        <section className="bg-white rounded-3xl border border-[#ffe4e6] p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-[#630ed4] uppercase tracking-widest flex items-center gap-2 mb-2">
            <User size={16} /> Data Penerima
          </h2>
          <div className="space-y-4">
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ccc3d8]" />
              <input required type="text" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full bg-[#fef7ff] border border-[#ccc3d8] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#1d1a24] focus:ring-2 focus:ring-[#7c3aed] outline-none transition-all placeholder:text-[#ccc3d8]" placeholder="Nama Lengkap" />
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#1d1a24] border-r border-[#ccc3d8] pr-2">+62</div>
              <input required type="tel" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-[#fef7ff] border border-[#ccc3d8] rounded-2xl pl-16 pr-4 py-4 text-sm font-bold text-[#1d1a24] focus:ring-2 focus:ring-[#7c3aed] outline-none transition-all placeholder:text-[#ccc3d8]" placeholder="812 3456 789" />
            </div>
          </div>
        </section>

        {/* METODE PENGIRIMAN (FITUR BARU) */}
        <section className="bg-white rounded-3xl border border-[#ffe4e6] p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-[#630ed4] uppercase tracking-widest mb-2">Metode Pengiriman</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMetodeKirim('Ambil di Toko')}
              className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                metodeKirim === 'Ambil di Toko' ? 'border-[#7c3aed] bg-[#fff1f2] text-[#7c3aed]' : 'border-gray-200 bg-white text-gray-500'
              }`}
            >
              <Store size={24} className="mb-2" />
              <span className="text-xs font-bold">Ambil di Toko</span>
            </button>
            <button
              type="button"
              onClick={() => setMetodeKirim('Antar Kurir')}
              className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                metodeKirim === 'Antar Kurir' ? 'border-[#7c3aed] bg-[#fff1f2] text-[#7c3aed]' : 'border-gray-200 bg-white text-gray-500'
              }`}
            >
              <Truck size={24} className="mb-2" />
              <span className="text-xs font-bold">Antar Kurir</span>
            </button>
          </div>
        </section>

        {/* ALAMAT & GPS (Hanya muncul jika pilih Antar Kurir) */}
        {metodeKirim === 'Antar Kurir' && (
          <section className="bg-white rounded-3xl border border-[#ffe4e6] p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-black text-[#630ed4] uppercase tracking-widest flex items-center gap-2">
                <MapPin size={16} /> Alamat Kirim
              </h2>
              <button 
                type="button" onClick={handleGetLocation} disabled={isGettingLocation}
                className={`text-[10px] flex items-center gap-1.5 font-black px-3 py-2 rounded-full transition-all border ${formData.lokasi_maps ? 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]' : 'bg-[#f3ebfa] text-[#7c3aed] border-[#eaddff] active:scale-95'}`}
              >
                {isGettingLocation ? 'Mencari...' : formData.lokasi_maps ? <><Map size={12}/> Lokasi Terkunci</> : <><Navigation size={12}/> Ambil GPS</>}
              </button>
            </div>
            <textarea 
              required={metodeKirim === 'Antar Kurir'} 
              rows={3} value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} 
              className="w-full bg-[#fef7ff] border border-[#ccc3d8] rounded-2xl px-5 py-4 text-sm font-bold text-[#1d1a24] outline-none focus:ring-2 focus:ring-[#7c3aed] transition-all resize-none placeholder:text-[#ccc3d8]" 
              placeholder="Tulis alamat lengkap & patokan rumah..." 
            />
          </section>
        )}

        {/* RINGKASAN ITEM */}
        <section className="bg-white rounded-3xl border border-[#ffe4e6] p-6 shadow-sm">
          <h2 className="text-sm font-black text-[#630ed4] uppercase tracking-widest mb-4">Pesananmu</h2>
          <div className="divide-y divide-[#f3ebfa]">
            {cart.map((item) => (
              <div key={item.id} className="py-4 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#1d1a24]">{item.nama_produk}</span>
                  <span className="text-xs font-medium text-[#7b7487]">{item.qty} x Rp {item.harga.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3 bg-[#fef7ff] border border-[#ccc3d8] rounded-xl px-2 py-1">
                  <button type="button" onClick={() => item.qty > 1 ? updateQty(item.id, item.qty - 1) : removeFromCart(item.id)} className="text-[#7b7487] p-1"><Minus size={14}/></button>
                  <span className="text-xs font-black text-[#1d1a24] w-4 text-center">{item.qty}</span>
                  <button type="button" onClick={() => updateQty(item.id, item.qty + 1)} className="text-[#7b7487] p-1"><Plus size={14}/></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-dashed border-[#ccc3d8] space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#7b7487]">
              <span>Biaya Layanan/Ongkir</span>
              <span>{ongkosKirim === 0 ? 'Gratis' : `Rp ${ongkosKirim.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-[#630ed4]">
              <span>Total Bayar</span>
              <span>Rp {totalAkhir.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </section>

        {/* TOMBOL BAYAR */}
        <button 
          type="submit" disabled={isSubmitting}
          className="w-full bg-[#630ed4] text-white font-black py-5 rounded-2xl shadow-[0_12px_24px_rgba(99,14,212,0.3)] hover:bg-[#732ee4] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSubmitting ? 'MEMPROSES...' : <><ShoppingBag size={20} /> PESAN SEKARANG (COD)</>}
        </button>
        <p className="text-[10px] text-center text-[#7b7487] font-bold uppercase tracking-widest">
          {metodeKirim === 'Ambil di Toko' ? 'Bayar di kasir saat mengambil pesanan' : 'Bayar tunai saat barang sampai di rumah'}
        </p>

      </form>
    </div>
  );
}