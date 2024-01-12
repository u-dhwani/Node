const router = require("express").Router();
const cart_query=require('../queries/cart');
const authorize=require('../middleware/checkAuth');
const { pool } = require("../dbConfig");
const controller_cart=require('../controller/cart');

// router.get('/all',controller_cart.getAllProductsInCart);  
// router.delete('/delete/:id',controller_cart.deleteProductInCartByID);
// router.get('/add/:id',controller_cart.AddProductsInCartByID); 
router.post('/add',controller_cart.addProductsInCart);
router.delete('/delete',controller_cart.deleteProdfromCart);
router.get('/all',controller_cart.getAllProductsInCart);
router.put('/update',controller_cart.updateByQuantity);

module.exports = router;