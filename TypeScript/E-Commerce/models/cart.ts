import { QueryResult } from 'pg';
import pool  from '../dbConfig';
import DbConnection,{Condition}  from '../dbConfig';

export interface CartItem {
  user_id: number;
  prod_id: number;
  quantity: number;
}

export interface Cart {
  user_id: number;
  amount: number;
}

class CartModel extends DbConnection<Cart| CartItem>{
  private cartItemModel: DbConnection<CartItem>;
  constructor() {
    super('cart');
    this.cartItemModel = new DbConnection<CartItem>('cart_item');
  }

    async FindUserInCart(userId: number): Promise<Cart | undefined> {
        try {
          const result: QueryResult<Cart> = await this.pool.query('SELECT * FROM cart WHERE user_id = $1', [userId]);
          return result.rows[0];
        } catch (error) {
          throw error;
        }
      }
    
      async createCartQuery(userId: number, amount: number): Promise<any> {
        try {
          // const result: QueryResult<Cart> = await this.pool.query(
          //   'INSERT INTO cart(user_id, amount) VALUES($1, $2) RETURNING *',
          //   [userId, amount]
          // );
          const cart={
            userId,
            amount
          }
          const result=this.addRecord(cart);
    
          return result;
        } catch (error) {
          throw error;
        }
      }
    
      async createcartitem(userId: number, prodId: number, quantity: number): Promise<CartItem> {
        try {
          const sellerQuantityResult: QueryResult<CartItem> = await this.pool.query(
            'SELECT quantity FROM seller WHERE prod_id = $1',
            [prodId]
          );
    
          if (!sellerQuantityResult.rows.length) {
            throw new Error('Seller does not have this product.');
          }
    
          const sellerQuantity: number = sellerQuantityResult.rows[0].quantity;
    
          if (sellerQuantity >= quantity) {
            const result: QueryResult<CartItem> = await this.pool.query(
              'INSERT INTO cart_item(user_id, prod_id, quantity) VALUES($1, $2, $3) RETURNING *',
              [userId, prodId, quantity]
            );
    
            return result.rows[0];
          } else {
            throw new Error('Insufficient quantity in the seller table.');
          }
        } catch (error) {
          throw error;
        }
      }
    
    
    
      async updateQuantity(quantity: number, userId: number, prodId: number): Promise<CartItem > {
        try {
          // await this.pool.query('UPDATE cart_item SET quantity = $1 WHERE user_id = $2 AND prod_id = $3', [quantity,userId,prodId,]);
          const result=this.cartItemModel.updateRecord(['user_id','prod_id'],[userId,prodId],{quantity:quantity});
          return result;
        } catch (error) {
          throw error;
        }
      }

      async updateCartAmount(): Promise<void> {
        try {
          await this.pool.query(`
            UPDATE cart
            SET amount = (
              SELECT COALESCE(SUM(p.price * ci.quantity), 0)
              FROM products p
              JOIN cart_item ci ON p.prod_id = ci.prod_id
              WHERE ci.user_id = cart.user_id
              GROUP BY ci.user_id
            )
            WHERE EXISTS (
              SELECT 1
              FROM cart_item ci
              WHERE ci.user_id = cart.user_id
            )
          `);
        } catch (error) {
          console.error('Error updating cart amount:', error);
          throw error;
        }
      }
    
      async deleteProdfromCart(userId: number, prodId: number): Promise<void> {
        try {
          // await this.pool.query('DELETE FROM cart_item WHERE user_id = $1 AND prod_id = $2', [userId, prodId]);
          // const result=this.deleteRecord('email',email);
          const conditions: Condition[] = [
            { columnName: 'user_id', value: userId },
            { columnName: 'prod_id', value: prodId },
          ];
          
          const result = await this.cartItemModel.deleteRecord(conditions);
        } catch (error) {
          console.error('Error deleting product from cart:', error);
          throw error;
        }
      }
    
      async checkProductInCartByuser_Id(userId: number, prodId: number): Promise<CartItem[]> {
        try {
          const result: QueryResult<CartItem> = await this.pool.query(
            'SELECT * FROM cart_item WHERE user_id = $1 AND prod_id = $2',
            [userId, prodId]
          );
          return result.rows;
        } catch (error) {
          console.error('Error checking product in cart:', error);
          throw error;
        }
      }
    
      async checkUserInCartItem(userId: number): Promise<CartItem | undefined> {
        try {
          const result: QueryResult<CartItem> = await this.pool.query('SELECT * FROM cart_item WHERE user_id = $1', [userId]);
          return result.rows[0];
        } catch (error) {
          console.error('Error checking user in cart item:', error);
          throw error;
        }
      }
    
      async updateCartAmountAfterDelete(userId: number): Promise<void> {
        try {
          const result = this.updateRecord(
            ['user_id'], // Array of column names for the WHERE clause
            [userId],    // Array of corresponding values
            { amount:0.0 } // Updated data
          );
          await this.pool.query('UPDATE cart SET amount = 0.0 WHERE user_id = $1', [userId]);
        } catch (error) {
          console.error('Error updating cart amount after delete:', error);
          throw error;
        }
      }
    
      async getAllProductsInCart(userId: number, pageSize: number, offset: number): Promise<CartItem[]> {
        try {
          const result: QueryResult<CartItem> = await this.pool.query(
            'SELECT * FROM cart JOIN cart_item ON cart.user_id = cart_item.user_id WHERE cart.user_id = $1 LIMIT $2 OFFSET $3',
            [userId, pageSize, offset]
          );
          return result.rows;
        } catch (error) {
          console.error('Error getting all products in cart:', error);
          throw error;
        }
      }
}

export default new CartModel();
