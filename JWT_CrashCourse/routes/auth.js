// // // express validator library to validate it
// // // salts are random string appended to password
// // // JWT - Header, Payload, Verify Signature

// // const router=require('express').Router();
// // const {check,validationResult}=require('express-validator');
// // const {users}=require("../db")
// // const bcrypt=require("bcrypt")
// // const jwt = require("jsonwebtoken")

// // router.post('/signup',[check("email","PLease provide a valid email").isEmail(),
// //                         check("password","Please provide password greater than 5 characters").isLength({min:6})
// //                     ], async (req,res)=>{
// //     const {password,email}=req.body;

// //     // validate the input
// //     const errors=validationResult(req);

// //     if(!errors.isEmpty()){
// //         return res.status(422).json({
// //             errors:errors.array()
// //         })
// //     }

// //     // validate if user doesn't already exist
// //     let user=users.find((user)=>{
// //         return user.email===email
// //     });

// //     if(user){
        
// //         return res.status(400).json({
// //             "errors":[
// //             {
// //                 "msg":"This user already exists"
// //             }
// //             ]
// //         })

// //     }
// //     const hashedPassword=await bcrypt.hash(password,10);
// //     users.push({
// //         email,
// //         password: hashedPassword
// //     })
// //     const token=await jwt.sign({
// //         email   // payload
// //     },"qwertyuioplkjhgfdsazxcvbnm",{
// //         expiresIn:3600000
// //     }
// //     )


// //     res.json({
// //         token
// //     })
// //     console.log(hashedPassword);
// //     res.send("Validation pass")
   
// // })

// // router.get('/all',(req,res)=>{
// //     res.json(users);
// // })
// // module.exports=router;  

// const router = require("express").Router();
// const { check, validationResult } = require("express-validator");
// const JWT = require("jsonwebtoken")
// const bcrypt = require('bcrypt');
// const { users } = require("../db")

// // SIGNUP
// router.post("/signup", [
//     check("email", "Please input a valid email")
//         .isEmail(),
//     check("password", "Please input a password with a min length of 6")
//         .isLength({min: 6})
// ], async (req, res) => {
//     const { email, password } = req.body;

//     // Validate the inputs 
//     const errors = validationResult(req);

//     if(!errors.isEmpty()){
//         return res.status(422).json({
//             errors: errors.array()
//         })
//     }

//     // Validate if the user doesnt already exist;
//     let user = users.find((user) => {
//         return user.email === email
//     });

//     if(user) {
//         return res.status(422).json({
//             errors: [
//                 {
//                     msg: "This user already exists",
//                 }
//             ]
//         })
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Save the password into the db
//     users.push({
//         email,
//         password: hashedPassword
//     });

//     const token = await JWT.sign({ email }, "nfb32iur32ibfqfvi3vf932bg932g932", {expiresIn: 360000});

//     res.json({
//         token
//     })
// })

// // LOGIN
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body
//     // Check if user with email exists

//     let user = users.find((user) => {
//         return user.email === email
//     });

//     if(!user){
//         return res.status(422).json({
//             errors: [
//                 {
//                     msg: "Invalid Credentials",
//                 }
//             ]
//         })
//     }

//     // Check if the password if valid
//     let isMatch = await bcrypt.compare(password, user.password);

//     if(!isMatch){
//         return res.status(404).json({
//             errors: [
//                 {
//                     msg: "Invalid Credentials" 
//                 }
//             ]
//         })
//     }

//     // Send JSON WEB TOKEN
//     const token = await JWT.sign({email}, "nfb32iur32ibfqfvi3vf932bg932g932", {expiresIn: 360000})

//     res.json({
//         token
//     })
// })


// // ALL USER
// router.get("/all", (req, res) => {
//     res.json(users)
// })

// module.exports = router

const router = require("express").Router();
const { check, validationResult } = require("express-validator");
const JWT = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const { users } = require("../db")

// SIGNUP
router.post("/signup", [
    check("email", "Please input a valid email")
        .isEmail(),
    check("password", "Please input a password with a min length of 6")
        .isLength({min: 6})
], async (req, res) => {
    const { email, password } = req.body;

    // Validate the inputs 
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({
            errors: errors.array()
        })
    }

    // Validate if the user doesnt already exist;
    let user = users.find((user) => {
        return user.email === email
    });

    if(user) {
        return res.status(422).json({
            errors: [
                {
                    msg: "This user already exists",
                }
            ]
        })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the password into the db
    users.push({
        email,
        password: hashedPassword
    });

    const token = await JWT.sign({ email }, "nfb32iur32ibfqfvi3vf932bg932g932", {expiresIn: 360000});

    res.json({
        token
    })
})

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    // Check if user with email exists

    let user = users.find((user) => {
        return user.email === email
    });

    if(!user){
        return res.status(422).json({
            errors: [
                {
                    msg: "Invalid Credentials",
                }
            ]
        })
    }

    // Check if the password if valid
    let isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        return res.status(404).json({
            errors: [
                {
                    msg: "Invalid Credentials" 
                }
            ]
        })
    }

    // Send JSON WEB TOKEN
    const token = await JWT.sign({email}, "nfb32iur32ibfqfvi3vf932bg932g932", {expiresIn: 360000})

    res.json({
        token
    })
})


// ALL USER
router.get("/all", (req, res) => {
    res.json(users)
})

module.exports = router