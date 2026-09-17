export default async function handler(req, res) {
  // 1. Tangani preflight request (OPTIONS) dari browser
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Bisa diubah ke 'https://shenzen-f.github.io' untuk lebih aman
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    return res.status(200).end();
  }

  // 2. Ambil path dari URL aslinya
  // Contoh: Jika proxy kita dipanggil dengan /api/proxy?path=/sb/inq/sod/info
  // Maka targetUrl = https://api.samsatdigital.net/sb/inq/sod/info
  const targetPath = req.query.path || '';
  const targetUrl = `https://api.samsatdigital.net${targetPath}`;

  try {
    // 3. Forward request ke API Samsat yang asli
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
      // Jangan mengirim body jika method-nya GET atau HEAD
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    };

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json().catch(() => ({}));

    // 4. Set CORS header di response agar tidak diblokir browser
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    
    return res.status(response.status).json(data);
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    return res.status(500).json({ success: false, message: 'Proxy Error', error: error.message });
  }
}
