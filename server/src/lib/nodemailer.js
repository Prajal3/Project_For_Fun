import nodemailer from 'nodemailer';

const sendOtp = async (email, otp) => {
    // Debug logging
    console.log('Environment check:');
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***exists***' : 'MISSING');
    console.log('SENDER_EMAIL:', process.env.SENDER_EMAIL);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error('ERROR: SMTP credentials are missing from environment variables');
        throw new Error('SMTP credentials not configured');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        }
    });

    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "OTP Verification",
        text: `Your OTP for verification is ${otp}. Please don't share it with anyone.`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

export default sendOtp;