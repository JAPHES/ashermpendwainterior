const nodemailer = require('nodemailer');

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass }
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { name, email, subject, message, phone } = req.body || {};

  if (!name || !email || !message) {
    res.status(400).send('Missing required fields');
    return;
  }

  const smtpConfig = getSmtpConfig();
  if (!smtpConfig) {
    res.status(500).send('Email service is not configured');
    return;
  }

  const transporter = nodemailer.createTransport(smtpConfig);
  const to = process.env.CONTACT_TO || 'ashermpendwa051@gmail.com';
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    subject ? `Subject: ${subject}` : null,
    '',
    message
  ].filter(Boolean).join('\n');

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: subject ? `Contact: ${subject}` : 'New contact form message',
      text
    });
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Failed to send message');
  }
};
