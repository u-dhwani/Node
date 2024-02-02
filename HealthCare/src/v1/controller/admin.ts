import { Request, Response } from 'express';
import express from "express";
import adminModel,{Admin}  from '../model/dbadmin';
import {Appdb }from '../model/appdb';
import { Functions } from '../library/functions';
import * as bcrypt from 'bcrypt';
import { signUp,validatesignUpAdmin,loginSchema,login } from '../middleware/UserAuthHandler';

const functions=new Functions();
const appdb=new Appdb();

const adminRouter = express.Router();

adminRouter.post('/signup', validatesignUpAdmin,signup);

adminRouter.post('/signin',loginSchema,login);

export default adminRouter;


async function signup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const user: Admin[] | null = await adminModel.getUserByCriteria({email:req.body.email},'');
        
    if (!user) {
      const role: string = 'admin';
      return signUp(req, res, role); 
    }
    else{  
        return res.status(404).json({ error: true, message: 'User Found', data: null });
    }
  }
  catch (error) {
    console.error('Error in signup:', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
  }
}

  