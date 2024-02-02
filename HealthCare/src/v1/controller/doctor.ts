import { Request, Response } from 'express';
import express from "express";
import DoctorModel,{Doctor}  from '../model/dbdoctor';
import AppointmentModel from '../model/dbappointment';
import {Appdb }from '../model/appdb';
import * as Joi from 'joi';
import  {validations}  from '../library/validations';
import { Functions } from '../library/functions';
import { signUp,validatesignUpDoctor,loginSchema,login } from '../middleware/UserAuthHandler';
import { verifyToken ,checkAccess, checkAuth} from '../middleware/checkAuth';

const functions=new Functions();
const appdb=new Appdb();

const doctorRouter = express.Router();

doctorRouter.post('/signup',validatesignUpDoctor,signup);
doctorRouter.post('/signin',loginSchema,login);
doctorRouter.post('/updateAppointment',checkAuth,checkAccess('doctor'),validateUpdateAppointment,updateAppointment);
doctorRouter.get('/patients',checkAuth,checkAccess('doctor'),allPatientOfParticularDoctor);
export default doctorRouter;



// ---------------------------VALIDATIONS---------------------------------------
function validateUpdateAppointment(req: any, res: any, next: any) {
  
  const schema = Joi.object({
    appointment_id: Joi.number().integer().min(1).required(),
    appointment_fee: Joi.number().precision(2).min(0).required(),
    Disease: Joi.string().max(255).required(),
    appointment_status: Joi.string().valid('Scheduled', 'Completed', 'Cancelled').required(),
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
      return false;
  }
}

// ----------------------------------------------------------------------------------------



async function signup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const user: Doctor[] | null = await DoctorModel.getUserByCriteria({email:req.body.email},'');
       console.log(user);
    if (!user) {
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

async function allPatientOfParticularDoctor(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try{

    const doctor_id=(req as any).user.user_id;
    
    const patientDetails=await DoctorModel.allPatientOfParticularDoctor(doctor_id);
    return res.json({ error: false, message: 'Doctor details retrieved successfully', data: patientDetails });

  }
  catch (error) {
    return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
  }

}


async function updateAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const { appointment_id, appointment_fee, Disease, appointment_status } = req.body;

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


async function incomeOfThatDay(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
    const {date}=req.body;
    const doctor_id=(req as any).user.user_id;
    


}


   