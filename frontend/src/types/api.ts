/**
 * @file api.ts
 * @description Definisi tipe data (TypeScript interfaces) untuk kontrak API e-Samsat Aceh.
 */

// ==========================================
// ENDPOINT 1: CEK PAJAK KENDARAAN
// ==========================================

export interface CekPajakRequest {
  nik: string;
  nopolAngka: string;
  nopolSeri: string;
  noRangkaLast5: string;
}

export interface Kendaraan {
  nomorPolisi: string;
  nik: string;
  jenis: string;
  merek: string;
  model: string;
  tahun: number;
  warna: string;
  masaBerlakuStnk: string;
  tanggalJatuhTempo: string;
}

export interface Pajak {
  pkb: number;
  opsenPkb: number;
  dendaPkb: number;
  dendaOpsenPkb: number;
  swdkllj: number;
  DendaSwdkllj: number;
  biayaAdminStnkPlat: number;
  total: number;
}

export interface CekPajakResponse {
  success: boolean;
  message: string;
  data?: {
    /**
     * 1 = Positif: Tampilkan semua data, user belum bayar, bisa generate kode bayar.
     * 2 = Negatif: Tampilkan data, tapi tombol generate kode bayar mati/hilang (karena sudah dibayar).
     * 3 = Negatif: Jangan tampilkan data (karena input tidak valid / data tidak ditemukan).
     */
    statusCode: 1 | 2 | 3;
    statusText: string;
    deskripsi?: string;
    kendaraan?: Kendaraan;
    pajak?: Pajak;
  };
}

export interface KodeBayarResponse {
  success: boolean;
  message: string;
  data?: {
    kodeBayar: string;
  };
}

// ==========================================
// ENDPOINT 2: CEK STATUS PEMBAYARAN (SSE)
// ==========================================

/**
 * Data event yang dikirimkan server melalui Server-Sent Events (SSE)
 * ketika status pembayaran telah berhasil / berubah.
 */
export interface PaymentStatusEventData {
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  tanggalBayar?: string;
  lokasiPembayaran?: string;
  metodePembayaran?: string;
  nomorReferensi?: string;
  totalDibayar?: number;
  message: string;
}

// ==========================================
// ENDPOINT 3: LOKASI E-SAMSAT ACEH
// ==========================================

export interface SamsatLocation {
  /** Jenis samsat: statis (Samsat Induk/MPP) atau mobile (Samsat Keliling) */
  type: 'STATIC' | 'MOBILE';
  nama: string;
  
  // -- Khusus type: 'STATIC' --
  alamat?: string;
  
  // -- Khusus type: 'MOBILE' --
  hariOperasi?: string;
  jadwalOperasi?: string;
  tempatOperasi?: string; // Lokasi real-time
  
  latitude?: number;
  longitude?: number;
}

export interface SamsatLocationResponse {
  success: boolean;
  message: string;
  data: SamsatLocation[];
}