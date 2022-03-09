const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "mailhost.X.com", // hostname
  secure: false, // use SSL
  port: 25, // port for secure SMTP
  tls: {
      rejectUnauthorized: false
  }
})

module.exports = transporter;