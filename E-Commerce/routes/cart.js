const router = require("express").Router();
const cart_query=require('../models/cart');
const auth=require('../middleware/checkAuth');
const { pool } = require("../dbConfig");
const controller_cart=require('../controller/cart');

 
router.post('/add',auth.verify_token,controller_cart.addProductsInCart);
router.delete('/delete',auth.verify_token,controller_cart.deleteProdfromCart);
router.get('/all',auth.verify_token,controller_cart.getAllProductsInCart);
router.put('/update',auth.verify_token,controller_cart.updateByQuantity);

module.exports = router;