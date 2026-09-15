/**
 * @file api.ts
 * @description Definisi tipe data (TypeScript interfaces) untuk kontrak API e-Samsat Aceh.
 */

// ==========================================
// ENDPOINT 1: CEK PAJAK KENDARAAN
// ==========================================

export interface CekPajakRequest {
  nopol: string;
  nik: string;
  rangka_last5: string;
}

export interface Kendaraan {
  nopol: string;
  nik: string;
  jenis: string;
  merek: string;
  model: string;
  tipe: string;
  tahun: string; // the spec says "2007" which is string or number, let's use string
  warna: string;
  sdStnk: string;
  sdNotice: string;
}

export interface Pajak {
  pkb: number;
  opkb: number;
  dpkb: number;
  odpkb: number;
  swd: number;
  dswd: number;
  total: number;
  tglTtp: string;
  sdNoticeYad: string;
}

export interface RiwayatPembayaran {
  tanggalBayar: string;
  lokasiPembayaran: string;
  metodePembayaran: string;
  noReff: string;
  total: number;
}

export interface CekPajakResponse {
  success: boolean;
  message: string;
  data?: {
    statusCode: 1 | 2 | 3;
    statusText: string;
    deskripsi?: string;
    kendaraan?: Kendaraan;
    pajak?: Pajak;
    noReff?: string;
    riwayatPembayaran?: RiwayatPembayaran[];
  };
}

export interface KodeBayarResponse {
  success: boolean;
  message: string;
  data?: {
    kd_bayar: string;
    sse_subsribe: string;
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