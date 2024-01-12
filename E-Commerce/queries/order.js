const insertIntoOrderItem="INSERT INTO order_item (order_item_id, prod_id, quantity) SELECT $1 AS order_item_id, ci.prod_id, ci.quantity FROM cart_item ci WHERE ci.email = $2";
const insertIntoOrderUser="INSERT INTO order_user (email, address,amount, order_date,order_item_id,curr_timestamp) VALUES ($1,$2, $3,CURRENT_DATE,$4,CURRENT_TIMESTAMP)";
const deleteInCartItem="DELETE FROM cart_item WHERE email = $1";
const updateAmount="update cart set amount=0.0 where email=$1";
const getCurrentOrderDetails="SELECT * FROM order_user where email=$1 order by order_date,curr_timestamp desc";
const getAllOrderDetails="SELECT * FROM order_item oi JOIN order_user ou ON oi.order_item_id = ou.order_item_id WHERE ou.email = $1 ORDER BY ou.order_date,ou.curr_timestamp DESC ";
const deleteOrderFromOrderItem="delete from order_item where email=$1";
const deleteOrderFromOrderUser="delete from order_user where email=$1";
const showAllOrder="select * from order_user";
const addressUser="select address from users where email=$1";
const amountUser="select amount from cart where email=$1";

module.exports={
    insertIntoOrderItem,
    insertIntoOrderUser,
    deleteInCartItem,
    updateAmount,
    getCurrentOrderDetails,
    getAllOrderDetails,
    deleteOrderFromOrderItem,
    deleteOrderFromOrderUser,
    showAllOrder,
    addressUser,
    amountUser

}
