'use client';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function PesananSuksesPage() {
  const router = useRouter();

  // Opsi: Hilangkan halaman ini dari riwayat tombol "Back" (agar user tidak bisa back ke halaman sukses)
  useEffect(() => {
    // Anda bisa menambahkan confetti atau efek suara sukses di sini jika mau
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Decorative Ambient Background (Animasi Blobs) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#eaddff] rounded-full mix-blend-multiply blur-[80px] animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#ffdcc6] rounded-full mix-blend-multiply blur-[60px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        
        {/* Icon Container with Glow */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#630ed4]/20 rounded-full blur-2xl transform scale-110"></div>
          <div className="relative bg-[#ede5f4] w-28 h-28 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(124,58,237,0.1)] border border-[#e8dfee]">
            <CheckCircle2 size={56} className="text-[#630ed4]" strokeWidth={2.5} />
          </div>
        </div>

        {/* Typography */}
        <h1 className="text-3xl font-black text-[#1d1a24] tracking-tight mb-3">
          Pesanan Berhasil
        </h1>
        <p className="text-sm font-medium text-[#4d4546] mb-10 px-4">
          Admin sedang menyiapkan barang Anda. Silakan siapkan uang tunai.
        </p>

        {/* Primary Action Button */}
        <button 
          onClick={() => router.push('/')}
          className="w-full bg-[#630ed4] text-white py-4 px-6 rounded-full text-sm font-bold shadow-[0_4px_20px_rgba(99,14,212,0.2)] hover:bg-[#732ee4] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
        >
          Kembali ke Beranda <ArrowRight size={18} />
        </button>

        {/* Footer Note */}
        <div className="mt-8 pt-8 border-t border-[#ccc3d8]/30 w-full flex justify-center opacity-60">
          <span className="text-[10px] font-bold text-[#7b7487] uppercase tracking-widest">AlfaShop Secure Order</span>
        </div>

      </div>
    </div>
  );
}