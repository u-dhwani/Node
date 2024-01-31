import { Request, Response } from 'express';
import express from "express";
import DoctorModel,{Doctor}  from '../model/dbdoctor';
import AppointmentModel from '../model/dbappointment';
import {Appdb }from '../model/appdb';
import { Functions } from '../library/functions';
import { signUp,validatesignUpDoctor,loginSchema,login } from '../middleware/UserAuthHandler';
import { verifyToken ,checkAccess, checkAuth} from '../middleware/checkAuth';

const functions=new Functions();
const appdb=new Appdb();

const doctorRouter = express.Router();

doctorRouter.post('/signup',validatesignUpDoctor,signup);
doctorRouter.post('/signin',loginSchema,login);
doctorRouter.post('/updateAppointment',checkAuth,checkAccess('doctor'),updateAppointment);

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


async function updateAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const { appointment_id, appointment_fee, Disease, appointment_status } = req.body;

    // Validate that required parameters are present
    if (!appointment_id || !appointment_fee || !Disease || !appointment_status) {
      return res.status(400).json({ error: true, message: 'Missing required parameters', data: null });
    }

    const whereClause = `WHERE appointment_id = ${appointment_id}`;
    const appointmentData = {
      appointment_fee,
      Disease,
      appointment_status
    };

   
    const result=await AppointmentModel.recordUpdate(appointment_id,appointmentData);
    if (result.status === 404 ) {
      return res.status(result.status).json({ error: true, message: result.message, data: null });
    }
    
    return res.json({ error: false, message: 'Appointment updated successfully', data: result.data });
   } catch (error) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
  }
}


   