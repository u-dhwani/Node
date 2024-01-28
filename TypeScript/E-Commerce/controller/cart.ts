import { Request, Response } from 'express';
import { paginate } from '../utils/pagination';
import { validateUpdateProductQuantity, validateProductId } from '../validations/cart';

import CartModel,{Cart,CartItem} from '../models/cart';

class CartController {
  async addProductsInCart(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
    const validationResult = validateUpdateProductQuantity(req.body);
    const {prod_id,quantity}=validationResult.value;

    try {
      const user_Id = (req as any).user.user_id;
      const user_found = await CartModel.FindUserInCart(user_Id);

      await CartModel.createcartitem(user_Id, prod_id, quantity);

     
      if (!user_found) {
        const amount = 0.0;
        await CartModel.createCartQuery(user_Id, amount);
      }

      await CartModel.updateCartAmount();
      const cart_details = await CartModel.FindUserInCart(user_Id);
      if (cart_details) return res.status(200).json(cart_details);
    } catch {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async deleteProdfromCart(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
    const { prod_id } = (validateProductId(req.body)).value;

    try {
      const user_Id = (req as any).user_id;

      const results = await CartModel.checkProductInCartByuser_Id(user_Id, prod_id);

      if (results) {
        await CartModel.deleteProdfromCart(user_Id, prod_id);

        const presentInCartItem = await CartModel.checkUserInCartItem(user_Id);
        await CartModel.updateCartAmount();

        if (!presentInCartItem) {
          await CartModel.updateCartAmountAfterDelete(user_Id);
        } else {
          await CartModel.updateCartAmount();
        }
        const cartResult = await CartModel.FindUserInCart(user_Id);

        return res.status(200).json(cartResult);
      } else {
        return res.status(404).send('No product');
      }
    } catch (error) {
      console.error('Error deleting product from cart:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getAllProductsInCart(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
    try {
      const user_Id = (req as any).user_id;
      const page: number = Number(req.query.page) || 1;
      const pageSize: number = 5;

      // Assuming paginate returns an object with an offset property
      const { offset }: { offset: number } = paginate(page, pageSize);
      await CartModel.updateCartAmount();

      const results = await CartModel.getAllProductsInCart(user_Id, pageSize, offset);

      res.status(200).json(results);
    } catch (error) {
      console.error('Error getting all products in cart:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateByQuantity(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
    const validationResult = validateUpdateProductQuantity(req.body);
    const {prod_id,quantity}=validationResult.value;

    try {
      const user_Id = (req as any).user.user_id;

      const updateQuantityResult=await CartModel.updateQuantity(quantity, user_Id, prod_id);
      await CartModel.updateCartAmount();

      const page: number = Number(req.query.page) || 1;
      const pageSize: number = 5;

      // Assuming paginate returns an object with an offset property
      const { offset }: { offset: number } = paginate(page, pageSize);
      const results = await CartModel.getAllProductsInCart(user_Id,pageSize,offset);

      res.status(200).json(results);
    } catch (error) {
      console.error('Error updating quantity in cart:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new CartController();
