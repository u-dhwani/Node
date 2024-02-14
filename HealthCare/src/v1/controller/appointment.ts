import express, { Request, Response } from "express";
import * as Joi from 'joi';
import { Functions } from '../library/functions';
import { validations } from '../library/validations';
import { checkAccess, checkAuth, getPageNumber } from '../middleware/checkAuth';
import { Appdb } from '../model/appdb';
import AppointmentModel, { Appointment } from '../model/dbappointment';
import DoctorModel from '../model/dbdoctor';
import DoctorAvailabilityModel from "../model/dbdoctoravailability";
import HospitalModel from '../model/dbhospital';
import PatientModel from '../model/dbpatient';
import PatientAdmitModel from "../model/dbpatientadmit";
const functions = new Functions();
const appdb = new Appdb();

const appointmentRouter = express.Router();

appointmentRouter.post('/patient/addappointment', checkAuth, checkAccess('patient'), validatePatientAppointment, appointment);
appointmentRouter.post('/hospital/addappointment', checkAuth, checkAccess('hospital'), validateHospitalAppointment, appointment);
appointmentRouter.put('/doctor/updateAppointment', checkAuth, checkAccess('doctor'), validateUpdateAppointment, updateAppointment);
appointmentRouter.get('/doctor/todaysAppointment', checkAuth, checkAccess('doctor'), todaysAppointment);



export default appointmentRouter;

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

function validatePatientAppointment(req: any, res: any, next: any) {

  const schema = Joi.object({
    doctor_id: Joi.number().integer().positive().required(),
    hospital_id: Joi.number().integer().positive().required(),
    // appointment_date: Joi.date().min('now').max('now + 7 days') 
    appointment_date: Joi.date().iso().required(),
    appointment_time: Joi.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
    appointment_status: Joi.string().valid('Scheduled', 'Cancelled', 'Completed').required()
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}

function validateHospitalAppointment(req: any, res: any, next: any) {

  const schema = Joi.object({
    doctor_id: Joi.number().integer().positive().required(),
    patient_id: Joi.number().integer().positive().required(),
    appointment_date: Joi.date().iso().required(),
    doctor_fees: Joi.number().integer().positive().required(),
    appointment_time: Joi.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
    appointment_status: Joi.string().valid('Scheduled', 'Cancelled', 'Completed').required()
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}


async function todaysAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const doctor_id = (req as any).user.user_id;

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const PatientDetails = await AppointmentModel.getUserByCriteria({ appointment_date: formattedDate, doctor_id: doctor_id }, 'appointment_time', getPageNumber(req));

    if (PatientDetails.length === 0) {
      return res.send(functions.output(404, 'Patients not found', null));
    }

    return res.send(functions.output(200, 'Hospital details retrieved successfully', PatientDetails));

  } catch (error) {
    console.error('Error in retrieving doctor details:', error);
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


    const result = await AppointmentModel.updateRecord(appointment_id, appointmentData);
    if (!result) {
      return res.send(functions.output(404, 'Appointment Not Found', null));

    }

    return res.send(functions.output(200, 'Appointment updated successfully', result));
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

async function appointment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {

    const user_role = (req as any).user.role;
    console.log(user_role);
    let patient_id: number;
    let hospital_id: number;
    let doctor_id: number;
    let appointment_date: Date;
    let appointment_time: string;
    let appointment_status: string;
    let doctor_fees: number = 0;

    if (user_role === 'patient') {
      patient_id = (req as any).user.user_id;
      ({ doctor_id, hospital_id, appointment_date, appointment_time, appointment_status } = req.body);

    }
    else {
      hospital_id = (req as any).user.user_id;
      ({ doctor_id, patient_id, doctor_fees, appointment_date, appointment_time, appointment_status } = req.body);

    }

    const doctor = await DoctorModel.selectRecordBy(doctor_id);
    const hospital = await HospitalModel.selectRecordBy(hospital_id);
    const patient = await PatientModel.selectRecordBy(patient_id);


    if (patient.length === 0 || doctor.length === 0 || hospital.length === 0) {
      return res.send(functions.output(404, 'Patient, doctor, or hospital not found', null));
    }

    // Create the appointment

    const appointmentDate = new Date(appointment_date);
    const formattedDate = appointmentDate.toISOString().split('T')[0];

    const dayIndex = appointmentDate.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = dayNames[dayIndex];

    const appointment: Appointment = await AppointmentModel.insertRecord({
      patient_id,
      doctor_id,
      hospital_id,
      appointment_date: formattedDate,
      appointment_time,
      appointment_status
    });

    console.log(appointment_time);

    const addInBookedSlots = await DoctorAvailabilityModel.addBookedSlot(doctor_id, hospital_id, appointment_time, day);
    if (!addInBookedSlots) {
      return res.send(functions.output(500, 'Error in adding slot', null));
    }

    if (user_role === 'hospital') {
      const updateInDoctorFeesPatientAdmit = await PatientAdmitModel.updateDoctorFeesInPatientAdmit(doctor_id, hospital_id, patient_id, doctor_fees);
      if (!updateInDoctorFeesPatientAdmit) {
        return res.send(functions.output(500, 'Error in adding doctor fees in patient admit table', null));
      }
    }

    return res.send(functions.output(200, 'Appointment created successfully', { appointment }));
  } catch (error) {
    console.error('Error in appointment creation:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

