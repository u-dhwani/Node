const path=require('path');

const express=require('express');
const router=express.Router();
// const rootDir=require('../util/path');
// const adminData=require('./admin');

const productsController=require('../controllers/products');
router.get('/',productsController.getProducts);

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

module.exports=router;
