'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, ShoppingCart, BarChart3, Menu, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-[#fef7ff] text-[#1d1a24] font-sans">
      
      {/* ========================================== */}
      {/* SIDEBAR (Kiri - Tetap)                     */}
      {/* ========================================== */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#ffffff] border-r border-[#e8dfee] shadow-2xl shadow-[#630ed4]/5 hidden md:flex flex-col py-6">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-bold shadow-md">
            AA
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#630ed4]">Admin Anis</h2>
            <p className="text-xs font-medium text-[#4a4455]">AlfaShop Manager</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto">
          <Link href="/admin" className={`mx-2 my-1 px-4 py-3 flex items-center gap-3 text-sm rounded-lg transition-all ${pathname === '/admin' ? 'bg-[#630ed4]/10 text-[#630ed4] font-semibold' : 'text-[#4a4455] font-medium hover:bg-[#e8dfee]/50'}`}>
            <LayoutDashboard size={20} className={pathname === '/admin' ? 'fill-[#630ed4]/20' : ''} /> Dashboard
          </Link>
          <Link href="/admin/produk" className={`mx-2 my-1 px-4 py-3 flex items-center gap-3 text-sm rounded-lg transition-all ${pathname.includes('/admin/produk') ? 'bg-[#630ed4]/10 text-[#630ed4] font-semibold' : 'text-[#4a4455] font-medium hover:bg-[#e8dfee]/50'}`}>
            <Package size={20} className={pathname.includes('/admin/produk') ? 'fill-[#630ed4]/20' : ''} /> Kelola Produk
          </Link>
          <Link href="/admin/pesanan" className={`mx-2 my-1 px-4 py-3 flex items-center gap-3 text-sm rounded-lg transition-all ${pathname.includes('/admin/pesanan') ? 'bg-[#630ed4]/10 text-[#630ed4] font-semibold' : 'text-[#4a4455] font-medium hover:bg-[#e8dfee]/50'}`}>
            <ShoppingBag size={20} className={pathname.includes('/admin/pesanan') ? 'fill-[#630ed4]/20' : ''} /> Pesanan Online
          </Link>
          <Link href="/admin/kasir" className={`mx-2 my-1 px-4 py-3 flex items-center gap-3 text-sm rounded-lg transition-all ${pathname.includes('/admin/kasir') ? 'bg-[#630ed4]/10 text-[#630ed4] font-semibold' : 'text-[#4a4455] font-medium hover:bg-[#e8dfee]/50'}`}>
            <ShoppingCart size={20} className={pathname.includes('/admin/kasir') ? 'fill-[#630ed4]/20' : ''} /> Kasir Offline
          </Link>
          <Link href="/admin/laporan" className={`mx-2 my-1 px-4 py-3 flex items-center gap-3 text-sm rounded-lg transition-all ${pathname.includes('/admin/laporan') ? 'bg-[#630ed4]/10 text-[#630ed4] font-semibold' : 'text-[#4a4455] font-medium hover:bg-[#e8dfee]/50'}`}>
            <BarChart3 size={20} className={pathname.includes('/admin/laporan') ? 'fill-[#630ed4]/20' : ''} /> Laporan & Analitik
          </Link>
        </nav>
      </aside>

      {/* ========================================== */}
      {/* AREA KANAN (Isi Konten & Header)           */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        
        {/* HEADER (Menempel di atas tanpa menimpa konten) */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 h-20 bg-[#ffffff]/80 backdrop-blur-md border-b border-[#e8dfee]">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-[#630ed4] hover:bg-[#e8dfee] p-2 rounded-full">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-[#630ed4]">
              {pathname === '/admin' ? 'Admin Dashboard' : 
               pathname.includes('produk') ? 'Manajemen Produk' :
               pathname.includes('pesanan') ? 'Pesanan Masuk' :
               pathname.includes('kasir') ? 'Kasir POS' :
               pathname.includes('laporan') ? 'Laporan & Analitik' : 'AlfaShop'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="text-[#4a4455] hover:text-[#ba1a1a] transition-colors flex items-center gap-2 text-sm font-semibold">
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs font-bold shadow-sm">
              AA
            </div>
          </div>
        </header>

        {/* ANAK HALAMAN (Dashboard, Produk, Laporan, dll) */}
        <div className="flex-1">
          {children}
        </div>

      </div>
    </div>
  );
}