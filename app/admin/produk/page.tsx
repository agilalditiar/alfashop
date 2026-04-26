'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, UploadCloud, Search, Trash2, Edit, PackageOpen, Image as ImageIcon, Loader2 } from 'lucide-react';

// DAFTAR KATEGORI
const DAFTAR_KATEGORI = [
  'Beras & Sembako',
  'Minuman',
  'Makanan Ringan',
  'Mie & Instan',
  'Sabun & Deterjen',
  'Bumbu Dapur',
  'Lainnya'
];

export default function ManajemenProdukPage() {
  const [produkList, setProdukList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // STATE BARU: Filter Kategori
  const [filterKategori, setFilterKategori] = useState('Semua Kategori');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pesanNotif, setPesanNotif] = useState<{jenis: 'sukses' | 'error', teks: string} | null>(null);

  const [formData, setFormData] = useState({
    nama_produk: '',
    kategori: 'Lainnya', // Field kategori baru
    harga: '',
    satuan: 'Ecer',
    gambar_url: '', 
    deskripsi: ''
  });

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('produk').select('*').order('created_at', { ascending: false });
    setProdukList(data || []);
    setIsLoading(false);
  };

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setPesanNotif({ jenis: 'error', teks: 'Ukuran file terlalu besar! Maksimal 2MB.' });
      return;
    }

    setIsUploadingFoto(true);
    setPesanNotif(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('produk-images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('produk-images').getPublicUrl(filePath);
      setFormData({ ...formData, gambar_url: data.publicUrl });
      
    } catch (error: any) {
      setPesanNotif({ jenis: 'error', teks: `Gagal mengunggah foto: ${error.message}` });
    } finally {
      setIsUploadingFoto(false);
    }
  };

  const handleEditClick = (produk: any) => {
    setEditingId(produk.id);
    setFormData({
      nama_produk: produk.nama_produk,
      kategori: produk.kategori || 'Lainnya', // Ambil kategori
      harga: produk.harga.toString(),
      satuan: produk.satuan,
      gambar_url: produk.gambar_url || '',
      deskripsi: produk.deskripsi || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('productName')?.focus();
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanNotif(null);

    if (!formData.nama_produk || !formData.harga) {
      setPesanNotif({ jenis: 'error', teks: 'Nama dan Harga Produk wajib diisi!' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        nama_produk: formData.nama_produk,
        kategori: formData.kategori, // Masukkan kategori ke payload
        harga: parseInt(formData.harga),
        satuan: formData.satuan,
        gambar_url: formData.gambar_url || null,
      };
      if (formData.deskripsi) payload.deskripsi = formData.deskripsi;

      if (editingId) {
        const { data, error } = await supabase.from('produk').update(payload).eq('id', editingId).select();
        if (error) throw error;
        
        if (data) {
          setProdukList(produkList.map(p => p.id === editingId ? data[0] : p));
          setPesanNotif({ jenis: 'sukses', teks: 'Perubahan produk berhasil disimpan! ✨' });
        }
      } else {
        payload.tersedia = true; 
        const { data, error } = await supabase.from('produk').insert([payload]).select();
        if (error) throw error;
        
        if (data) {
          setProdukList([data[0], ...produkList]); 
          setPesanNotif({ jenis: 'sukses', teks: 'Mantap! Produk baru berhasil ditambahkan. 🎉' });
        }
      }

      setFormData({ nama_produk: '', kategori: 'Lainnya', harga: '', satuan: 'Ecer', gambar_url: '', deskripsi: '' }); 
      setEditingId(null);
      setTimeout(() => setPesanNotif(null), 4000);

    } catch (err: any) {
      const detailError = err.message || JSON.stringify(err);
      setPesanNotif({ jenis: 'error', teks: `Ditolak oleh Supabase: ${detailError}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    const { error } = await supabase.from('produk').delete().eq('id', id);
    if (!error) {
      setProdukList(produkList.filter(p => p.id !== id));
      setPesanNotif({ jenis: 'sukses', teks: 'Produk berhasil dihapus.' });
      setTimeout(() => setPesanNotif(null), 3000);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from('produk').update({ tersedia: !currentStatus }).eq('id', id);
    if (!error) {
      setProdukList(produkList.map(p => p.id === id ? { ...p, tersedia: !currentStatus } : p));
    }
  };

  const handleCancel = () => {
    setFormData({ nama_produk: '', kategori: 'Lainnya', harga: '', satuan: 'Ecer', gambar_url: '', deskripsi: '' });
    setEditingId(null);
    setPesanNotif(null);
  };

  // LOGIKA DIPERBARUI: Filter Pencarian + Filter Kategori
  const filteredProduk = produkList.filter(p => {
    const matchSearch = p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori === 'Semua Kategori' ? true : p.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  return (
    <div className="bg-[#fef7ff] min-h-screen font-sans text-[#1d1a24] p-6 md:p-10">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-4 border-b border-[#ffe4e6] mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1d1a24] tracking-tight">Manajemen Produk</h2>
          <p className="text-sm font-medium text-[#7b7487] mt-1">Tambah barang baru dan kelola inventaris toko Anda.</p>
        </div>
        <button 
          onClick={() => { handleCancel(); document.getElementById('productName')?.focus(); }}
          className="bg-[#630ed4] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#732ee4] transition-all shadow-lg shadow-[#630ed4]/20 active:scale-95"
        >
          <Plus size={18} /> Tambah Baru
        </button>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        
        {/* Kolom Kiri: Unggah Foto */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#ffe4e6] shadow-[0_4px_20px_rgba(124,58,237,0.02)] flex flex-col">
          <h3 className="text-lg font-black text-[#1d1a24] mb-4">Foto Produk</h3>
          <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" ref={fileInputRef} onChange={handleUploadFoto} />
          <div onClick={() => !isUploadingFoto && fileInputRef.current?.click()} className={`flex-1 border-2 border-dashed ${formData.gambar_url ? 'border-transparent p-0' : 'border-[#ccc3d8] p-8'} rounded-xl bg-[#fef7ff] flex flex-col items-center justify-center hover:border-[#630ed4] transition-colors cursor-pointer group relative overflow-hidden min-h-[200px]`}>
            {isUploadingFoto ? (
              <div className="flex flex-col items-center text-[#630ed4]">
                <Loader2 size={32} className="animate-spin mb-3" />
                <p className="text-sm font-bold">Mengunggah Foto...</p>
              </div>
            ) : formData.gambar_url ? (
              <>
                <img src={formData.gambar_url} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <p className="text-white text-sm font-bold">Ubah Foto</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#f3ebfa] flex items-center justify-center mb-4 group-hover:bg-[#eaddff] transition-colors text-[#630ed4]"><UploadCloud size={32} /></div>
                <p className="text-sm font-bold text-[#1d1a24] text-center">Klik untuk pilih foto</p>
                <p className="text-[11px] font-medium text-[#7b7487] text-center mt-1">PNG, JPG (Maks. 2MB)</p>
              </>
            )}
          </div>
          {formData.gambar_url && !isUploadingFoto && (
            <button type="button" onClick={() => setFormData({...formData, gambar_url: ''})} className="mt-3 text-xs font-bold text-[#ba1a1a] hover:underline text-center w-full">Hapus Foto</button>
          )}
        </div>

        {/* Kolom Kanan: Form Detail Produk */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#ffe4e6] shadow-[0_4px_20px_rgba(124,58,237,0.02)] relative overflow-hidden">
          
          {editingId && (
            <div className="absolute top-0 right-0 bg-[#fef7ff] border-b border-l border-[#ffe4e6] px-4 py-1.5 rounded-bl-xl">
              <span className="text-[10px] font-black text-[#630ed4] uppercase tracking-widest flex items-center gap-1.5"><Edit size={12}/> Mode Edit</span>
            </div>
          )}

          <h3 className="text-lg font-black text-[#1d1a24] mb-4">
            {editingId ? 'Edit Detail Produk' : 'Detail Produk Baru'}
          </h3>
          
          {pesanNotif && (
            <div className={`p-4 mb-5 rounded-xl text-sm font-bold flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${pesanNotif.jenis === 'sukses' ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]' : 'bg-[#fff1f2] text-[#ba1a1a] border border-[#fecaca]'}`}>
              {pesanNotif.jenis === 'error' && <span className="mt-0.5">⚠️</span>}
              <p className="break-all">{pesanNotif.teks}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* NAMA PRODUK */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-[#1d1a24] mb-2" htmlFor="productName">Nama Produk</label>
              <input 
                id="productName" type="text" 
                value={formData.nama_produk} onChange={(e) => setFormData({...formData, nama_produk: e.target.value})}
                placeholder="cth. Beras Maknyuss 5kg" 
                className="w-full bg-[#fef7ff] border border-[#ffe4e6] rounded-xl px-4 py-3 text-sm font-bold text-[#1d1a24] focus:border-[#630ed4] outline-none"
              />
            </div>

            {/* KATEGORI (BARU) */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-bold text-[#1d1a24] mb-2" htmlFor="kategori">Kategori</label>
              <div className="relative">
                <select 
                  id="kategori" 
                  value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                  className="w-full appearance-none bg-[#fef7ff] border border-[#ffe4e6] rounded-xl px-4 py-3 text-sm font-bold text-[#1d1a24] focus:border-[#630ed4] outline-none"
                >
                  {DAFTAR_KATEGORI.map(kat => (
                    <option key={kat} value={kat}>{kat}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#7b7487]">▼</div>
              </div>
            </div>

            {/* HARGA JUAL */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-bold text-[#1d1a24] mb-2" htmlFor="price">Harga Jual</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7b7487] text-sm font-bold">Rp</span>
                <input 
                  id="price" type="number" 
                  value={formData.harga} onChange={(e) => setFormData({...formData, harga: e.target.value})}
                  placeholder="0" 
                  className="w-full bg-[#fef7ff] border border-[#ffe4e6] rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-[#1d1a24] focus:border-[#630ed4] outline-none"
                />
              </div>
            </div>

            {/* SATUAN */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-bold text-[#1d1a24] mb-2" htmlFor="unit">Satuan</label>
              <div className="relative">
                <select 
                  id="unit" 
                  value={formData.satuan} onChange={(e) => setFormData({...formData, satuan: e.target.value})}
                  className="w-full appearance-none bg-[#fef7ff] border border-[#ffe4e6] rounded-xl px-4 py-3 text-sm font-bold text-[#1d1a24] focus:border-[#630ed4] outline-none"
                >
                  <option value="Ecer">Ecer (Pcs)</option>
                  <option value="Renteng">Renteng</option>
                  <option value="Kardus">Kardus (Karton)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#7b7487]">▼</div>
              </div>
            </div>

            {/* DESKRIPSI */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-[#1d1a24] mb-2" htmlFor="description">Deskripsi (Opsional)</label>
              <textarea 
                id="description" rows={3}
                value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                placeholder="Tuliskan deskripsi singkat produk..." 
                className="w-full bg-[#fef7ff] border border-[#ffe4e6] rounded-xl px-4 py-3 text-sm font-medium text-[#1d1a24] focus:border-[#630ed4] outline-none resize-none"
              ></textarea>
            </div>

            {/* TOMBOL AKSI */}
            <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={handleCancel} className="px-6 py-3 rounded-xl text-sm font-bold text-[#7b7487] hover:bg-[#fff1f2] transition-colors">
                Batal
              </button>
              <button type="submit" disabled={isSubmitting || isUploadingFoto} className="bg-[#630ed4] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-[#732ee4] shadow-lg disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {editingId ? 'Simpan Perubahan' : 'Simpan Produk'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Bagian Tabel Inventaris */}
      <section className="bg-white rounded-3xl border border-[#ffe4e6] shadow-[0_4px_20px_rgba(124,58,237,0.02)] flex flex-col overflow-hidden">
        
        {/* HEADER TABEL DENGAN FILTER KATEGORI */}
        <div className="p-6 border-b border-[#ffe4e6] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#fef7ff]/50">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h3 className="text-lg font-black text-[#1d1a24] shrink-0">Daftar Inventaris</h3>
            {/* Dropdown Filter Kategori di Tabel */}
            <select 
              value={filterKategori} 
              onChange={e => setFilterKategori(e.target.value)} 
              className="bg-white border border-[#ffe4e6] rounded-full px-4 py-2 text-xs font-bold text-[#630ed4] outline-none shadow-sm cursor-pointer hover:border-[#630ed4] transition-colors"
            >
              <option value="Semua Kategori">Semua Kategori</option>
              {DAFTAR_KATEGORI.map(kat => (
                <option key={kat} value={kat}>{kat}</option>
              ))}
            </select>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ccc3d8]" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari produk..." className="w-full bg-white border border-[#ffe4e6] rounded-full pl-11 pr-4 py-2.5 text-sm font-bold text-[#1d1a24] focus:border-[#630ed4] outline-none shadow-sm" />
          </div>
        </div>

        <div className="divide-y divide-[#ffe4e6]/50">
          {isLoading ? (
            <div className="p-10 text-center text-[#ccc3d8] text-sm font-bold animate-pulse">Memuat daftar barang...</div>
          ) : filteredProduk.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <PackageOpen size={48} className="text-[#ccc3d8] mb-3" />
              <p className="text-sm font-medium text-[#7b7487]">Tidak ada produk ditemukan.</p>
            </div>
          ) : (
            filteredProduk.map((produk) => (
              <div key={produk.id} className={`p-4 px-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 transition-colors group ${produk.tersedia ? 'hover:bg-[#fef7ff]' : 'bg-[#fef7ff]/40 opacity-70 hover:opacity-100'} ${editingId === produk.id ? 'bg-[#f9f1ff] border-l-4 border-l-[#630ed4]' : 'border-l-4 border-l-transparent'}`}>
                
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-16 h-16 rounded-xl border border-[#ffe4e6] bg-[#f9f1ff] flex items-center justify-center overflow-hidden shrink-0">
                    {produk.gambar_url ? <img src={produk.gambar_url} alt={produk.nama_produk} className={`w-full h-full object-cover ${!produk.tersedia && 'grayscale-[50%]'}`} /> : <ImageIcon size={24} className="text-[#ccc3d8]" />}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#1d1a24] line-clamp-1">{produk.nama_produk}</h4>
                    {/* LABEL KATEGORI DI BAWAH NAMA */}
                    <p className="text-[10px] font-bold text-[#630ed4] bg-[#f3ebfa] inline-block px-2 py-0.5 rounded mt-1 uppercase tracking-wider">
                      {produk.kategori || 'Lainnya'} • {produk.satuan}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6">
                  <div className="text-left sm:text-right w-28">
                    <span className="text-sm font-black text-[#1d1a24]">Rp {produk.harga.toLocaleString('id-ID')}</span>
                  </div>
                  
                  {/* TOGGLE AKTIF/KOSONG */}
                  <div className="w-24 flex justify-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={produk.tersedia} onChange={() => handleToggleStatus(produk.id, produk.tersedia)} />
                      <div className="w-11 h-6 bg-[#dfd7e6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#ccc3d8] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]"></div>
                      <span className={`ml-3 text-[11px] font-bold uppercase tracking-wider ${produk.tersedia ? 'text-[#059669]' : 'text-[#7b7487]'}`}>{produk.tersedia ? 'Aktif' : 'Kosong'}</span>
                    </label>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditClick(produk)} 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors sm:opacity-0 group-hover:opacity-100 ${editingId === produk.id ? 'opacity-100 text-[#630ed4] bg-[#f3ebfa]' : 'text-[#ccc3d8] hover:text-[#630ed4] hover:bg-[#f3ebfa]'}`}
                      title="Edit Produk"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(produk.id)} 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[#ccc3d8] hover:text-[#ba1a1a] hover:bg-[#fff1f2] transition-colors sm:opacity-0 group-hover:opacity-100" 
                      title="Hapus Produk"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-[#ffe4e6] bg-[#fef7ff]/50 text-center">
          <p className="text-xs font-bold text-[#7b7487]">Menampilkan {filteredProduk.length} produk tersimpan</p>
        </div>
      </section>
    </div>
  );
}