import { Request, Response } from 'express';
import express from "express";
import DoctorModel,{Doctor}  from '../model/dbdoctor';
import {Appdb }from '../model/appdb';
import { Functions } from '../library/functions';
import { signUp,signUpSchema,loginSchema,login } from '../middleware/UserAuthHandler';
import * as bcrypt from 'bcrypt';

const functions=new Functions();
const appdb=new Appdb();

const doctorRouter = express.Router();

doctorRouter.post('/signup', signUpSchema,signup);
doctorRouter.post('/signin',loginSchema,login);

export default doctorRouter;


async function signup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const user: Doctor[] | null = await DoctorModel.getUserByEmail(req.body.email);
        
    if (Array.isArray(user) && user.length === 0) {
      const role: string = 'doctor';
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

   