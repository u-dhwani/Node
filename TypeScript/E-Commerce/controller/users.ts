import { Request, Response } from 'express';
import UserModel ,{User} from '../models/users';
import { generateToken } from '../utils/jwttoken';
import {validateLogin,validateSignup,validateDeleteByEmailSchema,validateUpdateProfile} from '../validations/users';
import * as bcrypt from 'bcrypt';

import { paginate } from '../utils/pagination';
import { ValidationResult } from 'joi';

class AuthController{

  async signup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
    try {
      // const validationResult = validateSignup(req.body);

      // if (validationResult.error) {
      //   return res.status(400).json({ message: validationResult.error.details[0].message, error:true, data:null});
      // }

      const { full_name, email, password, phone_no, address, role } = req.body;

      // Check if the user already exists
      const result = await UserModel.getUserByEmail(email);
      if (result.error) {
        return res.status(400).json({ error: true, message: result.message, data: result.data });
      }
      if(result.data.length>0){
        return res.status(400).json({ error: true, message: "User already exist", data: null });
      
      }
      

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser: User = {
        full_name,
        email,
        password:hashedPassword,
        phone_no,
        address,
        role,
      };

      const user_id_query=await UserModel.createUser(newUser);
      if(user_id_query.error){
        return {
            error : true,
            message : user_id_query.message,
            data : null
        }
    }
    const { user_id } = user_id_query.data;
      
      const token = generateToken({ email, role: newUser.role, user_id: user_id});
      return res.json({ error: false, message: 'Signup successful', data: { token } });
    } 
    catch (error) {
      console.error('Error in signup:', error);
      return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
    }
  }
  // Response<any, Record<string, any>>
  async login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
    try {
      // const validationResult=validateLogin(req.body);

      // if (validationResult.error) {
      //   return res.status(400).json({ message: validationResult.error.details[0].message });
      // }

      const { email, password } = req.body;

      const user: User | null = await UserModel.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ error: true, message: 'User not found', data: null });
      }
      
      console.log(user);
      
      console.log('user.password:', user.password);
      console.log('password:', password);

      //Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const token = generateToken({ email,role:user.role ,user_id: user.user_id!});
        return res.json({ error: false, message: 'Login successful', data: { token } });
      } else {
        return res.status(401).json({ error: true, message: 'Password is incorrect', data: null });
        
      }
    } catch (error) {
      console.error('Error in login:', error);
      return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
    }
  }
}

class UserController{
    async getUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any>  {
    try {
      const page: number = Number(req.query.page) || 1;
      const pageSize: number = 5;

      // Assuming paginate returns an object with an offset property
      const { offset }: { offset: number } = paginate(page, pageSize);

      // Assuming getAllUsers returns a promise with a rows property
      const results = await UserModel.getAllUsers(pageSize, offset);
      if(results.error){
        return res.status(200).json({
          error: true,
          message: 'Error in retrieving all users',
          data: results});
      }

      return res.status(200).json({
        error: false,
        message: 'Users retrieved successfully',
        data: results});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
    }
  };

  async deleteByEmail (req: Request, res: Response): Promise<Response<any, Record<string, any>> | any>  {
    try {
     // const validationResult= validateDeleteByEmailSchema(req.body);
      const {email}=req.body;
      // Check if the email exists
      const checkForUser = await UserModel.getUserByEmail(email);
  
      if (checkForUser.error) {
        return res.status(400).json({ error: true, message: checkForUser.message, data: checkForUser.data });
      }
      else if (!checkForUser) {
        return res.status(404).json({ error: "User not found in the database", data: null });
      }
  
      // User found, proceed with the deletion
      const deleteResult = await UserModel.removeUserByEmail(email);
  
      if (deleteResult) {
        return res.status(200).json({ message: "User removed successfully", data: deleteResult });
      } else {
        return res.status(404).json({ error: "User not found or not deleted", message: "Custom error message", data: null });

      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
    }
  };

  async updateAddressOfUserByEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any>  {
    try {
     // const validationResult = validateUpdateProfile(req.body);
      const {email,address}=req.body;
      // Check if the email exists
      const checkResult = await UserModel.getUserByEmail(email);
  
      if (checkResult.error) {
        return res.status(400).json({ error: true, message: checkResult.message, data: checkResult.data });
      }
      if (!checkResult) {
        return res.status(404).json({ error: "User not found in the database", data: null });
      }
  
      // User found, proceed with the update
      const result=await UserModel.updateAddressOfUserByEmail(address, email);
      if(result.error){
        return res.status(400).json({ error: true, message: result.message, data: result.data });
      
      }
  
      return res.status(200).json({ error: null, message: 'User Updated Successfully!!!', data: null });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
    }
  };

}
 
export default {AuthController,UserController};
