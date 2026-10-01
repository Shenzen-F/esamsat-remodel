## Spesifikasi API ESAMSAT ACEH

**Pembaruan Terakhir:** 14 September 2026

### Lingkungan (Environments)
- **Base URL:** `https://api.samsatdigital.net`
- **SSE URL (Production):** `https://notify.samsatdigital.net/sse/streams?id={sse_subsribe}`

---

## 1. Dapatkan Info Pajak (Inquiry)

Mengambil informasi pajak kendaraan dan status pembayaran berdasarkan nomor polisi, NIK, dan 5 digit terakhir nomor rangka.

- **Endpoint:** `/sb/inq/sod/info`
- **Method:** `POST` *(Diperkirakan dari body request)*
- **Content-Type:** `application/json`

### Body Request

| Field          | Tipe     | Wajib    | Deskripsi                                        |
| :------------- | :------- | :------- | :----------------------------------------------- |
| `nopol`        | `string` | Ya       | Nomor Polisi kendaraan                           |
| `nik`          | `string` | Ya       | Nomor Induk Kependudukan                         |
| `rangka_last5` | `string` | Ya       | 5 digit terakhir dari nomor rangka kendaraan     |

#### Contoh Request
```json
{
    "nopol": "BL4217NI",
    "nik": "1173025311710001",
    "rangka_last5": "48955"
}
```

### Response

#### 🟢 Respons Sukses (Kendaraan Bisa Melakukan Pembayaran Online)
Dikembalikan saat data kendaraan sesuai dan memenuhi syarat untuk pembayaran pajak online.

- **statusCode:** `1`

```json
{
    "success": true,
    "message": "OK",
    "data": {
        "statusCode": 1,
        "statusText": "OK",
        "deskripsi": "Kendaraan Bisa Melakukan Pembayaran Online",
        "kendaraan": {
            "nopol": "BL4217NI",
            "nik": "1173025311710001",
            "jenis": "SOLO",
            "merek": "HONDA",
            "model": "SEPEDA MOTOR",
            "tipe": "NF125 TR",
            "tahun": "2007",
            "warna": "HITAM",
            "sdStnk": "2028-09-11",
            "sdNotice": "2026-09-11"
        },
        "pajak": {
            "pkb": 93000,
            "opkb": 61300,
            "dpkb": 1000,
            "odpkb": 700,
            "swd": 35000,
            "dswd": 8000,
            "total": 199000,
            "tglTtp": "2026-09-14",
            "sdNoticeYad": "2027-09-11"
        },
        "noReff": "w6hgYdF4wc0c9Nr4ChfV",
        "riwayatPembayaran": [
            {
                "tanggalBayar": "2025-09-08",
                "lokasiPembayaran": "KAB. ACEH UTARA",
                "metodePembayaran": "cash",
                "noReff": "0025914",
                "total": 189600
            },
            {
                "tanggalBayar": "2024-08-29",
                "lokasiPembayaran": "Samkel SK01 BANDA ACEH",
                "metodePembayaran": "cash",
                "noReff": "0014680",
                "total": 189500
            }
        ]
    }
}
```

#### 🔴 Respons Error 1 (Validasi Pembayaran)
Dikembalikan saat kendaraan tidak memenuhi syarat untuk pembayaran online (misalnya, masuk masa ganti pelat 5 tahunan).

- **statusCode:** `2`

```json
{
    "success": false,
    "message": "Validasi Pembayaran",
    "data": {
        "statusCode": 2,
        "statusText": "Validasi Pembayaran",
        "deskripsi": "kendaraan tidak bisa melakukan pembayaran pajak online karena sudah masuk masa ganti plat 5 tahunan, silahkan ke kantor samsat UPTD wilayah kab/kota asal kendaraan",
        "kendaraan": {
            "nopol": "BL8298VC",
            "nik": "1115040112750001",
            "jenis": "MOBIL BARANG",
            "merek": "MITSUBISHI",
            "model": "DOUBLE CABIN",
            "tipe": "TRITON 2.5L DC EXCEED (4X4) M/T",
            "tahun": "2016",
            "warna": "HITAM MIKA",
            "sdStnk": "2026-09-11",
            "sdNotice": "2026-09-11"
        },
        "riwayatPembayaran": [
            {
                "tanggalBayar": "2025-09-08",
                "lokasiPembayaran": "KAB. NAGAN RAYA",
                "metodePembayaran": "cash",
                "noReff": "0011284",
                "total": 4395100
            },
            {
                "tanggalBayar": "2024-09-10",
                "lokasiPembayaran": "KAB. NAGAN RAYA",
                "metodePembayaran": "cash",
                "noReff": "0010984",
                "total": 4394500
            }
        ]
    }
}
```

#### 🔴 Respons Error 2 (Data Tidak Ditemukan / Tidak Sesuai)
Dikembalikan saat data yang dimasukkan tidak cocok atau kendaraan tidak ditemukan di database.

- **statusCode:** `3`

```json
{
    "success": false,
    "message": "Data not found",
    "data": {
        "statusCode": 3,
        "statusText": "Data Kendaraan Tidak Sesuai / Pastikan Nomor Polisi, 5 Digit Terakhir No. Rangka dan NIK Sudah Benar"
    }
}
```

---

## 2. Generate Kode Bayar

Menghasilkan kode bayar (`kd_bayar`) yang diperlukan untuk melanjutkan transaksi online. Memerlukan `no_reff` yang valid dari permintaan Info Pajak (Inquiry) yang berhasil.

- **Endpoint:** `/sb/inq/sod/kode_bayar`
- **Method:** `POST` *(Diperkirakan dari body request)*
- **Content-Type:** `application/json`

### Body Request

| Field          | Tipe     | Wajib    | Deskripsi                                        |
| :------------- | :------- | :------- | :----------------------------------------------- |
| `nopol`        | `string` | Ya       | Nomor Polisi kendaraan                           |
| `nik`          | `string` | Ya       | Nomor Induk Kependudukan                         |
| `rangka_last5` | `string` | Ya       | 5 digit terakhir dari nomor rangka kendaraan     |
| `no_reff`      | `string` | Ya       | Nomor referensi yang didapat dari endpoint Info  |

#### Contoh Request
```json
{
    "nopol": "BL4217NI",
    "nik": "1173025311710001",
    "rangka_last5": "48955",
    "no_reff": "w6hgYdF4wc0c9Nr4ChfV"
}
```

### Response

#### 🟢 Respons Sukses (Kode bayar berhasil dibuat)

```json
{
    "success": true,
    "message": "Kode bayar generated",
    "data": {
        "kd_bayar": "8125473399598",
        "sse_subsribe": "once-s-8125473399598"
    }
}
```

#### 🔴 Respons Error (no_reff tidak ditemukan)
Dikembalikan saat `no_reff` tidak valid, salah, atau telah kedaluwarsa.

```json
{
    "success": false,
    "message": "no_reff value is not found, please try again to inquery info endpoint first",
    "data": null
}
```

