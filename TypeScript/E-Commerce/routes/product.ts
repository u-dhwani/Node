import { Router } from 'express';

import { checkAuth,role_access } from '../middleware/checkAuth'; // Import checkAuth
import ProductController from '../controller/product';


const router = Router();

router.post('/add',checkAuth,role_access('seller'),ProductController.addProducts);    // done
router.get('/all',checkAuth,ProductController.getAllProducts);  // done
router.get('/:id',checkAuth,ProductController.getProductById);  // done
router.get('/category/:category',checkAuth,ProductController.getProductByCategory); // done
router.delete('/delete/:id',checkAuth,role_access('seller'),ProductController.deleteProduct);     // done
router.put('/update',checkAuth,role_access('seller'),ProductController.updateProductsByDiscountQuantity); // done
router.get('/finalprice/:id',checkAuth,ProductController.finalPrice);   // done

export default router;