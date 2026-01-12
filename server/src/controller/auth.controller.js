import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import { generateToken } from "../utils/generateTokken.js";
import sendOtp from "../lib/nodemailer.js";

// Temp storage for pending signup
const pendingUsers = new Map();

// SIGNUP
export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(13);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create username (moved before using it)
    const username = email.split("@")[0];

    // Generate the OTP
    const verifyOtp = Math.floor(100000 + Math.random() * 900000);
    const verifyOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    pendingUsers.set(email, {
      fullname,
      email,
      username,
      hashedPassword,
      verifyOtp,
      verifyOtpExpiry,
    });

    // Send the OTP to user email
    await sendOtp(email, verifyOtp);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email for verification",
    });
  } catch (error) {
    console.log("SignUp Error:", error.message);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check pending user
    const pendingUser = pendingUsers.get(email);
    if (!pendingUser) {
      return res.status(400).json({ message: "No pending signup found or already verified" });
    }

    // Validate OTP
    if (pendingUser.verifyOtp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP!!" });
    }

    // Fixed: verifyOtpExpiry instead of verifyOtpExpireAT
    if (pendingUser.verifyOtpExpiry < Date.now()) {
      pendingUsers.delete(email);
      return res.status(400).json({ message: "OTP Expired!!" });
    }

    // Create user in database
    const newUser = await User.create({
      fullname: pendingUser.fullname,
      email: pendingUser.email,
      username: pendingUser.username,
      password: pendingUser.hashedPassword,
      isAccountVerified: true,
    });

    // Cleanup pending user
    pendingUsers.delete(email);

    // Generate token and respond
    const token = generateToken(newUser._id, res);

    res.status(200).json({
      success: true,
      message: "OTP verified and account created successfully",
      _id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullname,
      token,
    });
  } catch (error) {
    console.log("VerifyOtp Error:", error.message);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { password, email } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials!!" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid Credentials!!" });
    }

    const token = generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullname,
      username: user.username,
      token,
    });
  } catch (error) {
    console.log("LogIn Error:", error);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Logout Error:", error);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found!!" });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000);
    const resetOtpExpireAt = Date.now() + 10 * 60 * 1000;

    user.resetOtp = resetOtp;
    user.reSetOtpExpireAT = resetOtpExpireAt;
    await user.save();
    await sendOtp(email, resetOtp);

    res.status(200).json({
      message: "OTP sent to your email",
      data: { email, resetOtp },
    });
  } catch (error) {
    console.log("ForgotPassword Error:", error);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};
