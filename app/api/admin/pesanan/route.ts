import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql'; // Path koneksi MySQL kamu

export const dynamic = 'force-dynamic'; // Cegah Next.js melakukan caching pada data ini

// METHOD GET: Mengambil daftar pesanan dan detail barangnya
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const pesananData: any = await query('SELECT * FROM pesanan WHERE id = ?', [id]);
      if (pesananData.length === 0) {
        return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
      }

      const order = pesananData[0];
      const detailData: any = await query(`
        SELECT dp.pesanan_id, dp.jumlah as quantity, p.nama_produk as name, p.harga as price, p.gambar_url as gambar
        FROM detail_pesanan dp
        JOIN produk p ON dp.produk_id = p.id
        WHERE dp.pesanan_id = ?
      `, [id]);

      order.item_pesanan = detailData;
      return NextResponse.json(order);
    }

    // 1. Ambil semua pesanan dari database
    const pesananData: any = await query('SELECT * FROM pesanan ORDER BY created_at DESC');

    // 2. Ambil detail pesanan dan gabungkan (JOIN) dengan tabel produk untuk dapat nama & harga
    const detailData: any = await query(`
      SELECT dp.pesanan_id, dp.jumlah as quantity, p.nama_produk as name, p.harga as price 
      FROM detail_pesanan dp
      JOIN produk p ON dp.produk_id = p.id
    `);

    // 3. Gabungkan data detail ke dalam masing-masing pesanan
    const result = pesananData.map((order: any) => {
      return {
        ...order,
        // Cari barang-barang yang sesuai dengan pesanan_id
        item_pesanan: detailData.filter((detail: any) => detail.pesanan_id === order.id)
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("🔥 Error API Get Pesanan:", error.message);
    return NextResponse.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 });
  }
}

// METHOD PATCH: Untuk mengubah status pesanan (Menunggu -> Diproses -> Selesai)
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID dan Status wajib dikirim' }, { status: 400 });
    }

    // Update status di MySQL
    await query('UPDATE pesanan SET status = ? WHERE id = ?', [status, id]);

    return NextResponse.json({ success: true, message: `Status pesanan ${id} berhasil diupdate jadi ${status}` });
  } catch (error: any) {
    console.error("🔥 Error API Update Status Pesanan:", error.message);
    return NextResponse.json({ error: 'Gagal update status pesanan' }, { status: 500 });
  }
}