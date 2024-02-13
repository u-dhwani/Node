import express, { Request, Response } from "express";
import * as Joi from 'joi';
import { Functions } from '../library/functions';
import { validations } from '../library/validations';
import { signUp, validatesignUpDoctor } from '../middleware/UserAuthHandler';
import { checkAccess, checkAuth,validatepage } from '../middleware/checkAuth';
import { Appdb } from '../model/appdb';
import AppointmentModel from '../model/dbappointment';
import DoctorModel, { Doctor } from '../model/dbdoctor';
import DoctorAvailabilityModel, { DoctorAvailability } from "../model/dbdoctoravailability";

const functions = new Functions();
const appdb = new Appdb();

const doctorRouter = express.Router();

doctorRouter.post('/signup', validatesignUpDoctor, signup);
doctorRouter.get('/patients', checkAuth, checkAccess('doctor'), validatepage, allPatientOfParticularDoctor);
doctorRouter.post('/addSchedule', checkAuth, checkAccess('doctor'), validateaddSchedule, addSchedule);
doctorRouter.get('/income', checkAuth, checkAccess('doctor'), validateincomeOfThatDay, incomeOfThatDay);
doctorRouter.put('/updateDoctorAvailability', checkAuth, checkAccess('doctor'), validateupdateDoctorAvailability, updateDoctorAvailability);
//doctorRouter.put('/updateFeesForAdmitPatient', checkAuth, checkAccess('doctor'), validateupdateFeesForAdmitPatient, updateFeesForAdmitPatient);
export default doctorRouter;



// ---------------------------VALIDATIONS---------------------------------------


function validateaddSchedule(req: any, res: any, next: any) {


  const schema = Joi.object({
    hospital_id: Joi.number().integer().min(1).required(),
    start_time: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).required(), // Regex to validate time format HH:mm:ss
    end_time: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).required(), // Regex to validate time format HH:mm:ss
    duration: Joi.number().integer().positive().required(),
    days: Joi.string().valid('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday').required()
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}

function validateupdateDoctorAvailability(req: any, res: any, next: any) {

  const schema = Joi.object({
    hospital_id: Joi.number().integer().min(1).required(),
    start_time: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).required(), // Regex to validate time format HH:mm:ss
    days: Joi.string().valid('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday').required(),
    end_time: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).required()

  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}




function validateupdateFeesForAdmitPatient(req: any, res: any, next: any) {

  const schema = Joi.object({
    patient_admit_id: Joi.number().integer().min(1).required(),
    doctor_fees: Joi.number().integer().min(1).required(),


  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}

function validateincomeOfThatDay(req: any, res: any, next: any) {

  const schema = Joi.object({
    income_date: Joi.date().iso().required(),
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
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}


async function addSchedule(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  const doctor_id = (req as any).user.user_id;
  const { hospital_id, start_time, end_time, duration, days } = req.body;

  const newSchedule: DoctorAvailability = {
    doctor_id,
    hospital_id,
    start_time,
    end_time,
    duration,
    days
  }

  const alreadyPresent = await DoctorAvailabilityModel.getUserByCriteria({ doctor_id: doctor_id, hospital_id: hospital_id, days: days }, '');

  if (alreadyPresent.length > 0) {
    return res.send(functions.output(500, 'Already schedule is present...If you want to change the time, update it', null));
  }

  const addScheduleDetails = await DoctorAvailabilityModel.insertRecord(newSchedule);
  if (!addScheduleDetails) {
    return res.send(functions.output(500, 'Failed to add insurance details', null));
  }
  return res.send(functions.output(200, 'Schedule added successfully', addScheduleDetails));



}
async function updateDoctorAvailability(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const { doctor_id } = (req as any).user.user_id;
    const { hospital_id, days, start_time, end_time } = req.body;

    const updateAvailabilityDetails = await DoctorAvailabilityModel.updateDoctorAvailability(doctor_id, hospital_id, start_time, end_time, days);
    if (!updateAvailabilityDetails) {
      return res.send(functions.output(404, 'Doctor details not found', null));
    }
    return res.send(functions.output(200, 'Doctor Availability Updated', updateAvailabilityDetails));
  }
  catch {
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}


async function allPatientOfParticularDoctor(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {

    const doctor_id = (req as any).user.user_id;
    const page: number = Number(req.query.page) || 1;

    const patientDetails = await DoctorModel.allPatientOfParticularDoctor(doctor_id, page);
    if (patientDetails.length === 0) {
      return res.send(functions.output(404, 'Patients not found', null));
    }
    return res.send(functions.output(200, 'Doctor details retrieved successfully', patientDetails));

  }
  catch (error) {
    return res.send(functions.output(500, 'Internal Server Error', null));
  }

}



async function incomeOfThatDay(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const { income_date } = req.body;
    console.log(income_date);
    const doctor_id = (req as any).user.user_id;

    const formattedDate = income_date.toISOString().split('T')[0];

    const incomeDoctor = await AppointmentModel.incomeOfThatDay(formattedDate, doctor_id);
    console.log(incomeDoctor);

    if (incomeDoctor.length === 0) {
      return res.send(functions.output(404, 'Income Of That Day not found', null));
    }

    return res.send(functions.output(200, 'Income on that day', incomeDoctor));

  } catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}






// async function updateFeesForAdmitPatient(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
//   try {
//     const doctor_id = (req as any).user.user_id;
//     const { patient_admit_id, doctor_fees } = req.body;

//     const result = await PatientAdmitModel.updateRecord(patient_admit_id, { doctor_fees });
//     if (!result) {
//       return res.send(functions.output(404, 'Patient Not Found', null));

//     }

//     return res.send(functions.output(200, 'Fees added successfully', result.data));
//   }
//   catch (error) {
//     console.error('Error updating appointment:', error);
//     return res.send(functions.output(500, 'Internal Server Error', null));
//   }
// }
