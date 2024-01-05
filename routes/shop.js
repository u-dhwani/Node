const path=require('path');

const express=require('express');
const shopController = require('../controllers/shop');

const router=express.Router();
// const rootDir=require('../util/path');
// const adminData=require('./admin');

// const productsController=require('../controllers/admin');
// router.get('/',productsController.getProducts);

// router.get('/', (req, res, next) => {
//     // console.log(adminData.products);
//     // res.sendFile(path.join(rootDir,'views','shop.html'));
//     // console.log("shop");
//     // console.log(rootDir);
//     const products=adminData.products;
//     //res.render('shop',{prods:products,docTitle:'Shop'});
//     res.render('shop', {
//         prods: products,
//         pageTitle: 'Shop',
//         path: '/',
//         hasProducts: products.length > 0,
//         activeShop: true,
//         productCSS: true
//       });
// });

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/cart', shopController.getCart);

router.get('/orders', shopController.getOrders);

router.get('/checkout', shopController.getCheckout);


module.exports=router;
