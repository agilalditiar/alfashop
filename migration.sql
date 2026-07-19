-- ============================================================
-- ALFASHOP - SQL MIGRATION (Fitur Admin Baru)
-- Jalankan file ini di phpMyAdmin → Tab SQL
-- ============================================================

-- 1. Tabel Voucher / Kupon Diskon
CREATE TABLE IF NOT EXISTS `voucher` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode` VARCHAR(50) NOT NULL UNIQUE,
  `jenis` ENUM('persen','nominal') NOT NULL DEFAULT 'persen',
  `nilai` INT NOT NULL COMMENT 'Persentase atau Nominal potongan',
  `min_belanja` INT DEFAULT 0 COMMENT 'Minimal total belanja agar voucher berlaku',
  `max_diskon` INT DEFAULT NULL COMMENT 'Batas maksimal diskon (khusus jenis persen)',
  `kuota` INT DEFAULT NULL COMMENT 'NULL = tidak terbatas',
  `digunakan` INT DEFAULT 0 COMMENT 'Berapa kali sudah dipakai',
  `aktif` TINYINT(1) DEFAULT 1,
  `berlaku_sampai` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Banner / Slider Halaman Utama
CREATE TABLE IF NOT EXISTS `banner` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `judul` VARCHAR(100) DEFAULT NULL,
  `gambar_url` LONGTEXT NOT NULL COMMENT 'Base64 atau URL gambar',
  `link_url` VARCHAR(255) DEFAULT NULL,
  `urutan` INT DEFAULT 0,
  `aktif` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tambah kolom baru ke tabel pengaturan (yang sudah ada)
ALTER TABLE `pengaturan`
  ADD COLUMN IF NOT EXISTS `ongkir` INT DEFAULT 0 COMMENT 'Biaya ongkos kirim standar (Rp)',
  ADD COLUMN IF NOT EXISTS `no_rekening` VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `nama_bank` VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `whatsapp_admin` VARCHAR(20) DEFAULT NULL COMMENT 'Nomor WA admin penerima notifikasi',
  ADD COLUMN IF NOT EXISTS `nama_toko` VARCHAR(100) DEFAULT 'AlfaShop',
  ADD COLUMN IF NOT EXISTS `alamat_toko` TEXT DEFAULT NULL;

-- 4. Tambah kolom ke tabel pesanan untuk mencatat diskon voucher
ALTER TABLE `pesanan`
  ADD COLUMN IF NOT EXISTS `kode_voucher` VARCHAR(50) DEFAULT NULL COMMENT 'Kode voucher yang dipakai',
  ADD COLUMN IF NOT EXISTS `potongan_harga` INT DEFAULT 0 COMMENT 'Nominal potongan harga dari voucher';

