import { QueryResult } from 'pg';
import DbConnection  from '../dbConfig';

export interface PartialProduct {
  prod_id?:number;
  product_name: string;
  description: string;
  brand: string;
  price: number;
  category: string;
  seller_id: number;
  status?:string;

}
export interface Product extends PartialProduct {
  discount_percentage: number;
  quantity: number;
}

export interface Seller {
  seller_id: number;
  prod_id:number;
  discount_percentage: number;
  quantity: number;
}

class ProductModel extends DbConnection<PartialProduct | Seller> {
  private sellerModel: DbConnection<Seller>;
  constructor() {
    super('products');
    this.sellerModel = new DbConnection<Seller>('seller');
  }
  
  async addProducts(product: Product): Promise<any> {
    
    try {
      const partialproduct: PartialProduct = {
        product_name: product.product_name,
        description: product.description,
        brand: product.brand,
        price: product.price,
        category: product.category,
        seller_id: product.seller_id,
      };

      // Insert product data into 'products' table
      const newProduct = await this.addRecord(partialproduct);

      // Insert seller data into 'seller' table
      if (newProduct && newProduct.prod_id !== undefined) {
        const sellerModel = new DbConnection<Seller>('seller');
        // Insert seller data into 'seller' table
        const seller: Seller = {
          seller_id: product.seller_id,
          prod_id: newProduct.prod_id,
          discount_percentage: product.discount_percentage,
          quantity: product.quantity,
           // Access prod_id only if it's defined
        };

        await this.sellerModel.addRecord(seller);
      } else {
        // Handle the case where newProduct.prod_id is undefined
        throw new Error('Unable to retrieve prod_id from newProduct');
      }

      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error; 
    }
  }


  async getAllProducts(pageSize: number, offset: number): Promise<QueryResult<Product>> {
    try {
      const result = await this.pool.query(
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
      const result = await this.pool.query('SELECT * FROM products WHERE prod_id = $1', [productId]);
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
      const result = await this.pool.query('SELECT * FROM products WHERE category = $1', [category]);
      return result.rows || [];
    } catch (error) {
      console.error('Error retrieving products by category:', error);
      throw error;
    }
  }

  async deleteProduct(productId: number): Promise<any> {
    try {
      console.log(`Deleting product with ID ${productId}`);
      //const result = await this.pool.query('UPDATE products SET status=\'inactive\' WHERE prod_id = $1 returning *', [productId]);
      const result=this.updateRecord(['prod_id'],[productId],{status:'inactive'}); 
     
      if (!result) {
        throw new Error('Product not found');
      }

      return result;
    } catch (error) {
      console.error(`Error deleting product with ID ${productId}:`, error);
      throw error;
    }
  }

  async updateProductsByDiscountQuantity(quantity: number, sellerId: number, productId: number, discount_percentage: number): Promise<Seller> {
    try {
      // const result = await this.pool.query(
      //   'UPDATE seller SET quantity=$1,discount_percentage=$4 WHERE seller_id=$2 AND prod_id=$3 RETURNING *',
      //   [quantity, sellerId, productId, discount_percentage]
      // );
      
      const result = this.sellerModel.updateRecord(
        ['seller_id', 'prod_id'], // Array of column names for the WHERE clause
        [sellerId, productId],    // Array of corresponding values
        { quantity:quantity, discount_percentage:discount_percentage } // Updated data
      );

      if (!result) {
        throw new Error('Seller or product not found');
      }

      return result;
    } catch (error) {
      console.error(`Error updating product quantity for seller ${sellerId} and product ${productId}:`, error);
      throw error;
    }
  }

  async finalPrice(productId: number): Promise<QueryResult<Product>> {
    try {
      const result = await this.pool.query(
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
      const result = await this.pool.query('SELECT * FROM products WHERE product_name = $1 AND brand = $2 AND seller_id = $3', [
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
