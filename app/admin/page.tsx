'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Download, Wallet, ReceiptText, TrendingUp, ShoppingBag, ChevronDown, BarChart3 } from 'lucide-react';

export default function LaporanAdminPage() {
  const router = useRouter();
  const [semuaPesanan, setSemuaPesanan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // STATE BARU: Tambah opsi 'Keseluruhan' dan jadikan default
  const [tabAktif, setTabAktif] = useState<'Keseluruhan' | 'Web' | 'Warung'>('Keseluruhan');
  const [grafikPeriode, setGrafikPeriode] = useState<'Harian' | 'Mingguan' | 'Bulanan'>('Harian');
  const [filterWaktu, setFilterWaktu] = useState<'Bulan Ini' | 'Tahun Ini' | 'Semua Waktu'>('Bulan Ini');
  const [showDropdownWaktu, setShowDropdownWaktu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('pesanan').select('*').eq('status', 'Selesai').order('created_at', { ascending: false });
    setSemuaPesanan(data || []);
    setIsLoading(false);
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // LOGIKA DIPERBARUI: Filter Tab mengakomodasi 'Keseluruhan'
  const dataTab = semuaPesanan.filter(p => {
    if (tabAktif === 'Keseluruhan') return true; // Tampilkan semua tanpa filter
    const isWarung = p.nama_pelanggan.includes('Pelanggan Kasir');
    return tabAktif === 'Warung' ? isWarung : !isWarung;
  });

  const omzetHariIni = dataTab.filter(p => new Date(p.created_at).toDateString() === now.toDateString()).reduce((acc, curr) => acc + curr.total_harga, 0);
  
  const omzetMingguIni = dataTab.filter(p => {
    const d = new Date(p.created_at);
    const semingguLalu = new Date();
    semingguLalu.setDate(now.getDate() - 7);
    return d >= semingguLalu;
  }).reduce((acc, curr) => acc + curr.total_harga, 0);

  const omzetBulanIni = dataTab.filter(p => {
    const d = new Date(p.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).reduce((acc, curr) => acc + curr.total_harga, 0);

  const omzetTahunIni = dataTab.filter(p => new Date(p.created_at).getFullYear() === currentYear).reduce((acc, curr) => acc + curr.total_harga, 0);

  const dataTampil = dataTab.filter(p => {
    const d = new Date(p.created_at);
    if (filterWaktu === 'Bulan Ini') return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    if (filterWaktu === 'Tahun Ini') return d.getFullYear() === currentYear;
    return true;
  });

  const generateChartData = () => {
    const dataTerurut = [...dataTampil].reverse(); 
    const groupedData: Record<string, number> = {};
    dataTerurut.forEach(order => {
      const d = new Date(order.created_at);
      let key = '';
      if (grafikPeriode === 'Harian') key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      else if (grafikPeriode === 'Mingguan') {
        const weekNum = Math.ceil(d.getDate() / 7);
        key = `Mgg ${weekNum} ${d.toLocaleDateString('id-ID', { month: 'short' })}`;
      }
      else if (grafikPeriode === 'Bulanan') key = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      
      if (!groupedData[key]) groupedData[key] = 0;
      groupedData[key] += order.total_harga; 
    });
    return Object.keys(groupedData).map(key => ({ tanggal: key, total: groupedData[key] }));
  };

  const handleExportCSV = () => {
    if (dataTampil.length === 0) return alert('Tidak ada data.');
    const headers = ['ID', 'Tanggal', 'Pelanggan', 'Total (Rp)'];
    const csvRows = [headers.join(','), ...dataTampil.map(o => [o.id, new Date(o.created_at).toLocaleString(), `"${o.nama_pelanggan}"`, o.total_harga].join(','))];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_AlfaShop_${tabAktif}.csv`;
    link.click();
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#fef7ff] min-h-screen font-sans text-[#1d1a24]">
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-[#1d1a24] mb-2 tracking-tight">Dashboard Analitik</h2>
            <p className="text-sm font-medium text-[#4a4455]">Pantau perkembangan omzet AlfaShop secara berkala.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setShowDropdownWaktu(!showDropdownWaktu)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#ffe4e6] rounded-full text-[#630ed4] text-sm font-bold shadow-sm">
                <Calendar size={18} /> {filterWaktu} <ChevronDown size={16} />
              </button>
              {showDropdownWaktu && (
                <div className="absolute top-full mt-2 left-0 w-40 bg-white border border-[#ffe4e6] rounded-2xl shadow-xl z-50 overflow-hidden">
                  {['Bulan Ini', 'Tahun Ini', 'Semua Waktu'].map((opsi) => (
                    <button key={opsi} onClick={() => { setFilterWaktu(opsi as any); setShowDropdownWaktu(false); }} className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-[#f3ebfa]">{opsi}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-[#630ed4] rounded-full text-white text-sm font-bold shadow-md active:scale-95 transition-transform">
              <Download size={18} /> Ekspor
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Harian', value: omzetHariIni, color: 'bg-[#eaddff]', text: 'text-[#630ed4]' },
            { label: 'Mingguan', value: omzetMingguIni, color: 'bg-[#d2bbff]', text: 'text-[#5a00c6]' },
            { label: 'Bulanan', value: omzetBulanIni, color: 'bg-[#f3ebfa]', text: 'text-[#630ed4]' },
            { label: 'Tahunan', value: omzetTahunIni, color: 'bg-[#fff1f2]', text: 'text-[#ba1a1a]' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-[#ffe4e6] shadow-sm relative overflow-hidden group">
              <div className={`absolute -right-4 -top-4 w-16 h-16 ${card.color} opacity-20 rounded-full blur-xl group-hover:scale-150 transition-transform`}></div>
              <p className="text-[10px] font-black text-[#7b7487] uppercase tracking-wider mb-1">Omzet {card.label}</p>
              <h3 className={`text-xl font-black ${card.text}`}>
                {isLoading ? '...' : `Rp ${card.value.toLocaleString('id-ID')}`}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                 <TrendingUp size={12} className={card.text} />
                 <span className="text-[10px] font-bold text-[#7b7487]">Data Terkini</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#ffe4e6] p-8 mb-10 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h4 className="text-lg font-black text-[#1d1a24] flex items-center gap-2"><BarChart3 size={20} className="text-[#630ed4]"/> Tren Pendapatan</h4>
            <div className="flex bg-[#fef7ff] p-1 rounded-lg border border-[#ffe4e6]">
              {['Harian', 'Mingguan', 'Bulanan'].map((p) => (
                <button key={p} onClick={() => setGrafikPeriode(p as any)} className={`px-4 py-1.5 text-xs font-bold rounded-md ${grafikPeriode === p ? 'bg-white text-[#630ed4] shadow-sm' : 'text-[#7b7487]'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            {isMounted && !isLoading && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateChartData()}>
                  <defs><linearGradient id="color" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#630ed4" stopOpacity={0.3}/><stop offset="95%" stopColor="#630ed4" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffe4e6" />
                  <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{fontSize: 10, fill:'#7b7487'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill:'#7b7487'}} tickFormatter={(v) => `Rp${v/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} formatter={(v: any) => [`Rp ${v.toLocaleString('id-ID')}`, 'Omzet']} />
                  <Area type="monotone" dataKey="total" stroke="#630ed4" strokeWidth={3} fill="url(#color)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* TAB DIPERBARUI: Keseluruhan | Web | Warung */}
        <div className="mb-6 border-b border-[#ffe4e6] flex gap-6">
          {['Keseluruhan', 'Web', 'Warung'].map((t) => (
            <button key={t} onClick={() => setTabAktif(t as any)} className={`pb-3 text-sm font-black transition-colors ${tabAktif === t ? 'text-[#630ed4] border-b-2 border-[#630ed4]' : 'text-[#7b7487] hover:text-[#630ed4]'}`}>
              {t === 'Keseluruhan' ? 'Total Penjualan' : `Penjualan ${t}`}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#ffe4e6] overflow-hidden shadow-sm mb-10">
          <div className="p-6 border-b border-[#ffe4e6] bg-[#fef7ff] flex justify-between items-center">
            <h4 className="text-lg font-black text-[#1d1a24]">Pesanan Terakhir ({tabAktif})</h4>
            <button onClick={() => router.push('/admin/pesanan')} className="text-[#630ed4] text-xs font-bold hover:underline">Lihat Semua</button>
          </div>
          <div className="divide-y divide-[#ffe4e6]">
            {dataTampil.slice(0, 5).map((trx) => (
              <div key={trx.id} className="p-6 flex items-center justify-between hover:bg-[#fef7ff] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f3ebfa] flex items-center justify-center text-[#630ed4]"><ShoppingBag size={18} /></div>
                  <div>
                    <p className="text-sm font-black text-[#1d1a24]">ORD-{trx.id.substring(0, 6).toUpperCase()}</p>
                    <p className="text-[10px] font-medium text-[#7b7487]">{new Date(trx.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#1d1a24]">Rp {trx.total_harga.toLocaleString('id-ID')}</p>
                  <span className="text-[9px] font-bold text-[#059669] bg-[#ecfdf5] px-2 py-0.5 rounded border border-[#a7f3d0]">SELESAI</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}