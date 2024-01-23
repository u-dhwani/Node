import { QueryResult } from 'pg';
import pool  from '../dbConfig';

interface OrderUser {
  order_id: number;
  user_id: number;
  address: string;
  amount: number;
  order_date: Date;
  curr_timestamp: Date;
}

interface OrderItem {
  order_item_id: number;
  prod_id: number;
  quantity: number;
}

class OrderModel {
   async deleteInCartItem(userId: number): Promise<void> {
    try {
      await pool.query('DELETE FROM cart_item WHERE user_id = $1', [userId]);
    } catch (error) {
      console.error('Error deleting from cart_item:', error);
      throw error;
    }
  }

   async updateCartAmount(userId: number): Promise<void> {
    try {
      await pool.query('UPDATE cart SET amount = 0.0 WHERE user_id = $1', [userId]);
    } catch (error) {
      console.error('Error updating cart amount:', error);
      throw error;
    }
  }

   async getCurrentOrderDetails(userId: number): Promise<OrderUser | null> {
    try {
      const result: QueryResult<OrderUser> = await pool.query(
        'SELECT * FROM order_user WHERE user_id = $1 ORDER BY order_date, curr_timestamp DESC',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting current order details:', error);
      throw error;
    }
  }

   async getAllOrderDetails(pageSize: number, offset: number): Promise<OrderUser[]> {
    try {
      const result: QueryResult<OrderUser> = await pool.query(
        'SELECT ou.order_id, ou.amount, SUM(oi.order_item_id) AS total_items, ou.order_date, ou.curr_timestamp ' +
          'FROM order_user ou ' +
          'JOIN order_item oi ON oi.order_item_id = ou.order_id ' +
          'GROUP BY ou.order_id ' +
          'ORDER BY ou.order_date, ou.curr_timestamp DESC LIMIT $1 OFFSET $2',
        [pageSize, offset]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting all order details:', error);
      throw error;
    }
  }

   async getDetailsOfAllOrderOfParticularUser(
    userId: number,
    pageSize: number,
    offset: number
  ): Promise<OrderUser[]> {
    try {
      console.log('user_id:', userId);
      const result: QueryResult<OrderUser> = await pool.query(
        'SELECT ou.order_id, SUM(oi.quantity) AS total_items, ou.amount, ou.order_date, ou.curr_timestamp ' +
          'FROM order_user ou ' +
          'JOIN order_item oi ON ou.order_id = oi.order_item_id ' +
          'WHERE ou.user_id = $1 ' +
          'GROUP BY ou.order_id, ou.amount, ou.order_date, ou.curr_timestamp ' +
          'ORDER BY ou.order_date DESC LIMIT $2 OFFSET $3',
        [userId, pageSize, offset]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

   async deleteOrderFromOrderItem(orderId: number): Promise<void> {
    try {
      await pool.query('DELETE FROM order_item WHERE order_item_id IN (SELECT order_id FROM order_user WHERE order_id = $1)', [
        orderId,
      ]);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

   async deleteOrderFromOrderUser(orderId: number): Promise<void> {
    try {
      await pool.query('DELETE FROM order_user WHERE order_id = $1', [orderId]);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

   async showAllOrder(): Promise<OrderUser[]> {
    try {
      const result: QueryResult<OrderUser> = await pool.query('SELECT * FROM order_user');
      return result.rows;
    } catch (error) {
      console.error('Error showing all orders:', error);
      throw error;
    }
  }

   async addressUser(userId: number): Promise<{ address: string } | null> {
    try {
      const result: QueryResult<{ address: string }> = await pool.query('SELECT address FROM users WHERE user_id = $1', [
        userId,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user address:', error);
      throw error;
    }
  }

   async amountInCartOfUser(userId: number): Promise<{ amount: number } | null> {
    try {
      const result: QueryResult<{ amount: number }> = await pool.query('SELECT amount FROM cart WHERE user_id = $1', [
        userId,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user amount:', error);
      throw error;
    }
  }

   async getDetailsOfParticularOrder(orderId: number): Promise<OrderItem[]> {
    try {
      const result: QueryResult<OrderItem> = await pool.query(
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

  async insertIntoOrder(userId: number, address: string, amountuser: number): Promise<void> {
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN'); // Start the transaction
  
      const getOrderIdResult = await client.query<{ order_id: number }>(
        'INSERT INTO order_user (user_id, address, amount, order_date,  curr_timestamp) VALUES ($1, $2, $3, CURRENT_DATE,  CURRENT_TIMESTAMP) RETURNING order_id',
        [userId, address, amountuser]
      );
  
      const orderId = getOrderIdResult.rows[0].order_id;
  
      // Check if the quantity in cart_item is greater than or equal to the quantity in the seller table
      const checkQuantityResult = await client.query<{
        prod_id: number;
        quantity: number;
        seller_quantity: number;
      }>(
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
        [orderId, userId]
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
}

export default new OrderModel();