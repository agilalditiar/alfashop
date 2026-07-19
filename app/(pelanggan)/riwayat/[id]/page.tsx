'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RiwayatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  
  // Unwrap the params promise using React.use()
  const resolvedParams = use(params);

  useEffect(() => {
    // Kita gunakan API /nota/[id] yang sudah ada untuk mengambil detail pesanan
    fetch(`/nota/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setOrder(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="bg-[#fef7ff] min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#7c3aed]">progress_activity</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#fef7ff] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-[#ccc3d8] mb-4">search_off</span>
        <h1 className="text-2xl font-bold text-[#1d1a24] mb-2">Pesanan Tidak Ditemukan</h1>
        <p className="text-[#4a4455] mb-6">Maaf, data pesanan yang Anda cari tidak ada atau sudah dihapus.</p>
        <button onClick={() => router.back()} className="bg-[#630ed4] text-white px-6 py-3 rounded-xl font-semibold">
          Kembali ke Riwayat
        </button>
      </div>
    );
  }

  const isWaiting = order.status === 'Menunggu' || order.status === 'Proses';
  const isCompleted = order.status === 'Selesai';
  const isCanceled = order.status === 'Dibatalkan' || order.status === 'Batal';
  const dateStr = order.created_at ? new Date(order.created_at).toLocaleString('id-ID', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  }) : '';

  let statusBg = 'bg-[#eaddff]';
  let statusText = 'text-[#25005a]';
  let statusIcon = '';

  if (isWaiting) {
    statusBg = 'bg-[#ffdcc6]';
    statusText = 'text-[#713700]';
  } else if (isCompleted) {
    statusBg = 'bg-[#e8dfee]';
    statusText = 'text-[#4a4455]';
    statusIcon = 'check_circle';
  } else if (isCanceled) {
    statusBg = 'bg-[#ffdad6]';
    statusText = 'text-[#93000a]';
    statusIcon = 'cancel';
  }

  return (
    <div className="bg-[#fef7ff] text-[#1d1a24] min-h-screen flex flex-col pb-10 pt-16">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full flex items-center px-6 h-16 bg-white/80 backdrop-blur-md border-b border-[#ffe4e6] shadow-[0_4px_20px_rgba(124,58,237,0.03)] z-50">
        <button onClick={() => router.back()} className="text-[#7c3aed] hover:bg-[#fff1f2] transition-colors rounded-full p-2 active:scale-95 flex items-center justify-center mr-4">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="font-['Plus_Jakarta_Sans'] font-bold tracking-tight text-xl text-[#1d1a24]">
          Detail Pesanan
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 md:px-20 py-10 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-[#ccc3d8] overflow-hidden">
          {/* Header Card */}
          <div className="p-6 border-b border-[#ccc3d8] bg-[#f9f1ff]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h2 className="text-sm font-medium text-[#7b7487]">ID Pesanan</h2>
                <div className="text-xl font-bold text-[#1d1a24]">#AS-{order.id.toString().padStart(4, '0')}</div>
              </div>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full ${statusBg} ${statusText} text-sm font-medium`}>
                {statusIcon && <span className="material-symbols-outlined text-[16px] mr-1.5">{statusIcon}</span>}
                {!statusIcon && <span className="w-2 h-2 rounded-full bg-current mr-2"></span>}
                {order.status}
              </span>
            </div>
            <div className="flex items-center text-[#4a4455] text-sm gap-2">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              {dateStr}
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b border-[#ccc3d8]">
            <h3 className="font-semibold text-[#1d1a24] mb-4 text-lg">Informasi Pelanggan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[#7b7487] mb-1">Nama Pemesan</div>
                <div className="font-medium">{order.nama_pelanggan || '-'}</div>
              </div>
              <div>
                <div className="text-[#7b7487] mb-1">Nomor WhatsApp</div>
                <div className="font-medium">{order.whatsapp || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-[#7b7487] mb-1">Catatan Tambahan</div>
                <div className="font-medium">{order.catatan || 'Tidak ada catatan'}</div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b border-[#ccc3d8]">
            <h3 className="font-semibold text-[#1d1a24] mb-4 text-lg">Daftar Belanjaan</h3>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f3ebfa] text-[#630ed4] flex items-center justify-center font-bold text-sm shrink-0">
                        {item.jumlah || item.qty}x
                      </div>
                      <div>
                        <div className="font-medium text-[#1d1a24]">{item.nama_produk}</div>
                        <div className="text-sm text-[#7b7487]">Rp {(item.subtotal / (item.jumlah || item.qty)).toLocaleString('id-ID')} / item</div>
                      </div>
                    </div>
                    <div className="font-semibold text-[#1d1a24]">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[#7b7487] text-sm">Tidak ada detail barang</div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="p-6 bg-[#fef7ff]">
            <div className="flex justify-between items-center text-lg">
              <div className="font-semibold text-[#4a4455]">Total Belanja</div>
              <div className="font-bold text-[#630ed4] text-xl">
                Rp {order.total_harga?.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>

        {/* Print Receipt Button */}
        <div className="mt-6 flex justify-end">
          <Link href={`/nota?id=${order.id}`} className="flex items-center gap-2 bg-[#630ed4] hover:bg-[#732ee4] text-white px-6 py-3 rounded-xl font-semibold transition-colors active:scale-95">
            <span className="material-symbols-outlined">receipt_long</span>
            Cetak Struk
          </Link>
        </div>
      </main>
    </div>
  );
}
