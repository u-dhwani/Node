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
      const validationResult = validateSignup(req.body);

      if (validationResult.error) {
        return res.status(400).json({ message: validationResult.error.details[0].message, error:true, data:null});
      }

      const { full_name, email, password, phone_no, address, role } = validationResult.value;

      // Check if the user already exists
      const existingUser = await UserModel.getUserByEmail(email);
      if (existingUser) {
        return res.status(422).json({ message: 'Email already registered' });
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
      
      const token = generateToken({ email, role: newUser.role, user_id: user_id_query.user_id});
      return res.json({ token });
    } 
    catch (error) {
      console.error('Error in signup:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  // Response<any, Record<string, any>>
  async login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
    try {
      const validationResult=validateLogin(req.body);

      if (validationResult.error) {
        return res.status(400).json({ message: validationResult.error.details[0].message });
      }

      const { email, password } = validationResult.value;

      const user: User | null = await UserModel.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      
      }
      console.log(user);
      
      console.log('user.password:', user.password);
      console.log('password:', password);

      //Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const token = generateToken({ email,role:user.role ,user_id: user.user_id!});
        return res.json({ token });
      } else {
        return res.status(401).json({ message: 'Password is incorrect' });
        
      }
    } catch (error) {
      console.error('Error in login:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
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

      return res.status(200).json(results.rows); // OK STATUS
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  async deleteByEmail (req: Request, res: Response): Promise<Response<any, Record<string, any>> | any>  {
    try {
      const validationResult= validateDeleteByEmailSchema(req.body);
      const {email}=validationResult.value;
      // Check if the email exists
      const checkForUser = await UserModel.getUserByEmail(email);
  
      if (!checkForUser) {
        return res.send("User does not exist in the database");
      }
  
      // User found, proceed with the deletion
      const deleteResult = await UserModel.removeUserByEmail(email);
  
      if (deleteResult.success) {
        return res.status(200).send("User removed successfully!!!");
      } else {
        return res.status(404).json({ error: "User not found or not deleted" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  async updateAddressOfUserByEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any>  {
    try {
      const validationResult = validateUpdateProfile(req.body);
      const {email,address}=validationResult.value;
      // Check if the email exists
      const checkResult = await UserModel.getUserByEmail(email);
  
      if (!checkResult) {
        return res.status(404).json({ error: 'User not found in the database' });
      }
  
      // User found, proceed with the update
      await UserModel.updateAddressOfUserByEmail(address, email);
  
      return res.status(200).json({ message: 'User Updated Successfully!!!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

}
 
export default {AuthController,UserController};
