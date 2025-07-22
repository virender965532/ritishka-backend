const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
    const { subject, html } = req.body;
    const to = process.env.MAIL_TO || "ritishkasilver@gmail.com";

    if (!subject || !html) {
        return res.status(400).json({ success: false, message: "Subject and html are required." });
    }

    try {
        // Configure transporter (example uses Gmail, adjust as needed)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject,
            html
        });

        res.json({ success: true, message: "Email sent successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send email.", error: error.message });
    }
});

module.exports = router;