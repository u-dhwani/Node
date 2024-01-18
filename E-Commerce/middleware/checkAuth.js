const jwt = require("jsonwebtoken");
const user_query=require('../models/users');

const verify_token=async(req,res,next)=>{
    // verify token
    const token= req.header('auth-token');
    if(!token)
        return res.status(400).send("Access Denied");
    try{
        const UserDetails=jwt.verify(token, 'nfb32iur32ibfqfvi3vf932bg932g932');
        req.user_Id = UserDetails.user_Id; // Attach user_Id to the request object
        req.email=UserDetails.email;
        next();
    }
    catch(err){
        res.status(400).send("Invalid Token");
    }
    
}


const role_access = (requiredRole) => async (req, res, next) => {
    try {
      const user_id = req.user_Id;
  
      let isAuthorized = await user_query.checkUserRole(user_id, requiredRole);
  
      if (!isAuthorized) {
        console.log("false");
        return res.status(403).json({ message: `Access forbidden. User is not a ${requiredRole}.` });
      }
  
      // If the user has the required role, proceed to the next middleware or route handler
      return next();
    } catch (error) {
      console.error('Error in role access validation:', error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };







module.exports={
    role_access,
    verify_token,
 

}