export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const webhook = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhook) return res.status(503).json({ message: 'Contact storage is not configured.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const required = ['fullname', 'email', 'country', 'mobile', 'message'];
    if (required.some((key) => !String(body[key] || '').trim())) {
      return res.status(400).json({ message: 'Please complete all required fields.' });
    }

    const payload = new URLSearchParams();
    required.forEach((key) => payload.set(key, String(body[key]).trim()));
    payload.set('submitted_at', new Date().toISOString());

    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: payload.toString(),
    });

    if (!response.ok) return res.status(502).json({ message: 'Google Sheet submission failed.' });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact submission failed:', error);
    return res.status(500).json({ message: 'Unable to save your message right now.' });
  }
}
