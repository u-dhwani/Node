const router = require("express").Router();
const products_query=require('../models/products');
const auth=require('../middleware/checkAuth');
const { pool } = require("../dbConfig");
const controller_products=require('../controller/products');


router.post('/add',auth.verify_token,auth.role_access('seller'),controller_products.addProducts);    // done
router.get('/all',auth.verify_token,controller_products.getAllProducts);  // done
router.get('/:id',auth.verify_token,controller_products.getProductById);  // done
router.get('/category/:category',auth.verify_token,controller_products.getProductByCategory); // done
router.delete('/delete/:id',auth.verify_token,auth.role_access('seller'),controller_products.deleteProduct);     // done
router.put('/update',auth.verify_token,auth.role_access('seller'),controller_products.updateProductsByDiscountQuantity); // done
router.get('/finalprice/:id',auth.verify_token,controller_products.finalPrice);   // done


module.exports = router;