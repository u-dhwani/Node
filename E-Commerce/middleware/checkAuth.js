const jwt = require("jsonwebtoken");
const auth=(req,res,next)=>{
    const {token}=req.body;
    const user = jwt.verify(token, "nfb32iur32ibfqfvi3vf932bg932g932");
    req.userRole=user.role;
    if(user.role!="admin")  return res.send('Forbidden: You do not have the necessary privileges.');
    next();
}
module.exports = async (req, res, next) => {
    const token = req.header('x-auth-token')

    // CHECK IF WE EVEN HAVE A TOKEN
    if(!token){
        res.status(401).json({
            errors: [
                {
                    msg: "No token found"
                }
            ]
        })
    }

    try {
        const user = await jwt.verify(token, "nfb32iur32ibfqfvi3vf932bg932g932")
        req.user = user.email;
        req.userRole=user.role;
        console.log(userRole);
        next();
    } catch (error) {
        res.status(400).json({
            errors: [
                {
                    msg: 'Invalid Token'
                }
            ]
        })
    }
}

module.exports={
    auth,
}