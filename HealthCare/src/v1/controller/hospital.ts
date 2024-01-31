import { Request, Response } from 'express';
import express from "express";
import HospitalModel,{Hospital}  from '../model/dbhospital';
import {Appdb }from '../model/appdb';
import { Functions } from '../library/functions';
import * as bcrypt from 'bcrypt';
import { signUp,signUpSchema,loginSchema,login } from '../middleware/UserAuthHandler';

const functions=new Functions();
const appdb=new Appdb();

const hospitalRouter = express.Router();

hospitalRouter.post('/signup', signUpSchema,signup);

hospitalRouter.post('/signin',loginSchema,login);

export default hospitalRouter;


async function signup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const user: Hospital[] | null = await HospitalModel.getUserByEmail(req.body.email);
        
    if (Array.isArray(user) && user.length === 0) {
      const role: string = 'hospital';
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

  