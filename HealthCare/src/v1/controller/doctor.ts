import express, { Request, Response } from "express";
import * as Joi from 'joi';
import { Functions } from '../library/functions';
import { validations } from '../library/validations';
import { login, loginSchema, signUp, validatesignUpDoctor } from '../middleware/UserAuthHandler';
import { checkAccess, checkAuth } from '../middleware/checkAuth';
import { Appdb } from '../model/appdb';
import AppointmentModel from '../model/dbappointment';
import DoctorModel, { Doctor } from '../model/dbdoctor';

const functions = new Functions();
const appdb = new Appdb();

const doctorRouter = express.Router();

doctorRouter.post('/signup', validatesignUpDoctor, signup);
doctorRouter.post('/signin', loginSchema, login);
doctorRouter.post('/updateAppointment', checkAuth, checkAccess('doctor'), validateUpdateAppointment, updateAppointment);
doctorRouter.get('/patients', checkAuth, checkAccess('doctor'), allPatientOfParticularDoctor);
doctorRouter.get('/income', checkAuth, checkAccess('doctor'), validateincomeOfThatDay, incomeOfThatDay);
doctorRouter.get('/appointment', checkAuth, checkAccess('doctor'), todaysAppointment);
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


function validateincomeOfThatDay(req: any, res: any, next: any) {

  const schema = Joi.object({
    income_date: Joi.date().required(),
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}

// ----------------------------------------------------------------------------------------



async function signup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const user: Doctor[] | null = await DoctorModel.getUserByCriteria({ email: req.body.email }, '');
    console.log(user);
    if (!user) {
      const role: string = 'doctor';
      return signUp(req, res, role);
    }
    else {
      return res.send(functions.output(500, 'User Found', null));
    }
  }
  catch (error) {
    console.error('Error in signup:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}


async function allPatientOfParticularDoctor(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {

    const doctor_id = (req as any).user.user_id;

    const patientDetails = await DoctorModel.allPatientOfParticularDoctor(doctor_id);
    if (!patientDetails) {
      return res.send(functions.output(404, 'Patients not found', null));
    }
    return res.send(functions.output(200, 'Doctor details retrieved successfully', patientDetails));

  }
  catch (error) {
    return res.send(functions.output(500, 'Internal Server Error', null));
  }

}


async function updateAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const { appointment_id, appointment_fee, Disease, appointment_status } = req.body;

    const appointmentData = {
      appointment_fee,
      Disease,
      appointment_status
    };


    const result = await AppointmentModel.recordUpdate(appointment_id, appointmentData);
    if (!result) {
      return res.status(result.status).json({ error: true, message: result.message, data: null });
    }

    return res.send(functions.output(200, 'Appointment updated successfully', result.data));
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}


async function incomeOfThatDay(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const { income_date } = req.body;
    console.log(income_date);
    const doctor_id = (req as any).user.user_id;

    const formattedDate = income_date.toISOString().split('T')[0];

    const incomeDoctor = await DoctorModel.incomeOfThatDay(formattedDate, doctor_id);
    console.log(incomeDoctor);

    if (!incomeDoctor) {
      return res.send(functions.output(404, 'Income Of That Day not found', null));
    }

    return res.send(functions.output(200, 'Income on that day', incomeDoctor));

  } catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}


async function todaysAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const doctor_id = (req as any).user.user_id;
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const PatientDetails = await AppointmentModel.getUserByCriteria({ appointment_date: formattedDate, doctor_id: doctor_id }, 'ORDER BY appointment_time');

    if (!PatientDetails) {
      return res.send(functions.output(404, 'Patients not found', null));
    }

    return res.send(functions.output(200, 'Hospital details retrieved successfully', PatientDetails));

  } catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

