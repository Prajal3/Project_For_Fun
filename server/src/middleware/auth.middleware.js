import User from "../model/user.model.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if(req.cookies?.token){
        token = req.cookies.tolen;
    }

    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }

    if(!token){
         res.status(401).json({
            success:false,
            message:"Not authorized. No token provided.",
         })
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if(!decoded?.userId){
        return res.status(401).json({
            success:false,
            message:"Invalid token or expired token.",
        })

    }


    const user = await User.findById(decoded.userId).select("-passwoed");
    if(!user){
        return res.status(401).json({
            success:false,
            message:"User not foud."
        })
    }


    req.user = user;
    next();





  } catch (error) {
    console.error(" Error in auth middleware:", error);
    return res.status(500).json({
      success: false,
      message:
        error.name == "TokenExpiredError"
          ? "Session expired.Please Login again."
          : "Authentication failed. Please Login again.",
    });
  }
};

export default authMiddleware;
