import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = parseInt(process.env.PORT || '3000', 10);

// E-Mail-Transporter konfigurieren
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  pool: true,
  maxConnections: 1,
  maxMessages: 5,
  logger: true,
  debug: true
});

// Teste die E-Mail-Verbindung beim Start
transporter.verify(function(error, success) {
  if (error) {
    console.error('E-Mail-Server-Fehler:', error);
    console.error('SMTP-Konfiguration:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.EMAIL_FROM
    });
  } else {
    console.log('E-Mail-Server ist bereit');
  }
});

// Health Check Endpoint
app.get('/api/health-check', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// E-Mail-Versand Endpoint
app.post('/api/send-failure-email', async (req, res) => {
  try {
    const { recipient, customMessage, customSubject } = req.body;

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: recipient,
      subject: customSubject,
      text: customMessage,
      html: `<p>${customMessage}</p>`
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Server is accessible at http://172.20.10.3:${port}`);
}); 