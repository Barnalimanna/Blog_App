const nodemailer = require('nodemailer');

const sendEmail = async({ email, subject, message }) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        family: 4,
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 20000,
    });

    await transporter.sendMail({
        from: `"Post Nest" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: message,
    });
};

module.exports = sendEmail;