import express, { Request, Response, Router } from 'express';
import {checkAuth,role_access} from '../middleware/checkAuth';
import OrderController from '../controller/order';

const router: Router = express.Router();

router.post('/order', checkAuth, OrderController.placeOrder);
router.get('/all', role_access('admin'), OrderController.getAllOrder); // admin
router.delete('/delete', checkAuth, OrderController.deleteOrder);
router.get('/:id', checkAuth, role_access('admin'), role_access('user'), OrderController.getDetailsOfParticularOrder);
router.get('/order/user', checkAuth, role_access('user'), OrderController.getDetailsOfAllOrderOfParticularUser);

export default router;
