const JWT = require("jsonwebtoken")
const product_query=require('../queries/products');
const { pool } = require("../dbConfig");
const authorize=("../middleware/checkAuth");

const getAllProducts=(req,res)=>{
    pool.query(product_query.getAllProducts,(error,results)=>{
        if(error)   throw error;
        res.status(200).json(results.rows); // OK STATUS
    });
}

const deleteProduct=(req,res)=>{
    const prod_id=parseInt(req.params.id);
    console.log(prod_id);
    pool.query(product_query.getProductById,[prod_id],(error,results)=>{
        const noProductFound=!results.rows.length;
        if(noProductFound){
            return res.send("Product does not exist in the database");
        }
        pool.query(product_query.deleteProduct,[prod_id],(error,results)=>{
            if(error) throw error;
            res.status(200).send("Product removed Successfully!!!");
        })
    });
};

const addProducts=async(req,res)=>{
    const { product_name, description, brand, price, category, seller_id } = req.body;

    try {
        const role_val=authorize.auth(token);
        if (role_val.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You do not have the necessary privileges.' });
        }

        const existingProduct = await pool.query(product_query.existingProduct, [product_name, brand, seller_id]);

        if (existingProduct.rows.length > 0) {
            return res.status(409).json({ message: 'Product already exists. Update the quantity.' });
        }

        await pool.query(product_query.addProducts, [product_name, description, brand, price, category, seller_id]);
        return res.status(201).json({ message: 'Product added successfully.' });
    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

}

    const getProductById=async(req,res)=>{
    
    try {
        const prod_id = parseInt(req.params.id);
        const result = await pool.query(product_query.getProductById, [prod_id]);

        if (result && result.rows && result.rows.length > 0) {
            const product = result.rows[0];
            return res.status(200).json({ product });
        } else {
            return res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    
};

const getProductByCategory=async(req,res)=>{
    try {
        const category = req.params.category;
        console.log(category);
        const result = await pool.query(product_query.getProductByCategory, [category]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = result.rows;
        res.status(200).json({ product });
    } catch (error) {
        console.error('Error fetching product by category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const updateProductsByQuantity=async(req,res)=>{
   
    const { seller_id, prod_id, quantity } = req.body;
    console.log(seller_id + " " + prod_id + " " + quantity);

    try {
        const existingProduct = await pool.query(product_query.getProductById, [prod_id]);

        if (existingProduct.rows.length > 0) {
            await pool.query(product_query.updateProductsByQuantity, [quantity, seller_id, prod_id]);
            return res.status(200).json({ message: 'Product updated successfully.' });
        } else {
            return res.status(404).json({ message: 'Your product does not exist.' });
        }
    } catch (error) {
        console.error('Error updating product by quantity:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

}

const finalPrice = async (req, res) => {
    try {
        const prod_id = req.params.id;
        const result = await pool.query(product_query.finalPrice, [prod_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = result.rows[0];
        res.status(200).json({ product });
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
    updateProductsByQuantity,
    finalPrice,

}