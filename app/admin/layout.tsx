'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Calculator, HelpCircle, LogOut, Lightbulb, Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // SATPAM: Cek tiket resmi dari Supabase
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Jika tidak ada tiket, tendang ke halaman login utama
        router.replace('/login');
      } else {
        // Jika ada tiket, silakan masuk
        setIsReady(true);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    if (window.confirm('Keluar dari panel admin?')) {
      // Hapus tiket resmi dari Supabase
      await supabase.auth.signOut();
      router.push('/login');
    }
  };

  // Layar Loading saat mengecek identitas
  if (!isReady) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#fef7ff] text-[#630ed4]">
        <Loader2 size={36} className="animate-spin mb-4" />
        <p className="font-bold text-sm text-[#1d1a24]">Memeriksa Akses...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#fef7ff] text-[#1d1a24] min-h-screen flex antialiased font-sans">
      
      {/* SideNavBar (Desktop Fixed) */}
      <aside className="bg-white font-sans text-sm fixed left-0 h-screen w-64 border-r border-[#e8dfee] flex flex-col p-4 gap-2 z-50">
        
        {/* Header Logo */}
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#630ed4]/10 flex items-center justify-center">
            <Lightbulb className="text-[#630ed4]" size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-[#630ed4] text-xl tracking-tight">AlfaShop</h1>
            <p className="text-[#4a4455] text-xs font-medium">Management Suite</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-2">
          {[
            { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
            { name: 'Products', href: '/admin/produk', icon: Package },
            { name: 'Orders', href: '/admin/pesanan', icon: ShoppingCart },
            { name: 'POS', href: '/admin/kasir', icon: Calculator },
          ].map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                pathname === item.href || (pathname === '/admin' && item.href === '/admin') 
                  ? 'text-[#630ed4] bg-[#fff1f2] font-bold shadow-sm' 
                  : 'text-[#7b7487] hover:text-[#630ed4] hover:bg-[#f9f1ff]'
              }`}
            >
              <item.icon size={20} strokeWidth={pathname === item.href ? 2.5 : 2} />
              <span className="font-semibold">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Links */}
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-[#e8dfee]">
          <button className="flex items-center gap-3 px-4 py-3 text-[#7b7487] hover:text-[#630ed4] hover:bg-[#f9f1ff] rounded-lg transition-all text-left">
            <HelpCircle size={20} />
            <span className="font-semibold">Help Center</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-[#7b7487] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-all text-left">
            <LogOut size={20} />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 lg:p-10 flex flex-col gap-8 min-h-screen">
        {children}
      </main>

    </div>
  );
}