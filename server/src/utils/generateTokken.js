import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
  try {
    // Fixed: process.env.JWT_SECRET_KEY instead of undefined JWT_SECRET_KEY
    const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: '4d',
    });
    
    // Fixed: res.cookie instead of res.cookies
    res.cookie('jwt', token, {
      maxAge: 4 * 24 * 60 * 60 * 1000, // 4 days
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development"
    });

    return token;
  } catch (error) {
    console.log("Error generating token:", error);
    throw error; // Throw error to be handled by caller
  }
};