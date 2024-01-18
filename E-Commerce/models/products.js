const {pool} = require('../dbConfig');

//const addProducts="insert into products(product_name, description, brand, price, category, seller_id) values($1,$2,$3,$4,$5,$6)";
const addProducts = async (productName, description, brand, price, category, sellerId,discount_percentage,quantity) => {

    try {   
      const result = await pool.query('INSERT INTO products(product_name, description, brand, price, category, seller_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *', [productName, description, brand, price, category, sellerId]);
      await pool.query('Insert into seller( seller_id ,prod_id , discount_percentage ,quantity) values($1,$2,$3,$4)',[sellerId,result.rows[0].prod_id,discount_percentage,quantity]);
      console.log(result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };


// const getAllProducts="select * from products";
const getAllProducts = async (pageSize,offset) => {
    
    try {
      const result = await pool.query( 'SELECT p.*, ' +
      'p.price * ((100 - s.discount_percentage) / 100) AS final_amount, ' +
      'p.price AS initial_amount ' +
      'FROM products p ' +
      'LEFT JOIN seller s ON p.prod_id = s.prod_id ' +
      'WHERE p.status = \'active\' ' +
      'ORDER BY p.prod_id ' +
      'LIMIT $1 OFFSET $2',[pageSize,offset]);
      return {rows:result.rows};
    } catch (error) {
      console.error('Error executing getAllProducts query:', error);
      throw error;
    }
  };


//const getProductById="select * from products where prod_id=$1";
const getProductById = async (productId) => {
    try {
      const result = await pool.query('SELECT * FROM products WHERE prod_id = $1', [productId]);
  
      if (result.rows.length === 0) {
        throw null;
      }
  
      return result.rows[0];
    } catch (error) {
      console.error(`Error retrieving product with ID ${productId}:`, error);
      throw error;
    }
  };


// const getProductByCategory="select * from products where category=$1";
const getProductByCategory = async (category) => {
    try {
      const result = await pool.query('SELECT * FROM products WHERE category = $1', [category]);
      return result.rows || []; // Return an empty array if result.rows is falsy
    } catch (error) {
      console.error('Error retrieving products by category:', error);
      throw error;
    }
  };
  
  
// const deleteProduct="delete from products where prod_id=$1";
const deleteProduct = async (productId) => {
    try {
      console.log(`Deleting product with ID ${productId}`);
      
      //const result = await pool.query('DELETE FROM products WHERE prod_id = $1 RETURNING *', [productId]);
      const result = await pool.query('UPDATE products SET status=\'inactive\' WHERE prod_id = $1 returning *',[productId]);

      console.log('Deletion result:', result.rows);
  
      if (result.rows.length === 0) {
        throw new Error('Product not found'); // Throw an error if the product does not exist
      }
  
      return result.rows[0];
    } catch (error) {
      console.error(`Error deleting product with ID ${productId}:`, error);
      throw error;
    }
  };
  
// const updateProductsByQuantity="update seller set quantity=$1 where seller_id=$2 and prod_id=$3";
const updateProductsByDiscountQuantity = async (quantity, sellerId,productId, discount_percentage) => {
    try {
      const result = await pool.query('UPDATE seller SET quantity=$1,discount_percentage=$4 WHERE seller_id=$2 AND prod_id=$3 RETURNING *', [quantity, sellerId, productId,discount_percentage]);
  
      if (result.rows.length === 0) {
        throw new Error('Seller or product not found'); // Throw an error if the seller or product does not exist
      }
  
      return result.rows[0];
    } catch (error) {
      console.error(`Error updating product quantity for seller ${sellerId} and product ${productId}:`, error);
      throw error;
    }
  };


// const finalPrice="SELECT p.price * ((100 - s.discount_percentage) / 100) AS final_amount, p.price as initial_amount FROM products p NATURAL JOIN seller s WHERE p.prod_id = $1";
const finalPrice = async (productId) => {
    try {
      const result = await pool.query(`
        SELECT p.price * ((100 - s.discount_percentage) / 100) AS final_amount, p.price as initial_amount
        FROM products p
        NATURAL JOIN seller s
        WHERE p.prod_id = $1
      `, [productId]);
  
      return result.rows;
    } catch (error) {
      console.error(`Error calculating final price for product with ID ${productId}:`, error);
      throw error;
    }
  };



//const existingProduct="SELECT * FROM products WHERE product_name = $1 AND seller_id = $3 AND brand = $2";
const existingProduct = async (productName, brand, sellerId) => {
    try {
      const result = await pool.query('SELECT * FROM products WHERE product_name = $1 AND brand = $2 AND seller_id = $3', [productName, brand, sellerId]);
  
      return result.rows;
    } catch (error) {
      console.error('Error checking existing product:', error);
      throw error;
    }
  };


module.exports={
    addProducts,
    getAllProducts,
    getProductById,
    getProductByCategory,
    deleteProduct,
    updateProductsByDiscountQuantity,
    finalPrice,
    existingProduct,
    
   
}