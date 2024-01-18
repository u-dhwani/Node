const router = require("express").Router();
const order_query=require('../models/order');
const auth=require('../middleware/checkAuth');
const { pool } = require("../dbConfig");
const controller_order=require('../controller/order');



router.post('/order',auth.verify_token,controller_order.PlaceOrder);
router.get('/all',auth.role_access('admin'),controller_order.getAllOrder);  // admin
router.delete('/delete',auth.verify_token,controller_order.deleteOrder);
router.get('/:id',auth.verify_token,auth.role_access('admin'),auth.role_access('user'),controller_order.getDetailsOfParticularOrder);
router.get('/order/user',auth.verify_token,auth.role_access('user'),controller_order.getDetailsOfAllOrderOfParticularUser);

module.exports = router;