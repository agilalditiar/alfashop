'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RiwayatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pesanan, setPesanan] = useState<any[]>([]);
  const [userWA, setUserWA] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [cancelModal, setCancelModal] = useState<number | null>(null);

  const loadData = (nomorWA: string) => {
    setLoading(true);
    fetch(`/api/riwayat?wa=${encodeURIComponent(nomorWA)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPesanan(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const userLoggedIn = localStorage.getItem('user');
    const savedWA = localStorage.getItem('savedWA');

    if (!userLoggedIn) {
      router.replace('/login');
      return;
    }

    const user = JSON.parse(userLoggedIn);
    const nomorWA = user.whatsapp || user.no_wa || savedWA;

    if (!nomorWA) {
      setLoading(false);
      return;
    }
    
    setUserWA(nomorWA);
    loadData(nomorWA);
  }, [router]);

  const executeCancel = async () => {
    if (cancelModal === null) return;
    
    try {
      const res = await fetch('/api/riwayat/batal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesananId: cancelModal, wa: userWA })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCancelModal(null);
        loadData(userWA);
      } else {
        alert(data.message || 'Gagal membatalkan pesanan');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handlePesanUlang = (items: any[]) => {
    if (!items || items.length === 0) return alert('Data barang tidak ditemukan untuk dipesan ulang.');
    const keranjangLama = JSON.parse(localStorage.getItem('keranjang') || '[]');
    items.forEach(item => {
      const existingIdx = keranjangLama.findIndex((k: any) => k.id === item.id);
      if (existingIdx !== -1) {
        keranjangLama[existingIdx].qty += item.qty;
      } else {
        keranjangLama.push({
          id: item.id,
          nama_produk: item.nama_produk,
          gambar_url: item.gambar_url,
          harga: item.harga, 
          qty: item.qty,
          stok: item.stok,
          kategori: item.kategori
        });
      }
    });
    localStorage.setItem('keranjang', JSON.stringify(keranjangLama));
    window.dispatchEvent(new Event('storage'));
    router.push('/checkout');
  };

  const filteredPesanan = searchDate ? pesanan.filter((order) => {
    if (!order.created_at) return false;
    const orderDate = new Date(order.created_at);
    const year = orderDate.getFullYear();
    const month = String(orderDate.getMonth() + 1).padStart(2, '0');
    const day = String(orderDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate === searchDate;
  }) : pesanan;

  return (
    <div className="bg-[#fef7ff] text-[#1d1a24] min-h-screen flex flex-col pb-24 md:pb-0 pt-16">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-md border-b border-[#ffe4e6] shadow-[0_4px_20px_rgba(124,58,237,0.03)] z-50">
        <Link href="/beranda" className="text-[#7c3aed] hover:bg-[#fff1f2] transition-colors rounded-full p-2 active:scale-95 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="font-['Plus_Jakarta_Sans'] font-bold tracking-tight text-2xl text-[#7c3aed]">
          AlfaShop
        </div>
        <Link href="/profil" className="w-8 h-8 rounded-full overflow-hidden hover:opacity-80 transition-opacity active:scale-95 bg-[#e8dfee] flex items-center justify-center text-[#7c3aed]">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </Link>
      </header>

      {/* Main Canvas */}
      <main className="flex-grow container mx-auto px-4 md:px-20 py-10 max-w-4xl">
        {/* Page Title */}
        <div className="mb-10 mt-6">
          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[#1d1a24] mb-2">Order History</h1>
          <p className="text-[16px] text-[#4a4455]">Lacak pembelian terakhir Anda dan statusnya.</p>
        </div>

        {/* Search Section */}
        <div className="bg-[#ffffff] rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.03)] border border-[#ccc3d8] p-6 mb-10">
          <label className="text-[14px] font-semibold text-[#1d1a24] mb-3 block" htmlFor="date-search">Cari dengan Tanggal Pesanan</label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#7b7487]">calendar_today</span>
            <input 
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-[#ccc3d8] bg-[#fef7ff] focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] outline-none transition-colors text-[16px] text-[#1d1a24]" 
              id="date-search" 
              type="date"
            />
            {searchDate && (
              <button 
                onClick={() => setSearchDate('')}
                className="absolute right-3 text-[#7b7487] hover:text-[#1d1a24] p-1 rounded-full hover:bg-[#f3f4f5] flex items-center justify-center transition-colors"
                title="Hapus filter tanggal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Order List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-10 text-[#7c3aed]">
               <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            </div>
          ) : filteredPesanan.length === 0 ? (
            <div className="text-center py-10 text-[#7b7487]">
              {searchDate ? 'Belum ada pesanan untuk tanggal ini.' : 'Belum ada pesanan.'}
            </div>
          ) : (
            filteredPesanan.map((order, idx) => {
              const isWaiting = order.status === 'Menunggu' || order.status === 'Proses';
              const isCompleted = order.status === 'Selesai';
              const isCanceled = order.status === 'Dibatalkan' || order.status === 'Batal';
              const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
              
              let statusBg = 'bg-[#eaddff]';
              let statusText = 'text-[#25005a]';
              let statusDot = 'bg-[#630ed4]';
              let statusIcon = '';
              let opacityClass = '';

              if (isWaiting) {
                statusBg = 'bg-[#ffdcc6]';
                statusText = 'text-[#713700]';
                statusDot = 'bg-[#7d3d00]';
              } else if (isCompleted) {
                statusBg = 'bg-[#e8dfee]';
                statusText = 'text-[#4a4455]';
                statusIcon = 'check_circle';
                opacityClass = 'opacity-75 hover:opacity-100 hover:bg-[#f9f1ff] transition-all';
              } else if (isCanceled) {
                statusBg = 'bg-[#ffdad6]';
                statusText = 'text-[#93000a]';
                statusIcon = 'cancel';
                opacityClass = 'opacity-75 hover:opacity-100 transition-all';
              }

              return (
                <div key={idx} className={`bg-[#ffffff] rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.03)] border border-[#ccc3d8] p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-[#f9f1ff] transition-colors ${opacityClass}`}>
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[12px] font-medium text-[#7b7487]">Order #AS-{order.id.toString().padStart(4, '0')}</span>
                        <h3 className="text-[14px] font-semibold text-[#1d1a24] mt-1">{dateStr}</h3>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full ${statusBg} ${statusText} text-[12px] font-medium`}>
                        {statusIcon ? (
                           <span className="material-symbols-outlined text-[14px] mr-1">{statusIcon}</span>
                        ) : (
                           <span className={`w-2 h-2 rounded-full ${statusDot} mr-1`}></span>
                        )}
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="mt-4 mb-4">
                       {order.items && order.items.length > 0 ? (
                         order.items.map((it:any, i:number) => (
                           <p key={i} className="text-[16px] text-[#4a4455] line-clamp-1" title={it.nama_produk}>{it.qty}x {it.nama_produk}</p>
                         ))
                       ) : (
                         <p className="text-[16px] text-[#4a4455]">Item Pesanan</p>
                       )}
                    </div>

                    <div className="text-[14px] font-semibold text-[#630ed4]">Total: Rp {order.total_harga?.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="w-full md:w-auto flex flex-col gap-2">
                    <button onClick={() => router.push(`/riwayat/${order.id}`)} className="w-full md:w-auto bg-[#f3ebfa] text-[#630ed4] rounded-lg px-6 py-3 text-[14px] font-semibold hover:bg-[#eaddff] transition-colors text-center border border-[#eaddff]">Detail</button>
                    {isWaiting && (
                      <button onClick={() => setCancelModal(order.id)} className="w-full md:w-auto bg-[#fff1f2] text-[#e11d48] rounded-lg px-6 py-3 text-[14px] font-semibold hover:bg-[#ffe4e6] transition-colors text-center border border-[#ffe4e6]">Batalkan</button>
                    )}
                    {(isCompleted || isCanceled) && (
                      <button onClick={() => handlePesanUlang(order.items)} className="w-full md:w-auto text-[#655c5d] rounded-lg px-6 py-3 text-[14px] font-semibold hover:bg-[#e8dfee] transition-colors text-center border border-transparent">Beli Lagi</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-safe h-20 bg-white/90 backdrop-blur-lg rounded-t-2xl border-t border-[#ffe4e6] shadow-[0_-4px_20px_rgba(124,58,237,0.05)] z-50">
        <Link href="/beranda" className="flex flex-col items-center justify-center text-[#a1a1aa] px-4 py-1.5 hover:text-[#8b5cf6] transition-all active:opacity-80">
          <span className="material-symbols-outlined mb-1">home</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Beranda</span>
        </Link>
        <Link href="/checkout" className="flex flex-col items-center justify-center text-[#a1a1aa] px-4 py-1.5 hover:text-[#8b5cf6] transition-all active:opacity-80">
          <span className="material-symbols-outlined mb-1">shopping_cart</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Keranjang</span>
        </Link>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center justify-center bg-[#fff1f2] text-[#7c3aed] rounded-xl px-4 py-1.5 transition-all active:opacity-80">
          <span className="material-symbols-outlined mb-1" style={{fontVariationSettings: "'FILL' 1"}}>history</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold text-[#7c3aed]">Riwayat</span>
        </button>
      </nav>

      {/* Cancel Modal */}
      {cancelModal !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#ffffff] rounded-2xl shadow-xl w-[90%] max-w-[400px] p-6 md:p-8 border border-[#ccc3d8] animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-[20px] md:text-[24px] font-semibold text-[#1d1a24] mb-3">Batalkan Pesanan?</h2>
            <p className="text-[14px] md:text-[16px] text-[#4a4455] mb-8 md:mb-10">Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeCancel} className="w-full bg-[#e11d48] text-white rounded-xl py-3 text-[14px] font-semibold hover:opacity-90 transition-opacity">Ya, Batalkan</button>
              <button onClick={() => setCancelModal(null)} className="w-full bg-[#f3ebfa] text-[#4a4455] rounded-xl py-3 text-[14px] font-semibold hover:bg-[#e8dfee] transition-colors">Kembali</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}