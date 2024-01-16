const router = require("express").Router();
const cart_query=require('../queries/cart');
const authorize=require('../middleware/checkAuth');
const { pool } = require("../dbConfig");
const controller_cart=require('../controller/cart');

 
router.post('/add',controller_cart.addProductsInCart);
router.delete('/delete',controller_cart.deleteProdfromCart);
router.get('/all',controller_cart.getAllProductsInCart);
router.put('/update',controller_cart.updateByQuantity);

module.exports = router;