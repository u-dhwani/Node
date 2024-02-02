import { Request, Response } from 'express';
import express from "express";
import PatientModel,{Patient}  from '../model/dbpatient';
import DoctorModel,{Doctor}  from '../model/dbdoctor';
import HospitalModel,{Hospital}  from '../model/dbhospital';
import * as Joi from 'joi';
import AppointmentModel, { Appointment } from '../model/dbappointment';
import {Appdb }from '../model/appdb';
import  {validations}  from '../library/validations';
import { Functions } from '../library/functions';
import {signUp,validatesignUpPatient,loginSchema,login} from '../middleware/UserAuthHandler'; 
import { checkAccess, checkAuth} from '../middleware/checkAuth';
const functions=new Functions();
const appdb=new Appdb();

const patientRouter = express.Router();

patientRouter.post('/signup',validatesignUpPatient,signup);
patientRouter.post('/signin',loginSchema,login);
patientRouter.post('/appointment',checkAuth,checkAccess('patient'),validateAppointment,appointment);
patientRouter.get('/hospitals',checkAuth,checkAccess('patient'),validateGetAllHospital,getAllHospital);
patientRouter.get('/hospital/:id',checkAuth,checkAccess('patient'),getAllDoctorOfParticularHospital);
getAllDoctorOfParticularHospital

export default patientRouter;

// ---------------------------VALIDATIONS---------------------------------------
function validateGetAllHospital(req: any, res: any, next: any) {
  
  const schema = Joi.object({
      city: Joi.string().trim().required(),
      state: Joi.string().trim().required()
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
      return false;
  }
}


function validateAppointment(req: any, res: any, next: any) {
  
  const schema = Joi.object({
    doctor_id: Joi.number().integer().positive().required(),
    hospital_id: Joi.number().integer().positive().required(),
    appointment_date: Joi.date().iso().required(),
    appointment_time: Joi.string().required(),
    appointment_status: Joi.string().valid('scheduled', 'cancelled', 'completed').required()  
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
      return false;
  }
}


// ----------------------------------------------------------------------------------------


// ---------------------------------PATIENT - CONTROLLER-------------------------------------

async function signup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const user: Patient[] | null = await PatientModel.getUserByCriteria({email:req.body.email},'');
        
    if (!user) {
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


async function getAllHospital(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const {city,state}=req.body;
    
    const doctorDetails = await HospitalModel.getUserByCriteria({city:city,state:state},'ORDER BY hospital_name');
    console.log(doctorDetails);

    return res.json({ error: false, message: 'Hospital details retrieved successfully', data: doctorDetails });
  } catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
  }
}

async function getAllDoctorOfParticularHospital(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    
    const { hospital_id } = { hospital_id: parseInt(req.params.id, 10) };

    const doctorDetails = await PatientModel.getAllDoctorOfParticularHospital(hospital_id);
    
    return res.json({ error: false, message: 'Doctor details retrieved successfully', data: doctorDetails });
  } catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
  }
}



async function appointment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try{
      const { doctor_id, hospital_id, appointment_date, appointment_time, appointment_status } = req.body;
      const patient_id = (req as any).user.user_id;
      const patient = await PatientModel.getUserByCriteria({patient_id:patient_id},'');
      const doctor = await DoctorModel.getUserByCriteria({doctor_id:doctor_id},'');
      const hospital = await HospitalModel.getUserByCriteria({hospital_id:hospital_id},'');

      if (!patient || !doctor || !hospital) {
        return res.status(404).json({ error: true, message: 'Patient, doctor, or hospital not found', data: null });
      }

      // Create the appointment

      const appointmentDate = new Date(appointment_date);
      const formattedDate = appointmentDate.toISOString().split('T')[0];
        
      const appointment:Appointment = await AppointmentModel.createRecord({
        patient_id,
        doctor_id,
        hospital_id,
        appointment_date:formattedDate,
        appointment_time,
        appointment_status
      });

      return res.json({ error: false, message: 'Appointment created successfully', data: { appointment } });
    } catch (error) {
    console.error('Error in appointment creation:', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
  }
}



//------------------------------------------------------------------------------------------

  // async function getHospitalDoctorDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
//   try {
//     const doctorDetails = await PatientModel.getHospitalDoctorDetails();

//     return res.json({ error: false, message: 'Doctor details retrieved successfully', data: doctorDetails });
//   } catch (error) {
//     console.error('Error in retrieving doctor details:', error);
//     return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
//   }
// }