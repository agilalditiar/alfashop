'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cartStore';
import { Search, Package, Clock, CheckCircle2, ReceiptText, X, ShoppingCart, ChevronRight } from 'lucide-react';

export default function RiwayatPesananPage() {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('alfaShopUser');
    let phoneToSearch = '';
    if (user) {
      const parsedUser = JSON.parse(user);
      phoneToSearch = parsedUser.phone || ''; 
      setSearchPhone(phoneToSearch);
    }
    fetchOrders(phoneToSearch);
  }, []);

  const fetchOrders = async (phone: string) => {
    setIsLoading(true);
    let query = supabase.from('pesanan').select('*').order('created_at', { ascending: false });
    if (phone) query = query.ilike('whatsapp', `%${phone}%`);
    const { data } = await query;
    setOrders(data || []);
    setIsLoading(false);
  };

  const handleBeliLagi = (order: any) => {
    order.item_pesanan.forEach((item: any) => {
      addToCart({
        id: item.id,
        nama_produk: item.name,
        harga: item.price,
        satuan: item.type,
        gambar_url: '', 
        qty: item.quantity
      });
    });
    setSelectedOrder(null);
    router.push('/checkout');
  };

  const getStatusConfig = (status: string) => {
    if (status === 'Menunggu') return { bg: 'bg-[#fffbeb]', text: 'text-[#d97706]', icon: <Clock size={12} /> };
    if (status === 'Diproses') return { bg: 'bg-[#eff6ff]', text: 'text-[#2563eb]', icon: <Package size={12} /> };
    return { bg: 'bg-[#ecfdf5]', text: 'text-[#059669]', icon: <CheckCircle2 size={12} /> };
  };

  return (
    <div className="px-5 pt-6 max-w-md mx-auto font-sans pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1d1a24] tracking-tight mb-1">Riwayat Pesanan</h1>
        <p className="text-sm font-medium text-[#7b7487]">Lacak dan beli ulang kebutuhan Anda.</p>
      </div>

      {/* Form Lacak Manual */}
      <form onSubmit={(e) => { e.preventDefault(); fetchOrders(searchPhone); }} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(124,58,237,0.03)] border border-[#ffe4e6] p-4 mb-6">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-3 text-[#ccc3d8]" />
          <input 
            type="tel" value={searchPhone || ''} onChange={(e) => setSearchPhone(e.target.value)} 
            placeholder="Lacak nomor WA lain..." 
            className="w-full pl-10 pr-20 py-3 rounded-xl border border-[#ccc3d8] bg-[#fef7ff] focus:border-[#7c3aed] outline-none text-sm font-medium" 
          />
          <button type="submit" className="absolute right-1.5 bg-[#7c3aed] text-white rounded-lg px-3 py-2 text-xs font-bold active:scale-95 transition-all">Cari</button>
        </div>
      </form>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(n => <div key={n} className="bg-white rounded-2xl border border-[#ffe4e6] p-4 animate-pulse h-32"></div>)
        ) : orders.length === 0 ? (
          
          /* ========================================== */
          /* TAMPILAN JIKA RIWAYAT KOSONG (EMPTY STATE) */
          /* ========================================== */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-3xl border border-[#ffe4e6] shadow-[0_4px_20px_rgba(124,58,237,0.02)] mt-8">
            <div className="w-24 h-24 bg-[#fef7ff] rounded-full flex items-center justify-center mb-6 border-4 border-[#fff1f2] shadow-inner">
              <ReceiptText size={40} className="text-[#d2bbff]" />
            </div>
            <h3 className="text-lg font-black text-[#1d1a24] mb-2">Belum Ada Riwayat</h3>
            <p className="text-sm font-medium text-[#7b7487] mb-8 leading-relaxed">
              Sepertinya Anda belum pernah melakukan pemesanan. Yuk, lengkapi kebutuhan dapur Anda!
            </p>
            <button 
              onClick={() => router.push('/')}
              className="bg-[#630ed4] text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-lg shadow-[#630ed4]/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <ShoppingCart size={18} /> Mulai Belanja
            </button>
          </div>
          /* ========================================== */

        ) : (
          orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const shortId = `AS-${order.id.substring(0, 4).toUpperCase()}`;
            const date = new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            
            return (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-2xl shadow-sm border border-[#ffe4e6] p-4 hover:border-[#d2bbff] transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#7b7487] uppercase tracking-widest">{shortId} • {date}</span>
                    <h3 className="text-sm font-bold text-[#1d1a24] mt-0.5 flex items-center gap-1">
                      {order.item_pesanan[0].name} {order.item_pesanan.length > 1 && `+${order.item_pesanan.length - 1} lainnya`}
                      <ChevronRight size={14} className="text-[#ccc3d8] group-hover:translate-x-1 transition-transform" />
                    </h3>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.icon} {order.status}
                  </span>
                </div>
                <div className="text-sm font-black text-[#7c3aed]">Rp {order.total_harga.toLocaleString('id-ID')}</div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DETAIL PESANAN */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1d1a24]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header Modal */}
            <div className="p-6 border-b border-[#f3ebfa] flex justify-between items-center bg-[#fef7ff]">
              <div>
                <h3 className="text-lg font-black text-[#1d1a24]">Detail Pesanan</h3>
                <p className="text-xs font-bold text-[#7c3aed]">AS-{selectedOrder.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white rounded-full text-[#7b7487] shadow-sm border border-[#ffe4e6] active:scale-90 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Isi Modal */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#7b7487] uppercase tracking-widest border-b border-[#f3ebfa] pb-2">Daftar Barang</p>
                {selectedOrder.item_pesanan.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#1d1a24]">{item.name}</span>
                      <span className="text-xs font-medium text-[#7b7487]">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</span>
                    </div>
                    <span className="text-sm font-black text-[#1d1a24]">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
                
                <div className="mt-6 pt-4 border-t border-dashed border-[#ccc3d8] space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[#7b7487]">
                    <span>Alamat Kirim</span>
                    <span className="text-right text-[#1d1a24]">{selectedOrder.alamat}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-[#1d1a24] pt-2">
                    <span>Total Bayar</span>
                    <span className="text-[#630ed4] text-lg">Rp {selectedOrder.total_harga.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Aksi Modal */}
            <div className="p-6 bg-white border-t border-[#f3ebfa] grid grid-cols-2 gap-3">
              <a 
                href={`https://wa.me/6287728450708?text=Halo%20Admin,%20saya%20ingin%20tanya%20pesanan%20AS-${selectedOrder.id.substring(0,4)}`}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-[#ccc3d8] text-sm font-bold text-[#4a4455] hover:bg-[#fef7ff] transition-all active:scale-95"
              >
                Tanya Admin
              </a>
              <button 
                onClick={() => handleBeliLagi(selectedOrder)}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#7c3aed] text-white text-sm font-bold shadow-[0_8px_20px_rgba(124,58,237,0.2)] hover:bg-[#630ed4] transition-all active:scale-95"
              >
                <ShoppingCart size={18} /> Beli Lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}