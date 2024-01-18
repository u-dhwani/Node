const router = require("express").Router();
const JWT = require("jsonwebtoken")
const controller_users=require('../controller/users');
const validation = require('../validations/users');
const auth=require('../middleware/checkAuth');


router.post('/signup', validation.handleSignup,controller_users.signUpUser);
router.post('/login',controller_users.loginUser);
router.get('/all',auth.verify_token,auth.role_access('admin'),controller_users.getAllUsers);
router.delete('/delete',auth.verify_token,auth.role_access('admin'),controller_users.deleteByEmail);
router.put('/update',auth.verify_token,auth.role_access('user'),controller_users.updateAddressOfUserByEmail);

module.exports = router;