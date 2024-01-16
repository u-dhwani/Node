const JWT = require("jsonwebtoken")
const cart_query=require('../queries/cart');
const { pool } = require("../dbConfig");

const addProductsInCart=async(req,res)=>{
    const{token,prod_id,quantity}=req.body;
    console.log(prod_id,quantity);
    try{
        const{getUser}=JWT.verify(token,'nfb32iur32ibfqfvi3vf932bg932g932');
       console.log(getUser);
        const user_found=await pool.query(cart_query.FindUserInCart,[getUser]);
        let cartfound=user_found.rows[0];
        
        const createCartItemResult = await pool.query(cart_query.createcartitem, [getUser,prod_id, quantity]);
        const cartItem = createCartItemResult.rows[0];
        if(!cartfound){
            const amount=0.0;
            const createcartresult=await pool.query(cart_query.createCartQuery,[getUser,amount])
        }
        const updateCartAmount=await pool.query(cart_query.updateCartAmount);
       // res.json({updateCartAmount.rows});
       const updatedCart = updateCartAmount.rows[0];
        console.log("hi");
       pool.query(cart_query.FindUserInCart,[getUser],(error,results)=>{
           
            if(error)   throw error;
            return res.status(200).json(results.rows[0]); 
       });
       
       
    }
    catch{
       
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const deleteProdfromCart=async(req,res)=>{
    const {token,prod_id}=req.body;
    try{
        const{getUser}=JWT.verify(token,'nfb32iur32ibfqfvi3vf932bg932g932');
        pool.query(cart_query.checkProductBygetUser,[getUser,prod_id],async (err,results)=>{
            if(results.rows.length>0){
                const deleted=await pool.query(cart_query.deleteProdfromCart,[getUser,prod_id]);
                const presentInCartItem=pool.query(cart_query.checkUserInCartItem,[getUser]);
                const updateCartAmount=await pool.query(cart_query.updateCartAmount);
                // res.json({updateCartAmount.rows});
                const updatedCart = updateCartAmount.rows[0];
                if(!presentInCartItem) {
                    pool.query(cart_query.updateCartAmountAfterDelete,[getUser]);
                }
                pool.query(cart_query.FindUserInCart,[getUser],(error,results)=>{
                    
                     if(error)   throw error;
                     return res.status(200).json(results.rows[0]); 
                });
            }
            else{
                res.send("No product");
            }
        })
    }
    catch{
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

const getAllProductsInCart=async(req,res)=>{
    const {token}=req.body;
    const{getUser}=JWT.verify(token,'nfb32iur32ibfqfvi3vf932bg932g932');
    const updateCartAmount=await pool.query(cart_query.updateCartAmount);
               
    pool.query(cart_query.getAllProductsInCart,[getUser],(error,results)=>{
        
        if(error)   throw error;
        res.status(200).json(results.rows); // OK STATUS
    });
}

 const updateByQuantity=async(req,res)=>{
    const{token,prod_id,quantity}=req.body;
    const {getUser}=JWT.verify(token,'nfb32iur32ibfqfvi3vf932bg932g932');
    const updatequantity=await pool.query(cart_query.updateQuantity,[quantity,getUser,prod_id]);
    const updateCartAmount=await pool.query(cart_query.updateCartAmount);
               
    pool.query(cart_query.getAllProductsInCart,[getUser],(error,results)=>{
        
        if(error)   throw error;
        res.status(200).json(results.rows); // OK STATUS
    });

 }

module.exports={
    addProductsInCart,
    deleteProdfromCart,
    getAllProductsInCart,
    updateByQuantity,
}