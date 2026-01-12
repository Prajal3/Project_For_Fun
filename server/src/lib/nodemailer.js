import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth:{
       user: process.env.SMPT_USER,
       pass: process.env.SMPT_PASSWORD,
    }
});

const sendOtp = async (email, otp) => {

    const mailOptions ={
        from: process.env.SENDER_EMAIL,
        to:email,
        subject:"OTP Verification",
        text:`Your OTP for verification is ${otp}. Please don't share it with anyone.`
    }

     try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

export default sendOtp;