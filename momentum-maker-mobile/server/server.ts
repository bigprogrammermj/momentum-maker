import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// E-Mail-Transporter konfigurieren
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Endpoint zum Senden der "Versagens"-E-Mail
app.post('/api/send-failure-email', async (req, res) => {
  try {
    const { recipient, reason } = req.body;

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: recipient,
      subject: 'Momentum Maker - Wake Up Failure!',
      text: `You failed to wake up on time! This email has been sent because you ${reason}.\n\n` +
            'Time to face the consequences of your actions!\n\n' +
            'Best regards,\n' +
            'Your Momentum Maker',
      html: `
        <h1>Wake Up Failure!</h1>
        <p>You failed to wake up on time! This email has been sent because you ${reason}.</p>
        <p>Time to face the consequences of your actions!</p>
        <p>Best regards,<br>Your Momentum Maker</p>
      `,
    });

    console.log('Email sent:', info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 