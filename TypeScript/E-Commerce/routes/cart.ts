import { Router } from 'express';

import * as validation from '../validations/users';
import { checkAuth,role_access } from '../middleware/checkAuth'; // Import checkAuth
import CartController from '../controller/cart';

const router = Router();

router.post('/add',checkAuth,CartController.addProductsInCart);
router.delete('/delete',checkAuth,CartController.deleteProdfromCart);
router.get('/all',checkAuth,CartController.getAllProductsInCart);
router.put('/update',checkAuth,CartController.updateByQuantity);


export default router;