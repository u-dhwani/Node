const JWT = require("jsonwebtoken")
const cart_query=require('../models/cart');
const { pool } = require("../dbConfig");
const auth=require('../middleware/checkAuth');
const { paginate } = require('../utils/pagination');
const validate=require('../validations/cart');
const validate_product=require('../validations/products');


const addProductsInCart=async(req,res)=>{
    const{prod_id,quantity}=validate.updateProductQuantitySchema(req.body);
    console.log(prod_id,quantity);
    try{
        const user_Id=req.user_Id;
        const user_found=await cart_query.FindUserInCart(user_Id);
      
        await cart_query.createcartitem(user_Id,prod_id, quantity);
      
        if(!user_found){
            const amount=0.0;
            await cart_query.createCartQuery(user_Id,amount);
        }
       
        await cart_query.updateCartAmount();
        const cart_details=await cart_query.FindUserInCart(user_Id);
        if(cart_details)
            return res.status(200).json(cart_details); 
       
    }
    catch{
       
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const deleteProdfromCart = async (req, res) => {
    const {  prod_id } = validate_product.validateProductId(req.body);

    try {
        const user_Id=req.user_Id;

        const results = await cart_query.checkProductInCartByuser_Id(user_Id, prod_id);

        if (results) {
            await cart_query.deleteProdfromCart(user_Id, prod_id);

            const presentInCartItem = await cart_query.checkUserInCartItem(user_Id);
            await cart_query.updateCartAmount();

          
            if (!presentInCartItem) {
                
                await cart_query.updateCartAmountAfterDelete(user_Id);
            }
            else{
                await cart_query.updateCartAmount();
            }
            const cartResult = await cart_query.FindUserInCart(user_Id);

            return res.status(200).json(cartResult);
        } else {
            return res.status(404).send("No product");
        }
    } catch (error) {
        console.error('Error deleting product from cart:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllProductsInCart = async (req, res) => {
    try {
        const user_Id=req.user_Id;
        const page = req.query.page || 1;
        const pageSize=5;
        const { offset } = paginate(page,pageSize);
        await cart_query.updateCartAmount();

        const results = await cart_query.getAllProductsInCart(user_Id,pageSize,offset);

        res.status(200).json(results); // OK STATUS
    } catch (error) {
        console.error('Error getting all products in cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const updateByQuantity = async (req, res) => {
    const{prod_id,quantity}=validate.updateProductQuantitySchema(req.body);
    
    try {
        const user_Id=req.user_Id;

        await cart_query.updateQuantity(quantity, user_Id, prod_id);
        await cart_query.updateCartAmount();

        const results = await cart_query.getAllProductsInCart(user_Id);

        res.status(200).json(results); // OK STATUS
    } catch (error) {
        console.error('Error updating quantity in cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports={
    addProductsInCart,
    deleteProdfromCart,
    getAllProductsInCart,
    updateByQuantity,
}