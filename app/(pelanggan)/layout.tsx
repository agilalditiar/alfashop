'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, ShoppingCart, History, User, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PelangganLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [jumlahKeranjang, setJumlahKeranjang] = useState(0);

  // Fungsi untuk update angka di icon keranjang
  const updateBadge = () => {
    const data = JSON.parse(localStorage.getItem('keranjang') || '[]');
    setJumlahKeranjang(data.length);
  };

  useEffect(() => {
    updateBadge();
    // Cek setiap ada perubahan halaman atau storage
    window.addEventListener('storage', updateBadge);
    const interval = setInterval(updateBadge, 1000); 
    return () => {
      window.removeEventListener('storage', updateBadge);
      clearInterval(interval);
    };
  }, [pathname]);

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans text-[#191c1d]">
      
      {/* --- 1. NAVBAR ATAS (Statis) --- */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 max-w-[428px] mx-auto bg-white border-b border-[#cfc2d4]/30 shadow-sm">
        {pathname !== '/beranda' ? (
          <button onClick={() => window.history.back()} className="text-[#500088] p-2 rounded-full hover:bg-[#f3f4f5]">
            <ArrowLeft size={24} />
          </button>
        ) : (
          <div className="w-10"></div> 
        )}

        <h1 className="text-[18px] font-black text-[#500088] tracking-tight">AlfaShop</h1>
        
        <Link href="/profil" className={`p-2 rounded-full transition-all ${pathname === '/profil' ? 'bg-[#f1dbff] text-[#500088]' : 'text-[#4c4452]'}`}>
          <User size={24} />
        </Link>
      </header>

      {/* --- 2. AREA KONTEN TENAH (Dinamis) --- */}
      {/* pt-16 agar konten tidak tertutup navbar atas, pb-24 agar tidak tertutup menu bawah */}
      <main className="pt-16 pb-24 max-w-[428px] mx-auto min-h-screen">
        {children}
      </main>

      {/* --- 3. NAVIGASI BAWAH (Statis) --- */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-20 px-4 pb-safe max-w-[428px] mx-auto bg-white/80 backdrop-blur-md rounded-t-2xl shadow-[0px_-8px_24px_rgba(0,0,0,0.05)] border-t border-[#cfc2d4]/20">
        
        {/* Tab Beranda */}
        <Link href="/beranda" className={`flex flex-col items-center justify-center w-20 transition-all ${pathname === '/beranda' ? 'text-[#500088]' : 'text-[#7e7383]'}`}>
          <Home size={24} className="mb-1" strokeWidth={pathname === '/beranda' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Beranda</span>
        </Link>

        {/* Tab Keranjang */}
        <Link href="/checkout" className={`relative flex flex-col items-center justify-center w-20 transition-all ${pathname === '/checkout' ? 'text-[#500088]' : 'text-[#7e7383]'}`}>
          <div className="relative">
            <ShoppingCart size={24} className="mb-1" strokeWidth={pathname === '/checkout' ? 2.5 : 2} />
            {jumlahKeranjang > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#b4136d] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce">
                {jumlahKeranjang}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Keranjang</span>
        </Link>

        {/* Tab Riwayat */}
        <Link href="/riwayat" className={`flex flex-col items-center justify-center w-20 transition-all ${pathname === '/riwayat' ? 'text-[#500088]' : 'text-[#7e7383]'}`}>
          <History size={24} className="mb-1" strokeWidth={pathname === '/riwayat' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Riwayat</span>
        </Link>

      </nav>

    </div>
  );
}