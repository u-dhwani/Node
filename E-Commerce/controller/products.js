const JWT = require("jsonwebtoken")
const product_query=require('../models/products');
const { pool } = require("../dbConfig");
const auth=require('../middleware/checkAuth');
const { paginate } = require('../utils/pagination');
const validate=require('../validations/products');

const getAllProducts = async (req, res) => {
    try {
      const page = req.query.page || 1;
      const pageSize=5;
      const { offset } = paginate(page,pageSize);
      const results = await product_query.getAllProducts(pageSize,offset);
      res.status(200).json(results.rows);
    } catch (error) {
      console.error('Error retrieving all products:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  

  const deleteProduct = async (req, res) => {
    
    try {
      const {prod_id} = validate.validateProductId({ prod_id: parseInt(req.params.id) });
      // Check if the product exists
      const checkResult = await product_query.getProductById(prod_id);
     
      if (!checkResult) {
        return res.status(404).send("Product does not exist in the database");
      }
     
      // Product exists, proceed to delete
      await product_query.deleteProduct(prod_id);
      res.status(200).send("Product removed Successfully!!!");
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  
  
  

// controller/addProducts.js

const addProducts = async (req, res) => {
    const { product_name, description, brand, price, category,discount_percentage,quantity } = validate.validateCreateProduct(req.body);
   
    try {
        const seller_id=req.user_Id;
       
        const existingProduct = await product_query.existingProduct(product_name, brand, seller_id);
        if (existingProduct.length > 0) {
            return res.status(409).json({ message: 'Product already exists. Update the quantity.' });
        }

        await product_query.addProducts(product_name, description, brand, price, category, seller_id,discount_percentage,quantity);
        return res.status(201).json({ message: 'Product added successfully.' });
    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getProductById=async(req,res)=>{
    
    try {
      const {prod_id} = validate.validateProductId({ prod_id: parseInt(req.params.id) });
      const result = await product_query.getProductById(prod_id);

        if (result) {
            return res.status(200).json({ product: result });
        } 
        else {
            return res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    
};

// controller/products.js

const getProductByCategory = async (req, res) => {
    try {
      const { category } = validateCategoryParam({ category: req.params.category });
      console.log(category);
      const products = await product_query.getProductByCategory(category);
  
      if (products.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.status(200).json({ products });
    } catch (error) {
      console.error('Error fetching product by category:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  
  const updateProductsByDiscountQuantity = async (req, res) => {
    const { prod_id, discount_percentage ,quantity} = validate.validateUpdateProduct(req.body);
    
    try {
        const seller_id=req.user_Id;
        const existingProduct = await product_query.getProductById(prod_id);

        if (existingProduct) {
            await product_query.updateProductsByDiscountQuantity(quantity, seller_id, prod_id,discount_percentage);
            return res.status(200).json({ message: 'Product updated successfully.' });
        } else {
            return res.status(404).json({ message: 'Your product does not exist.' });
        }
    } catch (error) {
        console.error('Error updating product by quantity:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const finalPrice = async (req, res) => {
    try {
      const {productId} = validate.validateProductId({ prod_id: parseInt(req.params.id) }); 
      const finalPriceInfo = await product_query.finalPrice(productId);
  
      if (finalPriceInfo.length > 0) {
        return res.status(200).json({ finalPrice: finalPriceInfo[0] });
      } else {
        return res.status(404).json({ message: 'Product not found or discount information not available.' });
      }
    } catch (error) {
      console.error('Error fetching final price:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


// finalPrice
module.exports={
    getAllProducts,
    deleteProduct,
    addProducts,
    getProductById,
    getProductByCategory,
    updateProductsByDiscountQuantity,
    finalPrice,

}