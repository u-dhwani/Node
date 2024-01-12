const { check, validationResult } = require("express-validator");
const JWT = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const user_query=require('../queries/users');
const { pool } = require("../dbConfig");

const signUpUser=async(req,res)=>{
    const { full_name, email, password,phone_no,address,role } = req.body;
    // Validate the inputs 
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({
            errors: errors.array()
        })
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    pool.query(
        `SELECT * FROM users
          WHERE email = $1`,
        [email],
        async (err, results) => {
          if (err) {
            console.log(err);
          }
          console.log(results.rows);
  
          if (results.rows.length > 0) {
            return res.status(422).json({
              message: "Email already registered"
            });
          } else {
    pool.query(
        user_query.addUser,
        [full_name, email, hashedPassword,phone_no,address,role],
        (err, results) => {
          if (err) {
            throw err;
          }
          console.log(results.rows);
        }
      );
    }
    const token =  await JWT.sign({ email }, "nfb32iur32ibfqfvi3vf932bg932g932", {expiresIn: 360000});

    res.json({
        token
    })
})
}


const loginUser=(req,res)=>{
    const { email, password ,role} = req.body;
    pool.query(
        user_query.checkEmailExists,
        [email],
        (err, results) => {
          if (err) {
            throw err;
          }
          console.log(results.rows);
          if (results.rows.length > 0) {
            const user = results.rows[0];
  
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) {
                throw err;
              }
              if (isMatch && user.role=== role) {
               const token = JWT.sign({email,role:user.role}, "nfb32iur32ibfqfvi3vf932bg932g932", {expiresIn: 360000})
               console.log("Login successfully");
              // res.setHeader("User-Token",token);
               res.json({
                   token
               })
               
               
              } 
              else if(user.role!==role){
                return res.send("Your role is incorrect")
              }
              else {
                //password is incorrect
                return res.send("Password is incorrect" );
              }
            });
          } else {
            // No user
            return res.send("User does not exist");
          }
        }
    );
}

const getAllUsers=(req,res)=> {
    pool.query(user_query.getUsers,(error,results)=>{
        if(error)   throw error;
        res.status(200).json(results.rows); // OK STATUS
    });
}

const deleteByEmail=(req,res)=>{
    const {email}=req.body;
    
    pool.query(user_query.checkEmailExists,[email],(error,results)=>{
        const noUserFound=!results.rows.length;
        if(noUserFound){
            return res.send("User does not exist in the database");
        }
        pool.query(user_query.removeUserByEmail,[email],(error,results)=>{
            if(error) throw error;
            res.status(200).send("User removed Successfully!!!");
        })
    });
};

const updateUserByEmail=(req,res)=>{
    const {email,full_name}=req.body;
    
    console.log(email+" "+full_name);
    pool.query(user_query.checkEmailExists,[email],(error,results)=>{
        const noUserFound=!results.rows.length;
        if(noUserFound){
            return res.send("User does not exist in the database");
        }
        else{
            pool.query(user_query.updateUserByEmail,[full_name,email],(error,results)=>{
                if(error) throw error;
                res.status(200).send("User Updated Successfully!!!");
            });
    }
    });
};

module.exports={
    getAllUsers,
    loginUser,
    signUpUser,
    deleteByEmail,
    updateUserByEmail,
};
