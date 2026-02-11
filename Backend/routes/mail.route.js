const router = require('express').Router();


const {sendMail} = require('../services/mail.service');

router.post('/send', async (req, res) => {
    try {
        const {to, subject, message} = req.body;
        if(!to || !subject || !message) {
            return res.status(400).send('All fields are required');
        }
        
        await sendMail({to, subject, message});
        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send email');
    }
}); 

module.exports = router;