const { pool } = require('../dbConfig');




//const insertIntoOrderUser="INSERT INTO order_user (user_id, address,amount, order_date,order_item_id,curr_timestamp) VALUES ($1,$2, $3,CURRENT_DATE,$4,CURRENT_TIMESTAMP)";

//const deleteInCartItem="DELETE FROM cart_item WHERE user_id = $1";
const deleteInCartItem = async (userId) => {
    try {
        await pool.query('DELETE FROM cart_item WHERE user_id = $1', [userId]);
    } catch (error) {
        console.error('Error deleting from cart_item:', error);
        throw error;
    }
};

//const updateAmount="update cart set amount=0.0 where user_id=$1";
const updateCartAmount = async (userId) => {
    try {
        await pool.query('UPDATE cart SET amount = 0.0 WHERE user_id = $1', [userId]);
    } catch (error) {
        console.error('Error updating cart amount:', error);
        throw error;
    }
};

//const getCurrentOrderDetails="SELECT * FROM order_user where user_id=$1 order by order_date,curr_timestamp desc";
const getCurrentOrderDetails = async (userId) => {
    try {
        const result = await pool.query('SELECT * FROM order_user WHERE user_id = $1 ORDER BY order_date, curr_timestamp DESC', [userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error getting current order details:', error);
        throw error;
    }
};


//const getAllOrderDetails="SELECT * FROM order_item oi JOIN order_user ou ON oi.order_item_id = ou.order_item_id WHERE ou.user_id = $1 ORDER BY ou.order_date,ou.curr_timestamp DESC ";
const getAllOrderDetails = async (pageSize,offset) => {
    try {
        const result = await pool.query(
            'SELECT ou.order_id, ou. amount,SUM(oi.order_item_id) AS total_items, ou.order_date, ou.curr_timestamp ' +
            'FROM order_user ou ' +
            'JOIN order_item oi ON oi.order_item_id = ou.order_id ' +
            'GROUP BY ou.order_id ' +
            'ORDER BY ou.order_date, ou.curr_timestamp DESC LIMIT $1 OFFSET $2',[pageSize,offset]);
        return result.rows;
    } catch (error) {
        console.error('Error getting all order details:', error);
        throw error;
    }
};

const getDetailsOfAllOrderOfParticularUser=async(userId,pageSize,offset)=>{
    try{
        console.log("user_id:"+userId)
        const result = await pool.query(
            'SELECT ou.order_id, SUM(oi.quantity) AS total_items, ou.amount, ou.order_date, ou.curr_timestamp ' +
            'FROM order_user ou ' +
            'JOIN order_item oi ON ou.order_id = oi.order_item_id ' +
            'WHERE ou.user_id = $1 ' +
            'GROUP BY ou.order_id, ou.amount, ou.order_date, ou.curr_timestamp ' +
            'ORDER BY ou.order_date DESC LIMIT $2 OFFSET $3',
            [userId,pageSize,offset]);
        return result.rows;
    }
    catch(error){
        console.error('Error fetching order details:', error);
        throw error;
    }
}

//const deleteOrderFromOrderItem="DELETE FROM order_item WHERE order_item_id IN (SELECT ou.order_item_id FROM order_user ou ON oi.user_id = ou.user_id WHERE ou.user_id = $1)";
const deleteOrderFromOrderItem = async (orderId) => {
    try {
        await pool.query('DELETE FROM order_item WHERE order_item_id IN (SELECT order_id FROM order_user WHERE order_id = $1)', [orderId]);
    } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
    }
};

//const deleteOrderFromOrderUser="delete from order_user where order_id=$1";
const deleteOrderFromOrderUser = async (orderId) => {
    try {
        await pool.query('DELETE FROM order_user WHERE order_id = $1', [orderId]);
    } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
    }
};

  
//const showAllOrder="select * from order_user";
const showAllOrder = async () => {
    try {
        const result = await pool.query('SELECT * FROM order_user');
        return result.rows;
    } catch (error) {
        console.error('Error showing all orders:', error);
        throw error;
    }
};

//const addressUser="select address from users where user_id=$1";
const addressUser = async (userId) => {
    try {
        const result = await pool.query('SELECT address FROM users WHERE user_id = $1', [userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error getting user address:', error);
        throw error;
    }
};



//const amountUser="select amount from cart where user_id=$1";
const amountInCartOfUser = async (userId) => {
    try {
        const result = await pool.query('SELECT amount FROM cart WHERE user_id = $1', [userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error getting user amount:', error);
        throw error;
    }
};


const getDetailsOfParticularOrder=async(orderId)=>{
    try {
        const result = await pool.query(
            'SELECT oi.prod_id, p.product_name, oi.quantity, p.price ' +
            'FROM order_item oi ' +
            'JOIN products p ON oi.prod_id = p.prod_id ' +
            'WHERE oi.order_item_id = $1',
            [orderId]
        );

        return result.rows;
        
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
}


//const insertIntoOrderItem="INSERT INTO order_item (order_item_id, prod_id, quantity) SELECT $1 AS order_item_id, ci.prod_id, ci.quantity FROM cart_item ci WHERE ci.user_id = $2";
const insertIntoOrder = async (userId,address,amountuser) => {
    const client = await pool.connect();

    try{
       await client.query('BEGIN'); // Start the transaction

       const getorder_id=await client.query(
        'INSERT INTO order_user (user_id, address, amount, order_date,  curr_timestamp) VALUES ($1, $2, $3, CURRENT_DATE,  CURRENT_TIMESTAMP) RETURNING order_id',
        [userId, address, amountuser]
    );
        
        // Check if the quantity in cart_item is greater than or equal to the quantity in the seller table
        const checkQuantityResult = await client.query(
            'SELECT ci.prod_id, ci.quantity, s.quantity AS seller_quantity FROM cart_item ci JOIN seller s ON ci.prod_id = s.prod_id WHERE ci.user_id = $1',
            [userId]
        );
           
        for (const row of checkQuantityResult.rows) {
            if (row.quantity > row.seller_quantity) {
                throw new Error('Quantity in cart_item should be less than or equal to quantity in seller table');
            }
        }

        // Insert into order_item
        await client.query(
            'INSERT INTO order_item (order_item_id, prod_id, quantity) SELECT $1 AS order_item_id, ci.prod_id, ci.quantity FROM cart_item ci WHERE ci.user_id = $2',
            [getorder_id, userId]
        );

        await client.query('COMMIT'); // If everything is successful, commit the transaction
    } catch (error) {
        await client.query('ROLLBACK'); // If an error occurs, rollback the transaction
        console.error('Error inserting into order_item:', error);
        throw error;
    } finally {
        client.release();
    }
};




module.exports={
    insertIntoOrder,
   
    deleteInCartItem,
    updateCartAmount,
    getCurrentOrderDetails,
    getAllOrderDetails,
    deleteOrderFromOrderItem,
    getDetailsOfAllOrderOfParticularUser,
    deleteOrderFromOrderUser,
    getDetailsOfParticularOrder,
    showAllOrder,
    addressUser,
    amountInCartOfUser

}
