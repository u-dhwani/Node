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
      return res.send(functions.output(404, 'User Found', null));
    }
  }
  catch (error) {
    console.error('Error in signup:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

  