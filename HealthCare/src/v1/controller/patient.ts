import express, { Request, Response } from "express";
import * as Joi from 'joi';
import { Functions } from '../library/functions';
import { validations } from '../library/validations';
import { login, loginSchema, signUp, validatesignUpPatient } from '../middleware/UserAuthHandler';
import { checkAccess, checkAuth } from '../middleware/checkAuth';
import { Appdb } from '../model/appdb';
import AppointmentModel, { Appointment } from '../model/dbappointment';
import DoctorAvailabilityModel, { DoctorAvailability } from "../model/dbdoctoravailability";
import DoctorModel from '../model/dbdoctor';
import HospitalModel from '../model/dbhospital';
import PatientModel, { Patient } from '../model/dbpatient';
import PatientInsuranceModel, { PatientInsurance } from "../model/dbpatientinsurance";
import { add, nextFriday } from "date-fns";
const functions = new Functions();
const appdb = new Appdb();

const patientRouter = express.Router();

patientRouter.post('/signup', validatesignUpPatient, signup);
patientRouter.post('/signin', loginSchema, login);
patientRouter.post('/appointment', checkAuth, checkAccess('patient'), validateAppointment, appointment);
patientRouter.get('/hospitals', checkAuth, checkAccess('patient'), validateGetAllHospital, getAllHospital);
patientRouter.get('/hospital/:id', checkAuth, checkAccess('patient'), getAllDoctorOfParticularHospital);
patientRouter.post('/addInsurance', checkAuth, checkAccess('patient'), validateaddInsurance, addInsurance);
patientRouter.get('/hospital/doctor/availableTime', checkAuth, checkAccess('patient'), availableTimeOfDoctor);

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
    const newInsurance: PatientInsurance = {
      patient_id,
      insurance_plan_id,
      policy_number,
      policy_buy_date: formattedDate,
      subscriber_first_name,
      subscriber_last_name,
      subscriber_date_of_birth: subscriber_dob,
      subscriber_phone_number
    }

    const addInsuranceDetails = await PatientInsuranceModel.createRecord(newInsurance);
    if (!addInsuranceDetails) {
      return res.send(functions.output(500, 'Failed to add insurance details', null));
    }
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

    if (!hospitalDetails) {
      return res.send(functions.output(500, 'Error in fetching hospital details', null));
    }
    return res.send(functions.output(200, 'Hospital details retrieved successfully', hospitalDetails));

  } catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

async function getAllDoctorOfParticularHospital(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {

    // const { hospital_id } = { hospital_id: parseInt(req.params.id, 10) };
    const schema = Joi.object({
      hospital_id: Joi.number().integer().positive().required()
    });

    // Validate the hospital_id from req.params
    const { error, value } = schema.validate({ hospital_id: parseInt(req.params.id, 10) });

    if (error) {
      // If validation fails, send a 400 Bad Request response with the error message
      return res.status(400).json({ error: error.details[0].message });
    }

    // Extract the validated hospital_id
    const validatedHospitalId = value.hospital_id;
    const doctorDetails = await PatientModel.getAllDoctorOfParticularHospital(validatedHospitalId);
    if (!doctorDetails) {
      return res.send(functions.output(500, 'Error in fetching doctor of particular hospital', null));
    }

    return res.send(functions.output(200, 'Doctor details retrieved successfully', doctorDetails));


  } catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

async function availableTimeOfDoctor(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  const { doctor_id, hospital_id } = req.body;
  const doctorTimeDetails = await DoctorAvailabilityModel.getUserByCriteria({ doctor_id: doctor_id, hospital_id: hospital_id }, '');

  if (!doctorTimeDetails) {
    return res.send(functions.output(500, 'No doctor found working in this hospital', null));
  }

  // Initialize an object to store available time slots grouped by day
  const availableSlotsByDay: Record<string, string[]> = {};

  // Get the current date and day of the week
  const today = new Date();
  const currentDay = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

  // Loop through each availability record
  for (const record of doctorTimeDetails) {
    const start_time = record.start_time;
    const end_time = record.end_time;
    const duration = record.duration;
    const bookedSlots = record.booked_slots || [];
    const day = record.days;
    

    console.log(day);

    // Get the index of the current day in the week
    let value = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
    if (value < currentDay)
      value = 7 - currentDay + value + 1;

    else
      value = value - currentDay + 1;
    let dayIndex = (currentDay + value);

    console.log("value:" + value + " " + day);
    if (dayIndex < 0) dayIndex += 7; // Ensure the result is non-negative

    // Calculate the date for the current day
    const date = new Date(today);
    // date.setDate(today.getDate() + (dayIndex - currentDay + 7) % 7); // Adjust the date based on the day index
    date.setDate(today.getDate() + value);


    console.log("date:" + today.getDate() + value);
    // Initialize array for day if not already present
    if (!availableSlotsByDay[day]) {
      availableSlotsByDay[day] = [];
    }

    // Convert start_time and end_time to Date objects
    const startDate = new Date(date.toISOString().split('T')[0]); // Use the calculated date
    startDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 to represent the date only

    console.log("startdate" + startDate);
    const startDateTime = new Date(`${startDate.toISOString().split('T')[0]}T${start_time}`);
    const endDateTime = new Date(`${startDate.toISOString().split('T')[0]}T${end_time}`);

    // Calculate duration in milliseconds
    const durationInMilliseconds = duration * 60000;

    // Loop through time slots for each day
    while (startDateTime <= endDateTime) {
      const formattedDateTime = startDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour12: false, hour: '2-digit', minute: '2-digit' });

      console.log("formatted" + formattedDateTime);
      // Check if the slot is not booked
      if (!bookedSlots.includes(formattedDateTime)) {
        availableSlotsByDay[day].push(formattedDateTime);
      }

      // Increment startDateTime by duration
      startDateTime.setTime(startDateTime.getTime() + durationInMilliseconds);
    }
  }
  return res.send(functions.output(200, 'Time Slots Available for the Appointment', availableSlotsByDay));
}



async function appointment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {

    const { doctor_id, hospital_id, appointment_date, appointment_time, appointment_status } = req.body;
    const patient_id = (req as any).user.user_id;

    const doctor = await DoctorModel.getUserByCriteria({ doctor_id: doctor_id }, '');
    const hospital = await HospitalModel.getUserByCriteria({ hospital_id: hospital_id }, '');
    const patient = await PatientModel.getUserByCriteria({ patient_id: patient_id }, '');


    if (!patient || !doctor || !hospital) {
      return res.send(functions.output(404, 'Patient, doctor, or hospital not found', null));
    }

    // Create the appointment

    const appointmentDate = new Date(appointment_date);
    const formattedDate = appointmentDate.toISOString().split('T')[0];

    const dayIndex = appointmentDate.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = dayNames[dayIndex];

    const appointment: Appointment = await AppointmentModel.createRecord({
      patient_id,
      doctor_id,
      hospital_id,
      appointment_date: formattedDate,
      appointment_time,
      appointment_status
    });

    console.log(appointment_time);

    const addInBookedSlots = await PatientModel.addBookedSlot(doctor_id, hospital_id, appointment_time,day);
    if (!addInBookedSlots) {
      return res.send(functions.output(500, 'Error in adding slot', null));
    }

    return res.send(functions.output(200, 'Appointment created successfully', { appointment }));
  } catch (error) {
    console.error('Error in appointment creation:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

