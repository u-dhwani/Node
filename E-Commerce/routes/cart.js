const router = require("express").Router();
const cart_query=require('../queries/cart');
const authorize=require('../middleware/checkAuth');
const { pool } = require("../dbConfig");
const controller_cart=require('../controller/cart');

router.get('/all',controller_cart.getAllProductsInCart);  
router.delete('/delete/:id',controller_cart.deleteProductInCartByID);
router.get('/add/:id',controller_cart.AddProductsInCartByID); 

module.exports = router;