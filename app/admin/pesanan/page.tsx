'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Bell, Clock, MapPin, MessageCircle, Truck, CheckCheck, RefreshCw, ReceiptText } from 'lucide-react';

export default function PesananAdminPage() {
  const [pesananList, setPesananList] = useState<any[]>([]);
  const [filter, setFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 1. Ambil Data Pesanan
  const fetchPesanan = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('pesanan').select('*').order('created_at', { ascending: false });
    setPesananList(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchPesanan(); }, []);

  // 2. Fungsi Ubah Status
  const updateStatus = async (id: string, statusSekarang: string) => {
    let statusBaru = '';
    if (statusSekarang === 'Menunggu') statusBaru = 'Diproses';
    else if (statusSekarang === 'Diproses') statusBaru = 'Selesai';
    else return;

    if (window.confirm(`Tandai pesanan ini menjadi "${statusBaru}"?`)) {
      await supabase.from('pesanan').update({ status: statusBaru }).eq('id', id);
      fetchPesanan();
    }
  };

  // 3. Hitung & Filter Data
  const filteredPesanan = pesananList.filter((p) => {
    const matchStatus = filter === 'Semua' ? true : p.status === filter;
    const matchSearch = p.nama_pelanggan.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toString().toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    Semua: pesananList.length,
    Menunggu: pesananList.filter(p => p.status === 'Menunggu').length,
    Diproses: pesananList.filter(p => p.status === 'Diproses').length,
  };

  // 4. Konfigurasi Visual Status (Lumina Style)
  const getStatusConfig = (status: string) => {
    if (status === 'Menunggu') return { 
      badgeBg: 'bg-[#eddfe0]', badgeText: 'text-[#6c6263]', icon: <Clock size={14} />, 
      btnBg: 'bg-[#630ed4]', btnText: 'text-white', btnHover: 'hover:bg-[#732ee4]', btnIcon: <Truck size={18} />, btnLabel: 'Proses Pesanan' 
    };
    if (status === 'Diproses') return { 
      badgeBg: 'bg-[#630ed4]', badgeText: 'text-white', icon: <RefreshCw size={14} className="animate-spin-slow" />, 
      btnBg: 'bg-[#10b981]', btnText: 'text-white', btnHover: 'hover:bg-[#059669]', btnIcon: <CheckCheck size={18} />, btnLabel: 'Selesaikan' 
    };
    return { 
      badgeBg: 'bg-[#e8dfee]', badgeText: 'text-[#4a4455]', icon: <CheckCheck size={14} />, 
      btnBg: 'bg-[#f3ebfa]', btnText: 'text-[#7b7487]', btnHover: '', btnIcon: <CheckCheck size={18} />, btnLabel: 'Telah Selesai', disabled: true 
    };
  };

  return (
    // Disesuaikan w-full dan paddingnya agar rata kiri dengan layout.tsx
    <main className="flex-1 p-6 md:p-10 w-full flex flex-col font-sans">
      
      {/* Header Section (Toolbar Spesifik Pesanan) */}
      <section className="relative bg-[#fef7ff]/90 border-b border-[#e8dfee] pb-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#1d1a24] tracking-tight">Pesanan Masuk</h2>
            <p className="text-sm font-medium text-[#4a4455] mt-1">Kelola dan lacak permintaan pelanggan aktif.</p>
          </div>
          
          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b7487]" size={18} />
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f3ebfa] border border-transparent rounded-full pl-10 pr-4 py-2 text-sm text-[#1d1a24] placeholder:text-[#7b7487] focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-colors outline-none" 
                placeholder="Cari pesanan..."
              />
            </div>
            <button onClick={fetchPesanan} className="w-10 h-10 shrink-0 rounded-full bg-[#f3ebfa] flex items-center justify-center text-[#1d1a24] hover:bg-[#e8dfee] transition-colors" title="Segarkan Data">
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button className="w-10 h-10 shrink-0 rounded-full bg-[#f3ebfa] flex items-center justify-center text-[#1d1a24] hover:bg-[#e8dfee] transition-colors relative">
              <Bell size={18} />
              {counts.Menunggu > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>}
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto hide-scrollbar pb-1">
          {['Semua', 'Menunggu', 'Diproses'].map((tab) => (
            <button 
              key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors whitespace-nowrap ${
                filter === tab 
                  ? 'bg-[#7c3aed] text-[#ede0ff] border-[#630ed4]' 
                  : 'bg-[#f3ebfa] hover:bg-[#e8dfee] text-[#4a4455] border-transparent'
              }`}
            >
              {tab === 'Semua' ? 'Semua Pesanan' : tab} 
              <span className="ml-1 opacity-80 font-medium">({counts[tab as keyof typeof counts]})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Order Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
        
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-[#7b7487] text-sm animate-pulse font-bold">Sinkronisasi data pesanan...</div>
        ) : filteredPesanan.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-[#ccc3d8]">
            <ReceiptText size={48} className="mb-3 text-[#e8dfee]" />
            <p className="text-sm font-bold text-[#7b7487]">Tidak ada pesanan di kategori ini.</p>
          </div>
        ) : filteredPesanan.map((order) => {
          const shortId = `#ORD-${order.id.toString().padStart(4, '0')}`;
          const dateObj = new Date(order.created_at);
          const timeString = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          const dateString = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          const config = getStatusConfig(order.status);
          const inisial = order.nama_pelanggan.substring(0, 1).toUpperCase();

          return (
            <div key={order.id} className={`bg-white rounded-xl p-6 flex flex-col gap-6 border border-[#ccc3d8]/40 shadow-sm hover:shadow-md hover:border-[#d2bbff] transition-all duration-300 ${order.status === 'Selesai' ? 'opacity-60' : ''}`}>
              
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-sm text-[#1d1a24]">{shortId}</span>
                  <p className="text-xs font-medium text-[#7b7487] mt-1">{dateString}, {timeString} WIB</p>
                </div>
                <span className={`${config.badgeBg} ${config.badgeText} text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm`}>
                  {config.icon} {order.status}
                </span>
              </div>

              {/* Customer Info */}
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[#eaddff] text-[#5a00c6] flex items-center justify-center text-lg font-black">
                  {inisial}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-[#1d1a24]">{order.nama_pelanggan}</span>
                  <span className="text-xs font-medium text-[#4a4455] flex items-start gap-1 mt-0.5 leading-tight">
                    <MapPin size={14} className="shrink-0 mt-0.5 text-[#7b7487]" />
                    <span className="line-clamp-2">{order.alamat}</span>
                  </span>
                </div>
              </div>

              {/* Items List (Lumina Grey Box) */}
              <div className="bg-[#f3ebfa] rounded-lg p-4 flex flex-col gap-3 border border-[#e8dfee]">
                <p className="text-[10px] font-black text-[#7b7487] uppercase tracking-wider mb-1">Detail Pesanan</p>
                {order.item_pesanan?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start text-sm font-medium text-[#1d1a24] gap-4">
                    <span className="leading-tight"><span className="font-black text-[#630ed4]">{item.quantity}x</span> {item.name}</span>
                    <span className="text-[#4a4455] shrink-0">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              {/* Total & Actions */}
              <div className="mt-auto pt-4 border-t border-[#ccc3d8]/30 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#4a4455]">Total Pembayaran</span>
                  <span className="text-xl font-black text-[#630ed4]">Rp {order.total_harga.toLocaleString('id-ID')}</span>
                </div>

                <div className="flex gap-3">
                  <a 
                    href={`https://wa.me/62${order.whatsapp?.replace(/^0/, '')}?text=Halo%20${order.nama_pelanggan},%20pesanan%20${shortId}%20sedang%20kami%20proses.`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 bg-[#f9f1ff] hover:bg-[#e8dfee] text-[#1d1a24] text-sm font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-[#e8dfee]"
                  >
                    <MessageCircle size={18} className="text-[#059669]" /> Chat
                  </a>
                  
                  <button 
                    onClick={() => updateStatus(order.id, order.status)}
                    disabled={config.disabled}
                    className={`flex-[1.5] ${config.btnBg} ${config.btnText} ${config.btnHover} text-sm font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm disabled:cursor-not-allowed`}
                  >
                    {config.btnIcon} {config.btnLabel}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </main>
  );
}