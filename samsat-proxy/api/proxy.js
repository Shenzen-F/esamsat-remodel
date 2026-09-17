export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // 1. Set CORS headers untuk SEMUA request (termasuk OPTIONS preflight)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 2. Tangani preflight request (OPTIONS) dari browser
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Ambil path dari query parameter
  const targetPath = req.query.path || '';
  const targetUrl = `https://api.samsatdigital.net${targetPath.startsWith('/') ? '' : '/'}${targetPath}`;

  try {
    // 4. Siapkan body - bisa berupa string atau object
    let bodyContent = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (typeof req.body === 'string') {
        bodyContent = req.body;
      } else if (req.body && typeof req.body === 'object') {
        bodyContent = JSON.stringify(req.body);
      }
    }

    // 5. Forward request ke API Samsat yang asli
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyContent,
    });

    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Proxy Error', error: error.message });
  }
}
