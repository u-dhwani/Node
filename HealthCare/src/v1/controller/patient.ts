import express, { Request, Response } from "express";
import * as Joi from 'joi';
import { Functions } from '../library/functions';
import { validations } from '../library/validations';
import { login, loginSchema, signUp, validatesignUpPatient } from '../middleware/UserAuthHandler';
import { checkAccess, checkAuth } from '../middleware/checkAuth';
import { Appdb } from '../model/appdb';
import AppointmentModel, { Appointment } from '../model/dbappointment';
import DoctorModel from '../model/dbdoctor';
import HospitalModel from '../model/dbhospital';
import PatientModel, { Patient } from '../model/dbpatient';
import PatientInsuranceModel, { PatientInsurance } from "../model/dbpatientinsurance";
const functions = new Functions();
const appdb = new Appdb();

const patientRouter = express.Router();

patientRouter.post('/signup', validatesignUpPatient, signup);
patientRouter.post('/signin', loginSchema, login);
patientRouter.post('/appointment', checkAuth, checkAccess('patient'), validateAppointment, appointment);
patientRouter.get('/hospitals', checkAuth, checkAccess('patient'), validateGetAllHospital, getAllHospital);
patientRouter.get('/hospital/:id', checkAuth, checkAccess('patient'), getAllDoctorOfParticularHospital);
patientRouter.post('/addInsurance', checkAuth, checkAccess('patient'), validateaddInsurance, addInsurance);

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


function validateaddInsurance(req: any, res: any, next: any) {

  const schema = Joi.object({
    insurance_plan_id: Joi.number().integer().positive().required(),
    policy_number: Joi.string().required(),
    policy_buy_date: Joi.date().required(),
    subscriber_first_name: Joi.string().required(),
    subscriber_last_name: Joi.string().required(),
    subscriber_date_of_birth: Joi.date().required(),
    subscriber_phone_number: Joi.string().required()
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
    const user: Patient[] | null = await PatientModel.getUserByCriteria({ email: req.body.email }, '');

    if (!user) {
      const role: string = 'patient';
      return signUp(req, res, role);
    }
    else {
      return res.send(functions.output(404, 'User Found', user));
    }
  }
  catch (error) {
    console.error('Error in signup:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

async function addInsurance(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {

    const { insurance_plan_id, policy_number, policy_buy_date, subscriber_first_name, subscriber_last_name, subscriber_date_of_birth, subscriber_phone_number } = req.body
    const patient_id = (req as any).user.user_id;

    const formattedDate = policy_buy_date.toISOString().split('T')[0];
    const subscriber_dob = subscriber_date_of_birth.toISOString().split('T')[0];
    const newUser: PatientInsurance = {
      patient_id,
      insurance_plan_id,
      policy_number,
      policy_buy_date: formattedDate,
      subscriber_first_name,
      subscriber_last_name,
      subscriber_date_of_birth: subscriber_dob,
      subscriber_phone_number
    }

    const addInsuranceDetails = await PatientInsuranceModel.createRecord(newUser);
    return res.send(functions.output(200, 'Insurance added successfully', { addInsuranceDetails }));

  }
  catch (error) {
    console.error('Error in adding Insurance details:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

async function getAllHospital(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const { city, state } = req.body;

    const hospitalDetails = await HospitalModel.getUserByCriteria({ city: city, state: state }, 'ORDER BY hospital_name');

    return res.send(functions.output(200, 'Hospital details retrieved successfully', hospitalDetails));

  } catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

async function getAllDoctorOfParticularHospital(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {

    const { hospital_id } = { hospital_id: parseInt(req.params.id, 10) };

    const doctorDetails = await PatientModel.getAllDoctorOfParticularHospital(hospital_id);

    return res.send(functions.output(200, 'Doctor details retrieved successfully', doctorDetails));


  } catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}



async function appointment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const { doctor_id, hospital_id, appointment_date, appointment_time, appointment_status } = req.body;
    const patient_id = (req as any).user.user_id;
    const patient = await PatientModel.getUserByCriteria({ patient_id: patient_id }, '');
    const doctor = await DoctorModel.getUserByCriteria({ doctor_id: doctor_id }, '');
    const hospital = await HospitalModel.getUserByCriteria({ hospital_id: hospital_id }, '');

    if (!patient || !doctor || !hospital) {
      return res.send(functions.output(404, 'Patient, doctor, or hospital not found', null));
    }

    // Create the appointment

    const appointmentDate = new Date(appointment_date);
    const formattedDate = appointmentDate.toISOString().split('T')[0];

    const appointment: Appointment = await AppointmentModel.createRecord({
      patient_id,
      doctor_id,
      hospital_id,
      appointment_date: formattedDate,
      appointment_time,
      appointment_status
    });

    return res.send(functions.output(200, 'Appointment created successfully', { appointment }));
  } catch (error) {
    console.error('Error in appointment creation:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}



//------------------------------------------------------------------------------------------

// async function getHospitalDoctorDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
//   try {
//     const doctorDetails = await PatientModel.getHospitalDoctorDetails();

//     return res.send({ error: false, message: 'Doctor details retrieved successfully', data: doctorDetails });
//   } catch (error) {
//     console.error('Error in retrieving doctor details:', error);
//     return res.send(functions.output(500, 'Internal Server Error', null));
//   }
// }