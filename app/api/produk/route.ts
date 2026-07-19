import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql'; // Pastikan path ini sesuai dengan koneksi MySQL kamu

export const dynamic = 'force-dynamic'; // Mencegah cache agresif Next.js

// 1. GET: Ambil daftar semua produk
export async function GET(request: Request) {
  try {
    const produk: any = await query(`
      SELECT p.*, k.nilai_diskon AS promo_nominal 
      FROM produk p 
      LEFT JOIN kupon k 
        ON k.produk_id = p.id 
        AND k.aktif = 1 
        AND k.tipe_diskon = 'nominal' 
        AND (k.berlaku_sampai IS NULL OR k.berlaku_sampai >= NOW())
        AND (k.kuota IS NULL OR k.digunakan < k.kuota)
      ORDER BY p.id DESC
    `);
    
    // Karena MySQL kadang mengembalikan TINYINT (0/1) untuk boolean, kita pastikan formatnya true/false untuk frontend
    const formattedProduk = produk.map((p: any) => {
      const isPromo = !!p.promo_nominal;
      const hargaAsli = p.harga;
      const hargaDiskon = isPromo ? Math.max(0, hargaAsli - p.promo_nominal) : hargaAsli;
      
      return {
        ...p,
        tersedia: p.tersedia === 1 || p.tersedia === true,
        harga_asli: hargaAsli,
        harga: hargaDiskon,
        is_promo: isPromo
      };
    });

    return NextResponse.json(formattedProduk);
  } catch (error: any) {
    console.error("🔥 Error GET Produk:", error.message);
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 });
  }
}

// 2. POST: Tambah produk baru
export async function POST(request: Request) {
  try {
    const data = await request.json();
    // 🔥 UPDATE: Tangkap data stok dari frontend
    const { nama_produk, kategori, harga, satuan, stok, gambar_url, deskripsi, tersedia } = data;

    // MySQL menggunakan 1 untuk true, 0 untuk false
    const statusTersedia = tersedia ? 1 : 0;
    const nilaiStok = parseInt(stok) || 0; // Pastikan stok berformat angka

    const result: any = await query(
      `INSERT INTO produk (nama_produk, kategori, harga, satuan, stok, gambar_url, deskripsi, tersedia) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama_produk, kategori, harga, satuan, nilaiStok, gambar_url, deskripsi, statusTersedia]
    );

    // Ambil kembali data yang baru di-insert untuk dikembalikan ke frontend
    const newProduct: any = await query('SELECT * FROM produk WHERE id = ?', [result.insertId]);
    
    const responseData = {
      ...newProduct[0],
      tersedia: newProduct[0].tersedia === 1
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("🔥 Error POST Produk:", error.message);
    return NextResponse.json({ error: 'Gagal menyimpan produk baru' }, { status: 500 });
  }
}

// 3. PUT: Update produk (Bisa untuk Edit Detail ATAU Toggle Aktif/Kosong)
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    // 🔥 UPDATE: Tangkap data stok dari frontend
    const { id, nama_produk, kategori, harga, satuan, stok, gambar_url, deskripsi, tersedia } = data;

    if (!id) return NextResponse.json({ error: 'ID produk wajib ada' }, { status: 400 });

    const statusTersedia = tersedia ? 1 : 0;
    const nilaiStok = parseInt(stok) || 0; // Pastikan stok berformat angka

    await query(
      `UPDATE produk SET 
       nama_produk = ?, kategori = ?, harga = ?, satuan = ?, stok = ?, gambar_url = ?, deskripsi = ?, tersedia = ? 
       WHERE id = ?`,
      [nama_produk, kategori, harga, satuan, nilaiStok, gambar_url, deskripsi, statusTersedia, id]
    );

    // Ambil data yang sudah di-update
    const updatedProduct: any = await query('SELECT * FROM produk WHERE id = ?', [id]);
    
    const responseData = {
      ...updatedProduct[0],
      tersedia: updatedProduct[0].tersedia === 1
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("🔥 Error PUT Produk:", error.message);
    return NextResponse.json({ error: 'Gagal mengupdate produk' }, { status: 500 });
  }
}

// 4. DELETE: Hapus produk dari database
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID produk tidak ditemukan' }, { status: 400 });

    await query('DELETE FROM produk WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error: any) {
    console.error("🔥 Error DELETE Produk:", error.message);
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 });
  }
}