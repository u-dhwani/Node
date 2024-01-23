import { Request, Response } from 'express';
import { paginate } from '../utils/pagination';
import { TokenData } from '../utils/jwttoken';
import ProductModel,{Product} from '../models/product';
//import validate from '../validations/product';
import {
    validateProductId,
    validateCreateProduct,
    validateCategoryParam,
    validateUpdateProduct,
  } from '../validations/product';

  
class ProductController{
    async getAllProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
        try {
            const page: number = Number(req.query.page) || 1;
            const pageSize: number = 5;
      
            // Assuming paginate returns an object with an offset property
            const { offset }: { offset: number } = paginate(page, pageSize);
          const results = await ProductModel.getAllProducts(pageSize, offset);
          res.status(200).json(results.rows);
        } catch (error) {
          console.error('Error retrieving all products:', error);
          res.status(500).send('Internal Server Error');
        }
      }
    
      async deleteProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
        try {
          const { prod_id } = validateProductId({ prod_id: parseInt(req.params.id) });
          // Check if the product exists
          const checkResult = await ProductModel.getProductById(prod_id);
    
          if (!checkResult) {
            return res.status(404).send('Product does not exist in the database');
          }
    
          // Product exists, proceed to delete
          await ProductModel.deleteProduct(prod_id);
          res.status(200).send('Product removed Successfully!!!');
        } catch (error) {
          console.error('Error in deleteProduct:', error);
          res.status(500).send('Internal Server Error');
        }
      }
    
      async addProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
        const { product_name, description, brand, price, category, discount_percentage, quantity } =
          validateCreateProduct(req.body);
    
        try {
            const seller_id = (req as any).user_id;
          console.log(seller_id);
          const existingProduct = await ProductModel.existingProduct(product_name, brand, seller_id);
          if (existingProduct.length > 0) {
            return res.status(409).json({ message: 'Product already exists. Update the quantity.' });
          }
    
  
          const newProduct: Product = {
            product_name,
            description,
            brand,
            price,
            category,
            seller_id,
            discount_percentage,
            quantity
          };

          await ProductModel.addProducts(newProduct);
          res.status(201).json({ message: 'Product added successfully.' });
        } catch (error) {
          console.error('Error adding product:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    
      async getProductById(req: Request, res: Response): Promise<Response> {
        try {
          const { prod_id } = validateProductId({ prod_id: parseInt(req.params.id) });
          const result = await ProductModel.getProductById(prod_id);
    
          if (result) {
            return res.status(200).json({ product: result });
          } else {
            return res.status(404).json({ error: 'Product not found' });
          }
        } catch (error) {
          console.error('Error fetching product by ID:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    
      async getProductByCategory(req: Request, res: Response): Promise<Response> {
        try {
          const { category } = validateCategoryParam({ category: req.params.category });
          console.log(category);
          const products = await ProductModel.getProductByCategory(category);
    
          if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
          }
    
          return res.status(200).json({ products });
        } catch (error) {
          console.error('Error fetching product by category:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    
      async updateProductsByDiscountQuantity(req: Request, res: Response): Promise<Response> {
        try {
          const { prod_id, discount_percentage, quantity } = validateUpdateProduct(req.body);
          const seller_id = (req as any).user_id;
          const existingProduct = await ProductModel.getProductById(prod_id);
    
          if (existingProduct) {
            await ProductModel.updateProductsByDiscountQuantity(quantity, seller_id, prod_id, discount_percentage);
            return res.status(200).json({ message: 'Product updated successfully.' });
          } else {
            return res.status(404).json({ message: 'Your product does not exist.' });
          }
        } catch (error) {
          console.error('Error updating product by quantity:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    
      async finalPrice(req: Request, res: Response): Promise<Response> {
        try {
        //   const { productId } = validateProductId({ prod_id: parseInt(req.params.id) });
        //   const finalPriceInfo = await ProductModel.finalPrice(productId);
        const { prod_id } = validateProductId({ prod_id: parseInt(req.params.id) });
        const finalPriceInfo = await ProductModel.finalPrice(prod_id);
        
            
        if (Array.isArray(finalPriceInfo) && finalPriceInfo.length > 0) {
            return res.status(200).json({ finalPrice: finalPriceInfo[0] });
          } else {
            return res.status(404).json({ message: 'Product not found or discount information not available.' });
          }
        } catch (error) {
          console.error('Error fetching final price:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      }
     
    
   
}

export default new ProductController();
