'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState('');

  const handleAuthAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const button = e.currentTarget;
    button.style.pointerEvents = 'none';
    button.style.opacity = '0.8';
    
    setToastMessage('Mengarahkan ke halaman Login...');
    
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="bg-[#fef7ff] font-sans text-[#1d1a24] min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#7c3aed] selection:text-white">
      <div className="absolute w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(124,58,237,0.03)_0%,rgba(254,247,255,0)_70%)] top-[-20%] left-1/2 -translate-x-1/2 z-0 pointer-events-none"></div>
      
      {/* Navigation */}
      <nav className="w-full relative z-10 px-4 md:px-20 py-10 flex justify-between items-center max-w-7xl mx-auto">
        <a className="font-bold text-[#7c3aed] text-[28px] tracking-tight hover:opacity-80 transition-opacity" href="#">
            AlfaShop
        </a>
        <button 
          className="bg-[#7c3aed] text-white font-semibold px-10 py-4 rounded-lg hover:bg-[#732ee4] active:scale-95 transition-all duration-200 shadow-sm" 
          onClick={handleAuthAction}
        >
            Login
        </button>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center relative z-10 w-full max-w-7xl mx-auto px-4 md:px-20 pb-16">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mt-16 mb-16 pt-16 max-w-4xl mx-auto">
          <div className="w-full mb-16 rounded-xl overflow-hidden shadow-sm">
            <img 
              alt="Fresh organic vegetables and fruits in an elegant wooden crate" 
              className="w-full h-auto object-cover aspect-[16/9] rounded-xl" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6cfIGHqTudqGHuRfFMM7C2htUw43WN7HOxG4D2aNQTDTE3trxsBSmuArfei52FsOK2uq9OJied3qyR71abCbX01Uol2w62Jfj0dc5WczQcisNebKH8In1e4m3LHF-t4zsNuOmaY-sqkHT0BmUHgsA0JSeF3zTFYi14qk1dvlb9iQn9p9oY0l6kXwXGXjD-kjwP2VNzjCF3Zi_c3rGmJEqTnM19w4jaVZ2rHn_FlQwvrClrdUZjgUdrll5Osv_w3ARq7fPtDTUJEZ4"
            />
          </div>
          <h1 className="text-[48px] font-bold text-[#1d1a24] mb-10 max-w-3xl leading-[1.1] tracking-[-0.02em]">
              Penuhi Kebutuhan Dapurmu dengan Lebih Elegan & Praktis
          </h1>
          <p className="text-[18px] text-[#7b7487] mb-16 max-w-2xl px-6 leading-[1.6]">
              Solusi belanja harian yang dirancang untuk kenyamanan Anda. Nikmati pengalaman berbelanja bahan segar premium tanpa harus melangkah keluar rumah.
          </p>
          <button 
            className="bg-[#7c3aed] text-white font-semibold px-16 py-6 rounded-lg text-lg shadow-[0_8px_20px_-6px_rgba(124,58,237,0.3)] hover:shadow-[0_12px_24px_-8px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300" 
            onClick={handleAuthAction}
          >
              Mulai Pesan Sekarang
          </button>
        </section>

        {/* Value Proposition Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full mt-16 pt-16">
          {/* Card 1 */}
          <div className="bg-white border border-[#e8dfee] rounded-xl p-10 flex flex-col items-start shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_-6px_rgba(124,58,237,0.06)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-full mb-10 rounded-lg overflow-hidden">
              <img alt="Person using a smartphone to order groceries" className="w-full h-48 object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpAIoGrh4tUg_PelngJZoJnoFHrMA8YEdk-r-W6Ncf7ONRd9Tok6Z5R7dge0XsyIa4aaVOmshj295-auTn_Q8VZWWyNU8-RJW57qgFX8qukEtvLoRJKsUQ321ax8uBrxpO0mRQYR4wIUQD0ZVjydLT9Cd0EHbuM1LXpZdgcPtcO-lmjyvHQ4rbCMEO6lauRrD5uxES71fxP6C7s5QXkoEodCzU-ie5pJF3II42tRhpEjn2_zL5Sm9iYoPYdpaV37B-u692xv7kEC3L"/>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#f3ebfa] flex items-center justify-center mb-10">
              <span className="material-symbols-outlined text-[28px] text-[#a15100]">
                  schedule
              </span>
            </div>
            <h3 className="text-[24px] font-semibold text-[#1d1a24] mb-2 leading-[1.3]">
                Tanpa Antre
            </h3>
            <p className="text-[16px] text-[#7b7487] leading-relaxed">
                Pesan dari mana saja tanpa harus mengantre di toko. Waktu Anda terlalu berharga untuk dihabiskan dalam barisan.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#e8dfee] rounded-xl p-10 flex flex-col items-start shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_-6px_rgba(124,58,237,0.06)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-full mb-10 rounded-lg overflow-hidden">
              <img alt="Happy person receiving a delivery bag with groceries" className="w-full h-48 object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDy8oPl-Py-c3lNcEc5bRFh465V7_EdSVT9vBKyITBF-EPkzyJpborwGStwP7fsY44uPoAZ2WA7OzOC781mLKseSV2_ANfk1A4AhTKy8P79DlhwY1P722NFhc4MJVT0yoTZvYN9-4MD4eeN7C8TUSYezJZvHzn15-8lkw1FbcLdlcTA1_9kI6cAxtCkR3PJNUBvJ_eJCGM5clyrHQKiIjOZ9hQFxJoDJe7p-H5Z79MAdsjStLoVkMtP1xeACkcHN_rSNQElZsoo645"/>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#f3ebfa] flex items-center justify-center mb-10">
              <span className="material-symbols-outlined text-[28px] text-[#a15100]">
                  payments
              </span>
            </div>
            <h3 className="text-[24px] font-semibold text-[#1d1a24] mb-2 leading-[1.3]">
                Bayar di Tempat (COD)
            </h3>
            <p className="text-[16px] text-[#7b7487] leading-relaxed">
                Keamanan transaksi terjamin dengan sistem bayar di tempat. Bayar pesanan Anda hanya setelah barang sampai di tangan.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#e8dfee] rounded-xl p-10 flex flex-col items-start shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_-6px_rgba(124,58,237,0.06)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-full mb-10 rounded-lg overflow-hidden">
              <img alt="Premium quality food items on a marble countertop" className="w-full h-48 object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD3XRUQysURqCkfAN5l7yy4gVRvBPB1Oj_oEz1-wPJlg_fqrcUe1x6t2fhXDGGD14rvAaNZW0ItUyvFcufLp-BljMkH1ypPmfz_9-UpPkP6M-vwX8jSq1D3QFhOrcgHA-8OyRgRglF_w3oJVygOkjrYVa4UrCgz7U8DVIOvwzu0hDOYQzoOlP1ncBBEanC5r_-1hkUv_HqeC6d8PwYvuXBRer2KHT_SkaPUUacxB2G4WWIlpdmeEYA4AXc2E4ny8hCEM8Y7GoXEsH1"/>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#f3ebfa] flex items-center justify-center mb-10">
              <span className="material-symbols-outlined text-[28px] text-[#a15100]">
                  verified
              </span>
            </div>
            <h3 className="text-[24px] font-semibold text-[#1d1a24] mb-2 leading-[1.3]">
                Kualitas Terjamin
            </h3>
            <p className="text-[16px] text-[#7b7487] leading-relaxed">
                Kami hanya menyediakan produk segar dan berkualitas terbaik yang telah melewati proses seleksi ketat.
            </p>
          </div>
        </section>
      </main>

      {/* Toast Container */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toastMessage && (
          <div className="bg-[#332f39] text-white px-10 py-4 rounded-lg shadow-lg flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <span className="material-symbols-outlined text-[18px]">info</span>
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
