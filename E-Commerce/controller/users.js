const { check, validationResult } = require("express-validator");
const JWT = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const user_query = require('../queries/users'); 
// const user_query=require('../queries/users');
const { pool } = require("../dbConfig");


const signUpUser = async (req, res) => {
  try {
    const { full_name, email, password, phone_no, address, role } = req.body;

    // Validate the inputs
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the email is already registered
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
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
    const addUserResult = await user_query.addUser(userData);

    console.log(addUserResult.rows);

    // Generate and send the JWT token
    const token = await JWT.sign({ email }, 'nfb32iur32ibfqfvi3vf932bg932g932', { expiresIn: 360000 });

    res.json({
      token,
    });
  } catch (error) {
    console.error('Error in signUpUser:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const results = await user_query.checkEmailExists(email);

    console.log(results.rows);

    if (results.rows.length > 0) {
      const user = results.rows[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch && user.role === role) {
        const getUserId = await user_query.getUserId(email);

        if (!getUserId) {
          return res.status(404).json({ message: 'User not found' });
        }

        const getUser = getUserId.user_id;
        console.log(getUserId.user_id);

        const token = JWT.sign({ email, role: user.role, getUser }, "nfb32iur32ibfqfvi3vf932bg932g932", { expiresIn: 360000 });
        console.log("Login successfully");

        // res.setHeader("User-Token",token);
        res.json({
          token,
        });
      } else if (user.role !== role) {
        return res.send("Your role is incorrect");
      } else {
        // Password is incorrect
        return res.send("Password is incorrect");
      }
    } else {
      // No user
      return res.send("User does not exist");
    }
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const results = await user_query.getAllUsers();

    return res.status(200).json(results.rows); // OK STATUS
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const deleteByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists
    const checkResult = await user_query.checkEmailExists(email);
    

    if (!checkResult) {
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


const updateUserByEmail = async (req, res) => {
  try {
    const { email, address } = req.body;
    console.log(email + " " + address);

    // Check if the email exists
    const checkResult = await user_query.checkEmailExists(email);
    const noUserFound = !checkResult.rows.length;

    if (noUserFound) {
      return res.status(404).json({ error: "User not found in the database" });
    }

    // User found, proceed with the update
    const updateResult = await user_query.updateUserByEmail(address, email);

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
    updateUserByEmail,
};
