'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, History, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function PelangganLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cart = useCartStore((state) => state.cart);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('alfaShopUser');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="bg-[#1d1a24] h-[100dvh] flex justify-center font-sans overflow-hidden">
      <div className="w-full max-w-md bg-[#fef7ff] h-full relative shadow-2xl flex flex-col">
        
        {/* HEADER */}
        <header className="relative shrink-0 bg-white/90 backdrop-blur-md border-b border-[#ffe4e6] z-50 flex justify-between items-center px-6 h-16">
          <Link href="/" className="text-2xl font-black text-[#7c3aed] tracking-tighter cursor-pointer">
            AlfaShop
          </Link>
          
          {/* TOMBOL LOGIN (Sudah diperkuat anti-macet) */}
          <Link 
            href="/login" 
            className="relative z-[999] flex items-center justify-center hover:bg-[#fff1f2] p-2 rounded-full transition-all active:scale-95 cursor-pointer pointer-events-auto"
          >
            {userData ? (
              <div className="w-8 h-8 rounded-full bg-[#eaddff] text-[#630ed4] flex items-center justify-center font-bold text-xs border border-[#ccc3d8]">
                {userData?.name?.substring(0, 2).toUpperCase() || 'US'}
              </div>
            ) : (
              <User size={24} className="text-[#7c3aed]" />
            )}
          </Link>
        </header>

        {/* KONTEN UTAMA */}
        <main className="flex-1 overflow-y-auto hide-scrollbar bg-[#fef7ff] relative z-10">
          {children}
        </main>
        
        {/* NAVIGASI BAWAH (Gembok dilepas, pasti muncul!) */}
        <nav className="relative shrink-0 bg-white/95 backdrop-blur-lg border-t border-[#ffe4e6] z-50 flex justify-around items-center px-4 h-20 shadow-[0_-4px_20px_rgba(124,58,237,0.05)]">
          <Link href="/" className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all active:scale-95 ${pathname === '/' ? 'bg-[#fff1f2] text-[#7c3aed]' : 'text-[#7b7487] hover:text-[#7c3aed]'}`}>
            <Home size={24} strokeWidth={pathname === '/' ? 2.5 : 2} className="mb-1" />
            <span className="text-[11px] font-semibold">Beranda</span>
          </Link>
          
          <Link href="/checkout" className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all active:scale-95 ${pathname === '/checkout' ? 'bg-[#fff1f2] text-[#7c3aed]' : 'text-[#7b7487] hover:text-[#7c3aed]'}`}>
            <div className="relative">
              <ShoppingCart size={24} strokeWidth={pathname === '/checkout' ? 2.5 : 2} className="mb-1" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#fb7185] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                  {cart.length}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold">Keranjang</span>
          </Link>
          
          <Link href="/riwayat" className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all active:scale-95 ${pathname === '/riwayat' ? 'bg-[#fff1f2] text-[#7c3aed]' : 'text-[#7b7487] hover:text-[#7c3aed]'}`}>
            <History size={24} strokeWidth={pathname === '/riwayat' ? 2.5 : 2} className="mb-1" />
            <span className="text-[11px] font-semibold">Riwayat</span>
          </Link>
        </nav>

      </div>
    </div>
  );
}