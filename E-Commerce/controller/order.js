const JWT = require("jsonwebtoken")
const order_query=require('../queries/order');
const cart_query=require('../queries/cart');
const { pool } = require("../dbConfig");
const order_route=require('../routes/order');
let count = 0;

function createCounter() {
     // This is a "static" variable within the closure
    return function() {
      count++;
      return count;
    };
  }
  const counter = createCounter();


const getCurrentOrder = async (req, res) => {
    const { token } = req.body;

    try {
        // Decode the token to get the email
        const { email } = JWT.verify(token, 'nfb32iur32ibfqfvi3vf932bg932g932');

        // Update cart amount (assuming you're passing 'counter' as a parameter)
        await pool.query(cart_query.updateCartAmount);

        // Insert into order_item table
        console.log(typeof counter); // Output: number
        const count_user = counter(); 
        await pool.query(order_query.insertIntoOrderItem, [count_user,email]);

        // Insert into order_user table
        
        const addressResult=await pool.query(order_query.addressUser,[email]);
        
        const amountuserResult=await pool.query(order_query.amountUser,[email]);
       
        const address = addressResult.rows[0].address; // Assuming only one row is expected
        
        const amountuser = amountuserResult.rows[0].amount;

        console.log(email,address,amountuser,counter);
        await pool.query(order_query.insertIntoOrderUser,[email,address,amountuser,count_user]);
        

        // Delete items from cart_item for the specified email
        await pool.query(order_query.deleteInCartItem, [email]);
       

        // Update amount (assuming you have a query for updating the order amount)
        await pool.query(order_query.updateAmount,[email]);

        // Get current order details
        const results = await pool.query(order_query.getCurrentOrderDetails, [email]);
        console.log("hi");

        res.status(200).json(results.rows[0]); // OK status
        
    } catch (error) {
        console.error('Error in getCurrentOrder:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllOrder = async (req, res) => {
    try {
        const { token } = req.body;
        const { email } = JWT.verify(token, 'nfb32iur32ibfqfvi3vf932bg932g932');

        // Assuming pool.query returns a promise when using async/await
        const results = await pool.query(order_query.getAllOrderDetails, [email]);

        res.status(200).json(results.rows); // OK status
    } catch (error) {
        console.error('Error in getAllOrder:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// const deleteOrder=async(req,res)=>{
//     pool.query(order_query.deleteOrderFromOrderUser,[email]);
//     pool.query(order_query.deleteOrderFromOrderItem,[email]);
//     const results=await pool.query(order_query.showAllOrder);
//     res.status(200).json(results.rows);
// }


module.exports={
    getCurrentOrder,
    getAllOrder,
    //deleteOrder
}
