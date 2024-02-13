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
patientRouter.get('/hospitals', checkAuth, checkAccess('patient'), validateGetAllHospital, getAllHospital);
patientRouter.get('/hospital/:id', checkAuth, checkAccess('patient'), validategetAllDoctorOfParticularHospital, getAllDoctorOfParticularHospital);
patientRouter.post('/addInsurance', checkAuth, checkAccess('patient'), validateaddInsurance, addInsurance);
patientRouter.get('/hospital/doctor/availableTime', checkAuth, checkAccess('patient'), validateavailableTimeOfDoctor, availableTimeOfDoctor);

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


function validateavailableTimeOfDoctor(req: any, res: any, next: any) {

  const schema = Joi.object({
    doctor_id: Joi.number().integer().positive().required(),
    hospital_id: Joi.number().integer().positive().required(),

  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}




function validategetAllDoctorOfParticularHospital(req: any, res: any, next: any) {
  const schema = Joi.object({
    hospital_id: Joi.number().integer().positive().required()
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req.params, res, next, schema)) {
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
    subscriber_phone_number: Joi.string().trim().pattern(/^\d{10}$/).required()
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

    // Convert strings to Date objects
    const formattedPolicyBuyDate = new Date(policy_buy_date);
    const formattedSubscriberDOB = new Date(subscriber_date_of_birth);

    const formattedDate = formattedPolicyBuyDate.toISOString().split('T')[0];
    console.log("format:" + formattedDate);
    const subscriber_dob = formattedSubscriberDOB.toISOString().split('T')[0];


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

    const addInsuranceDetails = await PatientInsuranceModel.insertRecord(newInsurance);
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

    const hospitalDetails = await HospitalModel.getUserByCriteria({ city: city, state: state }, 'hospital_name');

    if (hospitalDetails.length === 0) {
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

    const { hospital_id } = { hospital_id: parseInt(req.params.id, 10) };


    // Extract the validated hospital_id
    //const hospitalId = req.values.hospital_id;
    //const validatedHospitalId = value.hospital_id;
    const doctorDetails = await PatientModel.getAllDoctorOfParticularHospital(hospital_id);
    if (doctorDetails.length === 0) {
      return res.send(functions.output(404, 'Error in fetching doctor of particular hospital', null));
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

  if (doctorTimeDetails.length === 0) {
    return res.send(functions.output(500, 'No doctor found working in this hospital', null));
  }

  // Initialize an object to store available time slots grouped by day
  const availableSlotsByDay: Record<string, string[]> = {};

  // Get the current date and day of the week
  const today = new Date();
  const currentDay = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  console.log("Today:" + today);


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

    console.log("value:" + value + " " + day);

    // Calculate the date for the current day
    const date = new Date(today);
    date.setDate(today.getDate() + value);

    //  console.log("date:" + today.getDate() + value);

    // Initialize array for day if not already present
    if (!availableSlotsByDay[day]) {
      availableSlotsByDay[day] = [];
    }

    // Convert start_time and end_time to Date objects
    const startDate = new Date(date.toISOString().split('T')[0]); // Use the calculated date
    startDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 to represent the date only

    //   console.log("startdate" + startDate);
    const startDateTime = new Date(`${startDate.toISOString().split('T')[0]}T${start_time}`);
    const endDateTime = new Date(`${startDate.toISOString().split('T')[0]}T${end_time}`);

    // Calculate duration in milliseconds
    const durationInMilliseconds = duration * 60000;

    const currentTime = new Date();

    // Loop through time slots for each day
    while (startDateTime <= endDateTime) {

      const formattedDateTime = startDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour12: false, hour: '2-digit', minute: '2-digit' });

      // console.log("formatted" + formattedDateTime);
      // Check if the slot is not booked
      if (!bookedSlots.includes(formattedDateTime)) {

        console.log(currentTime + " " + startDateTime);
        if (value == 1 && currentTime < startDateTime) {
          availableSlotsByDay[day].push(formattedDateTime);
        }
        else if (value != 1) {
          availableSlotsByDay[day].push(formattedDateTime);
        }
      }

      // Increment startDateTime by duration
      startDateTime.setTime(startDateTime.getTime() + durationInMilliseconds);
    }
  }
  return res.send(functions.output(200, 'Time Slots Available for the Appointment', availableSlotsByDay));
}



