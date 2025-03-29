import nodemailer from "nodemailer";

const EMAIL = process.env.EMAIL_USER;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: EMAIL,
    // pass: 'xmhcwafcdcysclsb',
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (
  username,
  email,
  otp
) => {
  await transporter.sendMail({
    from: `Tanay <${EMAIL}>`,
    to: email,
    subject: "Verify your email address",
    html: `<h1>Welcome, ${username}</h1></br><h2>${otp}</h2>`
  });
};

export default sendVerificationEmail;