Note :
1. Munculkan name_samsat, name_sub_branch,address, latitude, longitude, office_hours
2. buat icon green untuk is_open_now: true and red untuk is_open_now: false
3. munculkan jadwal hari ini dari data : 
```bash
{
"today_schedule": 
    {
        "day": "Senin - Kamis",
        "opening": "08:30",
        "closing": "15:00"
    },
    "metadata": {
        "updated_at": "2026-09-29T02:17:32.543Z"
    }
}
```

4. Jika salah satu respon closures tidak sama dengan null, maka munculkan pesan dari reason dari isi closures :
```bash
{
                    "type": "mobile",
                    "id_sub_branch": "68fa7954-afb0-4e64-bde5-4f0401def686",
                    "name_sub_branch": "Samsat Jempol 02 Lhokseumawe",
                    "closures": [
                        {
                            "date": "2026-09-29",
                            "reason": "Server Maintenance",
                            "is_closed": true
                        }
                    ],
                    "schedule": [
                        {
                            "day": "Senin dan Jumat",
                            "address": "Dokter Kopi, Jl. Cunda, Banda Sakti, Lhokseumawe",
                            "latitude": "5.175585764896054",
                            "longitude": "97.12579442992866"
                        },
                        {
                            "day": "Selasa, Rabu dan Kamis",
                            "address": "D'Royal Cofee Space, Jl. Pase, Mon Geudong, Kec. Banda Sakti, Kota Lhokseumawe, Aceh",
                            "latitude": "5.176614244100757",
                            "longitude": "97.13987808650796"
                        }
                    ],
                    "office_hours": [
                        {
                            "day": "Senin - Kamis",
                            "opening": "08:30",
                            "closing": "15:00"
                        },
                        {
                            "day": "Jumat - Sabtu",
                            "opening": "08:30",
                            "closing": "12:00"
                        }
                    ],
                    "is_open_now": false,
                    "active_closure": {
                        "date": "2026-09-29",
                        "reason": "Server Maintenance",
                        "is_closed": true
                    },
                    "today_schedule": null,
                    "active_location_today": null
                }
```

5. buat filter by samkel, mpp, jempol, kantor samsat, samsat gampong
6. buat action button on link map by value latitude, longitude (buka google maps sesuai lokasi)
7. analisa tampilan untuk lebih interaktif dan mudah user memahami nya
