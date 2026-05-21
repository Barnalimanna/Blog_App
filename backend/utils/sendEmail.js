// const nodemailer = require('nodemailer');

// const sendEmail = async({ email, subject, message }) => {
//     const transporter = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: false,
//         family: 4,
//         auth:{
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//         },
//         connectionTimeout: 20000,
//         greetingTimeout: 20000,
//         socketTimeout: 20000,
//     });

//     await transporter.sendMail({
//         from: `"Post Nest" <${process.env.EMAIL_USER}>`,
//         to: email,
//         subject,
//         html: message,
//     });
// };

// module.exports = sendEmail;


// const nodemailer = require('nodemailer');

// const sendEmail = async ({ email, subject, message }) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT),
//     secure: false,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//     connectionTimeout: 10000,
//     greetingTimeout: 10000,
//     socketTimeout: 10000,
//   });

//   await transporter.sendMail({
//     from: `"Post Nest" <${process.env.SMTP_USER}>`,
//     to: email,
//     subject,
//     html: message,
//   });
// };

// module.exports = sendEmail;

const axios = require('axios');

const sendEmail = async ({ email, subject, message }) => {

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',

    {
      sender: {
        name: 'PostNest',
        email: process.env.EMAIL_USER,
      },

      to: [
        {
          email: email,
        },
      ],

      subject: subject,

      htmlContent: message,
    },

    {
      headers: {
        accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
    }
  );
};

module.exports = sendEmail;