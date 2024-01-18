const { pool } = require("../dbConfig");

//const FindUserInCart = 'SELECT * FROM cart WHERE user_id = $1';
const FindUserInCart = async (userId) => {
    try {
      const result = await pool.query('SELECT * FROM cart WHERE user_id = $1', [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user in cart:', error);
      throw error;
    }
  };

//const createCartQuery = 'INSERT INTO cart(user_id,amount) VALUES($1,$2)';
const createCartQuery = async (userId, amount) => {
    try {
      const result = await pool.query('INSERT INTO cart(user_id, amount) VALUES($1, $2) RETURNING *', [userId, amount]);
      return result.rows;
    } catch (error) {
      console.error('Error creating cart query:', error);
      throw error;
    }
  };


//const createcartitem="insert into cart_item(user_id,prod_id,quantity) values($1,$2,$3)";
const createcartitem = async (userId, prodId, quantity) => {
  try {
      // Check if there is sufficient quantity in the seller table
      const sellerQuantityResult = await pool.query(
          'SELECT quantity FROM seller WHERE  prod_id = $1',
          [ prodId]
      );

      if (!sellerQuantityResult) {
          throw new Error('Seller does not have this product.');
      }

      const sellerQuantity = sellerQuantityResult.rows[0].quantity;

      if (sellerQuantity >= quantity) {
          // If there is sufficient quantity, insert into cart_item
          const result = await pool.query(
              'INSERT INTO cart_item(user_id, prod_id, quantity) VALUES($1, $2, $3) RETURNING *',
              [userId, prodId, quantity]
          );

          return result.rows[0];
      } else {
          // If there is insufficient quantity, handle accordingly
          throw new Error('Insufficient quantity in the seller table.');
      }
  } catch (error) {
      console.error('Error creating cart item:', error);
      throw error;
  }
};



//const updateCartAmount="UPDATE cart SET amount = (SELECT COALESCE(SUM(p.price * ci.quantity), 0) FROM products p JOIN cart_item ci ON p.prod_id = ci.prod_id WHERE ci.user_id = cart.user_id GROUP BY ci.user_id) WHERE EXISTS (SELECT 1 FROM cart_item ci WHERE ci.user_id = cart.user_id)";
const updateCartAmount = async () => {
    try {
      await pool.query('UPDATE cart SET amount = (SELECT COALESCE(SUM(p.price * ci.quantity), 0) FROM products p JOIN cart_item ci ON p.prod_id = ci.prod_id WHERE ci.user_id = cart.user_id GROUP BY ci.user_id) WHERE EXISTS (SELECT 1 FROM cart_item ci WHERE ci.user_id = cart.user_id)');
    } catch (error) {
      console.error('Error updating cart amount:', error);
      throw error;
    }
  };


//const deleteProdfromCart="DELETE FROM cart_item WHERE user_id = $1 AND prod_id = $2";
const deleteProdfromCart = async (userId, prodId) => {
    try {
      await pool.query('DELETE FROM cart_item WHERE user_id = $1 AND prod_id = $2', [userId, prodId]);
    } catch (error) {
      console.error('Error deleting product from cart:', error);
      throw error;
    }
  };


//const checkProductByuser_Id="select * from cart_item where user_id=$1 and prod_id=$2";
const checkProductInCartByuser_Id = async (userId, prodId) => {
    try {
      const result = await pool.query('SELECT * FROM cart_item WHERE user_id = $1 AND prod_id = $2', [userId, prodId]);
      return result.rows;
    } catch (error) {
      console.error('Error checking product in cart:', error);
      throw error;
    }
  };


//const checkUserInCartItem="select * from cart_item where user_id=$1";
const checkUserInCartItem = async (userId) => {
    try {
      const result = await pool.query('SELECT * FROM cart_item WHERE user_id = $1', [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error checking user in cart item:', error);
      throw error;
    }
  };

//const updateCartAmountAfterDelete="update cart set amount=0 where user_id=$1";
const updateCartAmountAfterDelete = async (userId) => {
    try {
      await pool.query('UPDATE cart SET amount = 0.0 WHERE user_id = $1', [userId]);
    } catch (error) {
      console.error('Error updating cart amount after delete:', error);
      throw error;
    }
  };

//const getAllProductsInCart="SELECT * FROM cart JOIN cart_item ON cart.user_id = cart_item.user_id WHERE cart.user_id = $1";
const getAllProductsInCart = async (userId,pageSize,offset) => {
    try {
      const result = await pool.query('SELECT * FROM cart JOIN cart_item ON cart.user_id = cart_item.user_id WHERE cart.user_id = $1 LIMIT $2 OFFSET $3', [userId,pageSize,offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting all products in cart:', error);
      throw error;
    }
  };
  
//const updateQuantity="update cart_item set quantity=$1 where cart_item.user_id=$2 and cart_item.prod_id=$3";
const updateQuantity = async (quantity, userId, prodId) => {
    try {
      await pool.query('UPDATE cart_item SET quantity = $1 WHERE user_id = $2 AND prod_id = $3', [quantity, userId, prodId]);
    } catch (error) {
      console.error('Error updating quantity in cart item:', error);
      throw error;
    }
  };
module.exports={
    FindUserInCart,
    createCartQuery,
    createcartitem,
    updateCartAmount,
    checkProductInCartByuser_Id,
    deleteProdfromCart,
    checkUserInCartItem,
    updateCartAmountAfterDelete,
    getAllProductsInCart,
    updateQuantity
}

// select group by user_id