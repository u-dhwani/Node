const JWT = require("jsonwebtoken")
const order_query=require('../models/order');
const cart_query=require('../models/cart');
const { pool } = require("../dbConfig");
const { paginate } = require('../utils/pagination');
const {validate}=require('../validations/order')
let count = 0;

const PlaceOrder = async (req, res) => {
    try {
        // Decode the token to get the user_Id
        const user_Id=req.user_Id;

        // Update cart amount (assuming you're passing 'counter' as a parameter)
        await cart_query.updateCartAmount();

        const addressResult=await order_query.addressUser(user_Id);
        
        const amountInCartOfUserResult=await order_query.amountInCartOfUser(user_Id);
       
        const address = addressResult.address; // Assuming only one row is expected
        
        const amountuser = amountInCartOfUserResult.amount;

        console.log(user_Id,address,amountuser);
        
        await order_query.insertIntoOrder(user_Id,address,amountuser); 

        // Delete items from cart_item for the specified user_Id
        await order_query.deleteInCartItem(user_Id);
 
        // Update amount (assuming you have a query for updating the order amount)
        await order_query.updateCartAmount(user_Id);

        // Get current order details
        const results = await order_query.getCurrentOrderDetails(user_Id);

        res.status(200).json(results); // OK status
        
    } catch (error) {
        console.error('Error in getCurrentOrder:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getDetailsOfAllOrderOfParticularUser=async(req,res)=>{
    
    try{
        const page = req.query.page || 1;
        const pageSize=5;
        const { offset } = paginate(page,pageSize);
      
        const user_Id=req.user_Id;
        console.log("hello:"+user_Id);
        const results=await order_query.getDetailsOfAllOrderOfParticularUser(user_Id,pageSize,offset);
        res.status(200).json(results);
    }
    catch(error){
        console.error('Error in getParticularOrder:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

const getAllOrder = async (req, res) => {

    try {
        const page = req.query.page || 1;
        const pageSize=5;
        const { offset } = paginate(page,pageSize);
        const results = await order_query.getAllOrderDetails(pageSize,offset);
        res.status(200).json(results); // OK status
    } catch (error) {
        console.error('Error in getAllOrder:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getDetailsOfParticularOrder=async(req,res)=>{
   const {orderId} = validate.validateGetOrderDetails({ prod_id: parseInt(req.params.id) });
     
    try{
        
        console.log(orderId);
        const results=await order_query.getDetailsOfParticularOrder(orderId);
        res.status(200).json(results);
    }
    catch(error){
        console.error('Error in getParticularOrder:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

const deleteOrder=async(req,res)=>{
    const { order_id } = validate.validateGetOrderDetails(req.body);
    const user_Id=req.user_Id;
    order_query.deleteOrderFromOrderUser(order_id);
    order_query.deleteOrderFromOrderItem(user_Id);
    const results=await order_query.showAllOrder();
    res.status(200).json(results);
}



module.exports={
    PlaceOrder,
    getAllOrder,
    deleteOrder,
    getDetailsOfParticularOrder,
    getDetailsOfAllOrderOfParticularUser
}
