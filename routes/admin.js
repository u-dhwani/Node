// Route Handling: The express.Router() creates a new router object. You can then define routes and their corresponding handlers on this router. In your example, you have defined two routes: one for handling GET requests to '/add-product' and another for handling POST requests to '/product'. Each route has its own middleware function.

// Middleware: Middleware functions are functions that have access to the request (req), response (res), and the next middleware function in the application’s request-response cycle. By using routers, you can define middleware functions for specific routes, keeping the logic modular and organized.
const path=require('path');
const express=require('express');

//const productsController=require('../controllers/admin');
const adminController = require('../controllers/admin');


const router=express.Router();

// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);


//const rootDir=require('../util/path');
// const products=[];

// console.log("root-dir"+rootDir);

// router.get('/add-product',productsController.getAddProduct);
// router.get('/add-product', (req, res, next) => {
  //   console.log('In add-product middleware!');
  // //   res.send('<form action="/admin/add-product" method="POST"><input type="text" name="title"><button type="submit">Add Product</button></form>');
  //     // res.sendFile(path.join(__dirname,'../','views','add-product.html'));
  //   res.sendFile(path.join(rootDir,'views','add-product.html'));
// res.render('add-product', {
//     pageTitle: 'Add Product',
//     path: '/admin/add-product',
//     formsCSS: true,
//     productCSS: true,
//     activeAddProduct: true
//   });
// });
  
// router.post('/add-product',productsController.postAddProduct);

// router.post('/add-product', (req, res, next) => {
    
//     products.push({title:req.body.title});
//     res.redirect('/');
// });

// exports.routes=router;
// exports.products=products;
module.exports=router;
