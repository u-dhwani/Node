import { Request, Response } from 'express';
import OrderModel from '../models/order';
import CartModel from '../models/cart';
import { paginate } from '../utils/pagination';
import {validateGetOrderDetails} from '../validations/order'

class OrderController {
   async placeOrder(req: Request, res: Response): Promise<void> {
    try {
      // Decode the token to get the user_Id
      const user_Id = (req as any).user_id;

      // Update cart amount (assuming you're passing 'counter' as a parameter)
      await CartModel.updateCartAmount();

      const addressResult = await OrderModel.addressUser(user_Id);

      const amountInCartOfUserResult = await OrderModel.amountInCartOfUser(user_Id);

      let amountuser: number;
      let address: string;

      if (amountInCartOfUserResult !== null && addressResult !== null) {
        amountuser = amountInCartOfUserResult.amount;
        address = addressResult.address;
      } else {
        console.error('Amount or address not found for user:', user_Id);
        // Handle the case where amountInCartOfUserResult or addressResult is null
        throw new Error('Address or amount not found.');
      }

      console.log(user_Id, address, amountuser);
      await OrderModel.insertIntoOrder(user_Id, address, amountuser);


      // Delete items from cart_item for the specified user_Id
      await OrderModel.deleteInCartItem(user_Id);

      // Update amount (assuming you have a query for updating the order amount)
      await OrderModel.updateCartAmount(user_Id);

      // Get current order details
      const results = await OrderModel.getCurrentOrderDetails(user_Id);

      res.status(200).json(results); // OK status
    } catch (error) {
      console.error('Error in getCurrentOrder:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

   async getDetailsOfAllOrderOfParticularUser(req: Request, res: Response): Promise<void> {
    try {
        const page: number = Number(req.query.page) || 1;
        const pageSize: number = 5;
  
        // Assuming paginate returns an object with an offset property
        const { offset }: { offset: number } = paginate(page, pageSize);

      const user_Id = (req as any).user_id;
      console.log('hello:' + user_Id);
      const results = await OrderModel.getDetailsOfAllOrderOfParticularUser(user_Id, pageSize, offset);
      res.status(200).json(results);
    } catch (error) {
      console.error('Error in getParticularOrder:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

   async getAllOrder(req: Request, res: Response): Promise<void> {
    try {
        const page: number = Number(req.query.page) || 1;
        const pageSize: number = 5;
  
        // Assuming paginate returns an object with an offset property
        const { offset }: { offset: number } = paginate(page, pageSize);
      const results = await OrderModel.getAllOrderDetails(pageSize, offset);
      res.status(200).json(results); // OK status
    } catch (error) {
      console.error('Error in getAllOrder:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

   async getDetailsOfParticularOrder(req: Request, res: Response): Promise<void> {
    const {order_id} = validateGetOrderDetails({ prod_id: parseInt(req.params.id) });
   
    try {
     // console.log(orderId);
      const results = await OrderModel.getDetailsOfParticularOrder(order_id);
      res.status(200).json(results);
    } catch (error) {
      console.error('Error in getParticularOrder:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

   async deleteOrder(req: Request, res: Response): Promise<void> {
    const { order_id } = validateGetOrderDetails(req.body);
    const user_Id = (req as any).user_id;
    OrderModel.deleteOrderFromOrderUser(order_id);
    OrderModel.deleteOrderFromOrderItem(user_Id);
    const results = await OrderModel.showAllOrder();
    res.status(200).json(results);
  }
}

export default new OrderController();
