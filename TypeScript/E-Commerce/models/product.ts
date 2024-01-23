import { QueryResult } from 'pg';
import pool  from '../dbConfig';

export interface Product {
  product_name: string;
  description: string;
  brand: string;
  price: number;
  category: string;
  seller_id:number;
  discount_percentage:number;
  quantity:number;
 
}


class ProductModel {
  async addProducts(product: Product): Promise<Product> {
    try {
      const result = await pool.query(
        'INSERT INTO products(product_name, description, brand, price, category, seller_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
        [product.product_name, product.description, product.brand, product.price, product.category, product.seller_id]
      );

      await pool.query('INSERT INTO seller(seller_id, prod_id, discount_percentage, quantity) VALUES($1, $2, $3, $4)', [
        product.seller_id,
        result.rows[0].prod_id,
        product.discount_percentage,
        product.quantity
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async getAllProducts(pageSize: number, offset: number): Promise<QueryResult<Product>> {
    try {
      const result = await pool.query(
        'SELECT p.*, ' +
          'p.price * ((100 - s.discount_percentage) / 100) AS final_amount, ' +
          'p.price AS initial_amount ' +
          'FROM products p ' +
          'LEFT JOIN seller s ON p.prod_id = s.prod_id ' +
          'WHERE p.status = \'active\' ' +
          'ORDER BY p.prod_id ' +
          'LIMIT $1 OFFSET $2',
        [pageSize, offset]
      );

      return result;
    } catch (error) {
      console.error('Error executing getAllProducts query:', error);
      throw error;
    }
  }

  async getProductById(productId: number): Promise<Product> {
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
  }

  async getProductByCategory(category: string): Promise<Product[]> {
    try {
      const result = await pool.query('SELECT * FROM products WHERE category = $1', [category]);
      return result.rows || [];
    } catch (error) {
      console.error('Error retrieving products by category:', error);
      throw error;
    }
  }

  async deleteProduct(productId: number): Promise<Product> {
    try {
      console.log(`Deleting product with ID ${productId}`);
      const result = await pool.query('UPDATE products SET status=\'inactive\' WHERE prod_id = $1 returning *', [productId]);

      if (result.rows.length === 0) {
        throw new Error('Product not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error(`Error deleting product with ID ${productId}:`, error);
      throw error;
    }
  }

  async updateProductsByDiscountQuantity(quantity: number, sellerId: number, productId: number, discount_percentage: number): Promise<Product> {
    try {
      const result = await pool.query(
        'UPDATE seller SET quantity=$1,discount_percentage=$4 WHERE seller_id=$2 AND prod_id=$3 RETURNING *',
        [quantity, sellerId, productId, discount_percentage]
      );

      if (result.rows.length === 0) {
        throw new Error('Seller or product not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error(`Error updating product quantity for seller ${sellerId} and product ${productId}:`, error);
      throw error;
    }
  }

  async finalPrice(productId: number): Promise<QueryResult<Product>> {
    try {
      const result = await pool.query(
        'SELECT p.price * ((100 - s.discount_percentage) / 100) AS final_amount, p.price as initial_amount ' +
          'FROM products p ' +
          'JOIN seller s ON p.prod_id = s.prod_id ' +
          'WHERE p.prod_id = $1',
        [productId]
      );

      return result;
    } catch (error) {
      console.error(`Error calculating final price for product with ID ${productId}:`, error);
      throw error;
    }
  }

  async existingProduct(productName: string, brand: string, sellerId: number): Promise<Product[]> {
    try {
      const result = await pool.query('SELECT * FROM products WHERE product_name = $1 AND brand = $2 AND seller_id = $3', [
        productName,
        brand,
        sellerId
      ]);

      return result.rows;
    } catch (error) {
      console.error('Error checking existing product:', error);
      throw error;
    }
  }
}

export default new ProductModel();
