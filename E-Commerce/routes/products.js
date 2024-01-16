const router = require("express").Router();
const products_query=require('../queries/products');
const authorize=require('../middleware/checkAuth');
const { pool } = require("../dbConfig");
const controller_products=require('../controller/products');



router.post('/add',controller_products.addProducts);    // done
router.get('/all',controller_products.getAllProducts);  // done
router.get('/:id',controller_products.getProductById);  // done
router.get('/category/:category',controller_products.getProductByCategory); // done
router.delete('/delete/:id',controller_products.deleteProduct);     // done
router.put('/update',controller_products.updateProductsByQuantity); // done
router.get('/finalprice/:id',controller_products.finalPrice);   // done

module.exports = router;