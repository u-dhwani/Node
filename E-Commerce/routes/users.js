const router = require("express").Router();
const { check, validationResult } = require("express-validator");
const JWT = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const user_query=require('../queries/users');
const { pool } = require("../dbConfig");
const controller_users=require('../controller/users');

router.post('/signup',[check("email", "Please input a valid email")
.isEmail(),
check("password", "Please input a password with a min length of 6")
.isLength({min: 6})],controller_users.signUpUser);

router.post('/login',controller_users.loginUser);
router.get("/all",controller_users.getAllUsers);

router.delete('/delete',controller_users.deleteByEmail);
router.put('/update',controller_users.updateUserByEmail);

module.exports = router;