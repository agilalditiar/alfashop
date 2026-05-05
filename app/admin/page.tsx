'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Package, ShoppingBag, ShoppingCart, BarChart3, Store, Banknote, Power } from 'lucide-react';

export default function AdminDashboardPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [omzetHariIni, setOmzetHariIni] = useState(0);
  const [pesananBaru, setPesananBaru] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    const besok = new Date(hariIni);
    besok.setDate(besok.getDate() + 1);

    const [
      { data: pengaturan },
      { data: pesananSelesai },
      { count: jumlahMenunggu }
    ] = await Promise.all([
      supabase.from('pengaturan').select('is_open').eq('id', 1).single(),
      supabase.from('pesanan').select('total_harga').eq('status', 'Selesai').gte('created_at', hariIni.toISOString()).lt('created_at', besok.toISOString()),
      supabase.from('pesanan').select('*', { count: 'exact', head: true }).eq('status', 'Menunggu')
    ]);

    if (pengaturan) setIsOpen(pengaturan.is_open);
    if (pesananSelesai) setOmzetHariIni(pesananSelesai.reduce((acc, curr) => acc + curr.total_harga, 0));
    if (jumlahMenunggu !== null) setPesananBaru(jumlahMenunggu);
    setIsLoading(false);
  };

  const handleToggleToko = async () => {
    const statusBaru = !isOpen;
    setIsOpen(statusBaru); 
    await supabase.from('pengaturan').update({ is_open: statusBaru }).eq('id', 1);
  };

  return (
    <main className="p-6 md:p-10 flex flex-col gap-8 w-full">
      
      {/* Greeting & Hero Widget */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-[#1d1a24]">Halo, Admin! 👋</h2>
          <p className="text-base text-[#4a4455]">Berikut adalah ringkasan performa toko Anda hari ini.</p>
        </div>

        <div className={`rounded-2xl p-8 md:p-10 shadow-sm border relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 min-h-[160px] transition-all duration-500 ${isOpen ? 'bg-[#630ed4]/5 border-[#630ed4]/10' : 'bg-[#ba1a1a]/5 border-[#ba1a1a]/10'}`}>
          <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${isOpen ? 'bg-[#630ed4]/10' : 'bg-[#ba1a1a]/10'}`}></div>
          
          <div className="flex flex-col gap-2 z-10 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className={`w-3 h-3 rounded-full transition-colors duration-500 shadow-[0_0_12px_rgba(0,0,0,0.5)] ${isOpen ? 'bg-[#630ed4] shadow-[#630ed4]/50' : 'bg-[#ba1a1a] shadow-[#ba1a1a]/50'}`}></span>
              <h3 className={`text-2xl font-bold transition-colors duration-500 ${isOpen ? 'text-[#630ed4]' : 'text-[#ba1a1a]'}`}>
                {isLoading ? 'Mengecek Status...' : (isOpen ? 'Toko Buka' : 'Toko Tutup')}
              </h3>
            </div>
            <p className="text-[16px] text-[#4a4455] max-w-md">
              {isOpen ? 'Pelanggan bisa memesan dan melihat katalog produk Anda secara online.' : 'Fitur pesanan online sedang dimatikan sementara.'}
            </p>
          </div>

          <div className="z-10 flex-shrink-0 cursor-pointer group" onClick={handleToggleToko}>
            <div className={`w-32 h-14 rounded-full p-1.5 flex items-center shadow-inner transition-all duration-500 ${isOpen ? 'bg-[#630ed4]' : 'bg-[#ba1a1a]'}`}>
              <div className={`w-11 h-11 bg-[#ffffff] rounded-full shadow-md flex items-center justify-center transform transition-transform duration-500 group-hover:scale-95 ${isOpen ? 'translate-x-16' : 'translate-x-0'}`}>
                <Power size={24} className={`transition-colors duration-500 ${isOpen ? 'text-[#630ed4]' : 'text-[#ba1a1a]'}`} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Middle Section: Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#ffffff] rounded-2xl p-6 shadow-sm border border-[#e8dfee] flex flex-col gap-4 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4a4455] uppercase tracking-wider">Omzet Hari Ini</span>
            <div className="w-12 h-12 rounded-full bg-[#059669]/10 flex items-center justify-center text-[#059669]">
              <Banknote size={24} />
            </div>
          </div>
          <div className="flex items-baseline gap-3 min-h-[48px]">
            {isLoading ? <span className="text-4xl font-bold text-[#ccc3d8] animate-pulse">...</span> : <span className="text-5xl font-bold text-[#1d1a24] tracking-tight">Rp {omzetHariIni.toLocaleString('id-ID')}</span>}
            <span className="text-[14px] font-semibold text-[#ffffff] bg-[#630ed4] px-3 py-1 rounded-lg shadow-sm">Real-time</span>
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-2xl p-6 shadow-sm border border-[#e8dfee] flex flex-col gap-4 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4a4455] uppercase tracking-wider">Pesanan Baru</span>
            <div className="w-12 h-12 rounded-full bg-[#630ed4]/10 flex items-center justify-center text-[#630ed4]">
              <ShoppingBag size={24} />
            </div>
          </div>
          <div className="flex items-baseline gap-3 min-h-[48px]">
            {isLoading ? <span className="text-5xl font-bold text-[#ccc3d8] animate-pulse">...</span> : <span className="text-5xl font-bold text-[#1d1a24] tracking-tight">{pesananBaru}</span>}
            <span className="text-base text-[#4a4455]">Menunggu proses</span>
          </div>
        </div>
      </section>

      {/* Bottom Section: Quick Actions */}
      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold text-[#1d1a24] mb-2">Aksi Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Link href="/admin/kasir" className="bg-[#f9f1ff] rounded-2xl p-8 flex flex-col items-center justify-center gap-6 hover:bg-[#630ed4]/5 transition-all duration-300 border border-transparent hover:border-[#630ed4]/20 shadow-sm hover:shadow-md group">
            <div className="w-16 h-16 rounded-full bg-[#ffffff] group-hover:bg-[#630ed4]/10 flex items-center justify-center text-[#630ed4] transition-colors duration-300 shadow-sm group-hover:shadow-none"><ShoppingCart size={32} /></div>
            <span className="text-[14px] font-semibold text-center text-[#1d1a24] group-hover:text-[#630ed4]">Kasir Offline</span>
          </Link>
          <Link href="/admin/produk" className="bg-[#f9f1ff] rounded-2xl p-8 flex flex-col items-center justify-center gap-6 hover:bg-[#630ed4]/5 transition-all duration-300 border border-transparent hover:border-[#630ed4]/20 shadow-sm hover:shadow-md group">
            <div className="w-16 h-16 rounded-full bg-[#ffffff] group-hover:bg-[#630ed4]/10 flex items-center justify-center text-[#630ed4] transition-colors duration-300 shadow-sm group-hover:shadow-none"><Package size={32} /></div>
            <span className="text-[14px] font-semibold text-center text-[#1d1a24] group-hover:text-[#630ed4]">Kelola Produk</span>
          </Link>
          <Link href="/admin/pesanan" className="bg-[#f9f1ff] rounded-2xl p-8 flex flex-col items-center justify-center gap-6 hover:bg-[#630ed4]/5 transition-all duration-300 border border-transparent hover:border-[#630ed4]/20 shadow-sm hover:shadow-md group">
            <div className="w-16 h-16 rounded-full bg-[#ffffff] group-hover:bg-[#630ed4]/10 flex items-center justify-center text-[#630ed4] transition-colors duration-300 shadow-sm group-hover:shadow-none"><Store size={32} /></div>
            <span className="text-[14px] font-semibold text-center text-[#1d1a24] group-hover:text-[#630ed4]">Pesanan Online</span>
          </Link>
          <Link href="/admin/laporan" className="bg-[#f9f1ff] rounded-2xl p-8 flex flex-col items-center justify-center gap-6 hover:bg-[#630ed4]/5 transition-all duration-300 border border-transparent hover:border-[#630ed4]/20 shadow-sm hover:shadow-md group">
            <div className="w-16 h-16 rounded-full bg-[#ffffff] group-hover:bg-[#630ed4]/10 flex items-center justify-center text-[#630ed4] transition-colors duration-300 shadow-sm group-hover:shadow-none"><BarChart3 size={32} /></div>
            <span className="text-[14px] font-semibold text-center text-[#1d1a24] group-hover:text-[#630ed4]">Laporan & Analitik</span>
          </Link>
        </div>
      </section>

    </main>
  );
}