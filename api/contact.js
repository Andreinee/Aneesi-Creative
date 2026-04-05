// Aneesi Creative — Contact Form API
// Vercel serverless function — POST /api/contact

const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass) {
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Aneesi Creative Website" <${user}>`,
    to: 'aneesicreative@gmail.com',
    replyTo: email,
    subject: `New project enquiry from ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#E8193C;">New Enquiry — Aneesi Creative</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;font-weight:bold;width:100px;">Name</td><td>${name}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;">Phone</td><td>${phone || '—'}</td></tr>
        </table>
        <hr style="margin:20px 0;border-color:#eee;" />
        <p style="font-weight:bold;">Message</p>
        <p style="white-space:pre-wrap;">${message}</p>
      </div>
    `,
  });

  return res.status(200).json({ success: true });
};
