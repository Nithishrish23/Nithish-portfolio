const DEFAULT_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyCfnbqSww4O3Ab_Yn2qmBv8wU4R3cgSlL9Aib7wG2Xjejscsq2Kv6KcN2Xg5RzBb_9qQ/exec';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const required = ['fullname', 'email', 'country', 'mobile', 'message'];

    if (required.some((key) => !String(body[key] || '').trim())) {
      return res.status(400).json({ message: 'Please complete all required fields.' });
    }

    // Vercel environment variable is preferred; the deployed Apps Script endpoint
    // is kept as a fallback so the contact form never redirects to a mail client.
    const webhook = process.env.GOOGLE_SHEET_WEBHOOK_URL || DEFAULT_WEBHOOK;

    const payload = new URLSearchParams();
    required.forEach((key) => payload.set(key, String(body[key]).trim()));
    payload.set('submitted_at', new Date().toISOString());

    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: payload.toString(),
    });

    if (!response.ok) {
      return res.status(502).json({ message: 'Google Sheets storage is temporarily unavailable.' });
    }

    return res.status(200).json({ success: true, message: 'Message saved successfully.' });
  } catch (error) {
    console.error('Contact submission failed:', error);
    return res.status(500).json({ message: 'Unable to save your message right now.' });
  }
}
