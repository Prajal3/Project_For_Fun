import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
    let token;
    try {
        token = jwt.sign({userId}, JWT_SECRET_KEY,{
            expiresIn:'4d',
        })
        res.cookies('jwt', token, {

            maxAge:4*24*60*60*1000, // 4 days
            httpOnly:true,
            sameSite:"strict",
          secure: process.env.NODE_ENV !== "development"
        })
         
        return token;   
    } 
    
    catch (error) {
       console.log("Error generating token:", error);
        res.status(500).json({ message: "Internal server Error!!" })
        
    }
    return token;
}
