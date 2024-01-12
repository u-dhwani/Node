const router = require("express").Router();
const order_query=require('../queries/order');
const authorize=require('../middleware/checkAuth');
const { pool } = require("../dbConfig");
const controller_order=require('../controller/order');


router.post('/order',controller_order.getCurrentOrder);
router.get('/all',controller_order.getAllOrder);
// router.delete('/delete',controller_order.deleteOrder);

module.exports = router;