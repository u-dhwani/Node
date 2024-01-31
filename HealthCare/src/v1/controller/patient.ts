import { Request, Response } from 'express';
import express from "express";
import PatientModel,{Patient}  from '../model/dbpatient';
import DoctorModel,{Doctor}  from '../model/dbdoctor';
import HospitalModel,{Hospital}  from '../model/dbhospital';
import AppointmentModel, { Appointment } from '../model/dbappointment';
import {Appdb }from '../model/appdb';
import { Functions } from '../library/functions';
import {signUp,validatesignUpPatient,loginSchema,login} from '../middleware/UserAuthHandler'; 
import { verifyToken ,checkAccess, checkAuth} from '../middleware/checkAuth';


const functions=new Functions();
const appdb=new Appdb();

const patientRouter = express.Router();

patientRouter.post('/signup',validatesignUpPatient,signup);
patientRouter.post('/signin',loginSchema,login);
patientRouter.post('/appointment',checkAuth,checkAccess('patient'),appointment);

export default patientRouter;


async function signup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const user: Patient[] | null = await PatientModel.getUserByEmail(req.body.email);
        
    if (Array.isArray(user) && user.length === 0) {
      const role: string = 'patient';
      return signUp(req, res, role); 
    }
    else{  
        return res.status(404).json({ error: true, message: 'User Found', data: user });
    }
  }
  catch (error) {
    console.error('Error in signup:', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
  }
}


async function appointment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try{
      const { doctor_id, hospital_id, appointment_date, appointment_time, appointment_status } = req.body;
      const patient_id = (req as any).user.user_id;
      const patient = await PatientModel.getUserById(patient_id);
      const doctor = await DoctorModel.getUserById(doctor_id);
      const hospital = await HospitalModel.getUserById(hospital_id);

      if (!patient || !doctor || !hospital) {
        return res.status(404).json({ error: true, message: 'Patient, doctor, or hospital not found', data: null });
      }

      // Create the appointment
      const appointment:Appointment = await AppointmentModel.createRecord({
        patient_id,
        doctor_id,
        hospital_id,
        appointment_date,
        appointment_time,
        appointment_status
      });

      return res.json({ error: false, message: 'Appointment created successfully', data: { appointment } });
    } catch (error) {
    console.error('Error in appointment creation:', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
  }
}

  