const { check, validationResult } = require("express-validator");
const JWT = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const Joi = require('joi');
const user_query = require('../models/users');   
const { pool } = require("../dbConfig");
const auth=require('../middleware/checkAuth');
const { paginate } = require('../utils/pagination'); // Adjust the path accordingly
const validate=require('../validations/users');


const signUpUser = async (req, res) => {
  try {
    const { full_name, email, password, phone_no, address, role } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the email is already registered
    const existingUser = await user_query.user_IdDetails(email);
    if (existingUser) {
      return res.status(422).json({
        message: 'Email already registered',
      });
    }
    const userData = {
      full_name,
      email,
      password: hashedPassword,
      phone_no,
      address,
      role,
    };

    // Add the new user
    await user_query.addUser(userData);

    // Generate and send the JWT token
    const token = await JWT.sign({ email }, 'nfb32iur32ibfqfvi3vf932bg932g932', { expiresIn: 360000 });

    res.json({
      token,
    });
  } 
  catch (error) {
    console.error('Error in signUpUser:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = validate.validateLogin(req.body);

    const user = await user_query.user_IdDetails(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        const user_Id = user.user_id;
        const token = JWT.sign({ email, user_Id }, "nfb32iur32ibfqfvi3vf932bg932g932", { expiresIn: 360000 });
        console.log("Login successfully");
        res.json({
          token,
        });
    }  
    else {
        // Password is incorrect
        return res.status(401).json({ message: "Password is incorrect" });
    }
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const pageSize=5;
    const { offset } = paginate(page,pageSize);
    const results = await user_query.getAllUsers(pageSize,offset);
    return res.status(200).json(results.rows); // OK STATUS
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const deleteByEmail = async (req, res) => {
  try {
    const { email } = validate.validateDeleteByEmail(req.body);
    // Check if the email exists
    const checkForUser = await user_query.user_IdDetails(email);

    if (!checkForUser) {
      return res.send("User does not exist in the database");
    }

    // User found, proceed with the deletion
    const deleteResult =await user_query.removeUserByEmail(email);
    if(deleteResult.success){
        return res.status(200).send("User removed successfully!!!");
    }
    else {
      return res.status(404).json({ error: "User not found or not deleted" });
    }
  } 

  catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const updateAddressOfUserByEmail = async (req, res) => {
  try {
    const { email, address } = validate.validateUpdateProfile(req.body);
   
    // Check if the email exists
    const checkResult = await user_query.user_IdDetails(email);
    
    if (!checkResult) {
      return res.status(404).json({ error: "User not found in the database" });
    }

    // User found, proceed with the update
    await user_query.updateAddressOfUserByEmail(address, email);

    return res.status(200).json({ message: "User Updated Successfully!!!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports={
    getAllUsers,
    loginUser,  
    signUpUser,
    deleteByEmail,
    updateAddressOfUserByEmail,
};
