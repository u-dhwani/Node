import { Request, Response } from 'express';
import express from "express";
import PatientModel,{Patient}  from '../model/dbpatient';
import DoctorModel,{Doctor}  from '../model/dbdoctor';
import HospitalModel,{Hospital}  from '../model/dbhospital';
import AppointmentModel from '../model/dbappointment';
import {Appdb }from '../model/appdb';
import { Functions } from '../library/functions';
import  {validations}  from '../library/validations';
import * as bcrypt from 'bcrypt';
import {signUp,signUpSchema,loginSchema,login}from '../middleware/UserAuthHandler'; 
import * as Joi from 'joi';

const functions=new Functions();
const appdb=new Appdb();

const patientRouter = express.Router();

patientRouter.post('/signup', signUpSchema,signup);
patientRouter.post('/signin',loginSchema,login);
patientRouter.post('/appointment',appointment);

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

    // Response<any, Record<string, any>>
//     async function login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
//       try {
//         const { email, password } = req.body;
  
//         const user: Patient[] | null = await PatientModel.getUserByEmail(email);
        
//         if (!user) {
//           return res.status(404).json({ error: true, message: 'User not found', data: null });
//         }
        
  
//         //Compare hashed password
//         const isMatch = await bcrypt.compare(password, user[0].password);
  
//         if (isMatch) {
//           if (user && user[0].patient_id !== undefined) {
//             const token = functions.generateToken({ email, role: 'patient', user_id: user[0].patient_id });
//             return res.json({ error: false, message: 'Login successful', data: { token } });
//           } else {
//             return res.json({ error: true, message: 'Login Unsuccessful', data: null });
//           }
          
           
//         } else {
//           return res.status(401).json({ error: true, message: 'Password is incorrect', data: null });
          
//         }
//       } catch (error) {
//         console.error('Error in login:', error);
//         return res.status(500).json({ error: true, message:'Internal Server Error', data: null });
//       }
//     }


async function appointment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try{
      const { patient_id, doctor_id, hospital_id, appointment_date, appointment_time, appointment_fee, appointment_status } = req.body;
      const patient = await PatientModel.getUserById(patient_id);
      const doctor = await DoctorModel.getUserById(doctor_id);
      const hospital = await HospitalModel.getUserById(hospital_id);

      if (!patient || !doctor || !hospital) {
        return res.status(404).json({ error: true, message: 'Patient, doctor, or hospital not found', data: null });
      }

      // Create the appointment
      const appointment = await AppointmentModel.createRecord({
        patient_id,
        doctor_id,
        hospital_id,
        appointment_date,
        appointment_time,
        appointment_fee,
        appointment_status,
      });

      return res.json({ error: false, message: 'Appointment created successfully', data: { appointment } });
    } catch (error) {
    console.error('Error in appointment creation:', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
  }
}

  