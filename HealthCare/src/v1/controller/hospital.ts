import express, { Request, Response } from "express";
import * as Joi from 'joi';
import { Functions } from '../library/functions';
import { validations } from '../library/validations';
import { login, loginSchema, signUp, validatesignUpHospital } from '../middleware/UserAuthHandler';
import { checkAccess, checkAuth } from '../middleware/checkAuth';
import { Appdb } from '../model/appdb';
import DoctorModel, { Doctor } from '../model/dbdoctor';
import DoctorHospitalModel, { DoctorHospital } from '../model/dbdoctorhospital';
import HospitalModel, { Hospital } from '../model/dbhospital';
import ClaimModel, { Claim } from '../model/dbclaim';
import PatientModel from '../model/dbpatient';
import PatientAdmitModel, { PatientAdmit } from '../model/dbpatientadmit';
import PatientProductModel, { PatientProduct } from '../model/dbpatientproduct';
import InsurancePlanModel, { InsurancePlan } from "../model/dbinsuranceplan";
import ProductModel from '../model/dbproducts';


const functions = new Functions();
const appdb = new Appdb();

const hospitalRouter = express.Router();

hospitalRouter.post('/signup', validatesignUpHospital, signup);
hospitalRouter.post('/signin', loginSchema, login);
hospitalRouter.post('/addDoctor', checkAuth, checkAccess('hospital'), validateaddDoctor, addDoctor);
hospitalRouter.post('/admit', checkAuth, checkAccess('hospital'), validatepatientAdmit, patientAdmit);
hospitalRouter.get('/listadmitpatients', checkAuth, checkAccess('hospital'), listPatientsAdmitted);
hospitalRouter.post('/patient/product', checkAuth, checkAccess('hospital'), validateaddProductsUsedByPatient, addProductsUsedByPatient);
hospitalRouter.post('/dischargePatient', checkAuth, checkAccess('hospital'), dischargePatient);

export default hospitalRouter;

// ---------------------------------------------VALIDATIONS--------------------------------------------

function validateaddDoctor(req: any, res: any, next: any) {

  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}

function validatepatientAdmit(req: any, res: any, next: any) {

  const schema = Joi.object({
    patient_email: Joi.string().email().required(),
    doctor_id: Joi.number().integer().required(),
    insurance_plan_id: Joi.number().integer().required()
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}

function validateaddProductsUsedByPatient(req: any, res: any, next: any) {

  const schema = Joi.object({
    email: Joi.string().email().required(),
    product_id: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).required(),
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}


// ----------------------------------------------------------------------------------------------------


async function signup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const user: Hospital[] | null = await HospitalModel.getUserByCriteria({ email: req.body.email }, '');

    if (!user) {
      const role: string = 'hospital';
      return signUp(req, res, role);
    }
    else {
      return res.status(404).json({ error: true, message: 'User Found', data: null });
    }
  }
  catch (error) {
    console.error('Error in signup:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}


async function patientAdmit(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {

  const { patient_email, doctor_id, insurance_plan_id } = req.body;

  const hospital_id = (req as any).user.user_id;
  const patientExist = await PatientModel.getUserByCriteria({ email: patient_email }, '');
  if (!patientExist) {
    return res.status(404).json({ error: true, message: 'Patient not found...Register the patient', data: null });
  }
  const patient_id: bigint | undefined = patientExist[0]?.patient_id;

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  const hours = today.getHours();
  const minutes = today.getMinutes();
  const seconds = today.getSeconds();

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;


  if (typeof patient_id === 'number') {
    const newUser: PatientAdmit = {
      patient_id,
      doctor_id,
      hospital_id,
      admit_date: formattedDate,
      admit_time: formattedTime

    }

    const patientAdmitRecord = await PatientAdmitModel.createRecord(newUser);

    if (!patientAdmitRecord) {
      return res.status(404).json({ error: true, message: 'Error while inserting in Patient Admit', data: null });

    }
    // return res.status(200).json({ error: false, message: 'Patient Admitted', data: null });
    else {

      const getInsuranceCompanyID = await InsurancePlanModel.getUserByCriteria({ insurance_plan_id: insurance_plan_id }, '');

      const insurance_company_id: bigint | undefined = getInsuranceCompanyID[0]?.insurance_company_id;

      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      if (typeof insurance_company_id === 'number') {

        const newClaim: Claim = {
          insurance_company_id,
          insurance_plan_id,
          patient_id,
          hospital_id,
          admit_id: patientAdmitRecord,
          claim_date: formattedDate,
          claim_amount: 0,
          claim_status: "Pending"
        }

        // const patientAdmitRecord = await PatientAdmitModel.createRecord(newUser);
        const claimRecord = await ClaimModel.createRecord(newClaim);

        if (!claimRecord) {
          return res.status(404).json({ error: true, message: 'Error while inserting in Claim', data: null });

        }

        return res.status(404).json({ error: false, message: 'Insertion in claim done', data: claimRecord });

      }
    }

  }
}

async function listPatientsAdmitted(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {

    const hospital_id = (req as any).user.user_id;

    const patientAdmitDetails = await PatientAdmitModel.getUsers(hospital_id, 'hospital_id');

    return res.json({ error: false, message: 'Patients admitted retrieved successfully', data: patientAdmitDetails });
  } catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

async function addProductsUsedByPatient(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  const { email, product_id, quantity } = req.body;
  const patientDetails = await PatientModel.getUserByCriteria({ email: email }, '');

  if (!patientDetails) {
    return res.status(404).json({ error: true, message: 'Patient Not Found', data: null });
  }

  const patient_id: bigint | undefined = patientDetails[0]?.patient_id;

  if (typeof patient_id === 'number') {
    const admit_id = await PatientAdmitModel.latestAdmitId(patient_id);
    const patient_admit_id = admit_id.length > 0 ? admit_id[0].patient_admit_id : undefined;

    const newEntry: PatientProduct = {
      patient_admit_id,
      product_id,
      quantity
    }

    const checkQuantity = await ProductModel.checkandUpdateQuantity(product_id, quantity);
    if (checkQuantity === 0) {
      return res.status(404).json({ error: true, message: 'Product Quantity is more than the available quantity', data: null });

    }
    const addProduct = await PatientProductModel.createRecord(newEntry);
    const updateBillingAmount = await PatientAdmitModel.updateBillingAmount(patient_admit_id);
    console.log(updateBillingAmount);
    return res.status(404).json({ error: false, message: 'Amount has been updated', data: updateBillingAmount });
  }
}

async function dischargePatient(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {

  const { patient_id } = req.body;

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  const hours = today.getHours();
  const minutes = today.getMinutes();
  const seconds = today.getSeconds();

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const patientAdmit = await PatientAdmitModel.getUserByCriteria({ patient_id: patient_id }, '');

  const patient_admit_id: bigint | undefined = patientAdmit[0]?.patient_admit_id;

  if (typeof patient_admit_id === 'number') {
    const dischargeDate = {
      discharge_date: formattedDate,
      discharge_time: formattedTime
    };

    const discharge_date = await PatientAdmitModel.recordUpdate(patient_admit_id, dischargeDate);

    const updateBillingAmount = await PatientAdmitModel.updateBillingAmount(patient_admit_id);

    const updateclaimAmount = await ClaimModel.updateAmountinClaim(patient_admit_id);

    

    return res.json({ error: false, message: 'Doctor Association created successfully', data: { updateclaimAmount } });


  }


}


async function addDoctor(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const { email } = req.body;
    const hospital_id = (req as any).user.user_id;

    // Retrieve the doctor's user_id using the provided email
    const doctors: Doctor[] | null = await DoctorModel.getUserByCriteria({ email: email }, '');

    console.log(doctors);
    if (!doctors) {
      return res.status(404).json({ error: true, message: 'Doctor not found', data: null });
    }

    const doctor_id: bigint | undefined = doctors[0]?.doctor_id;

    if (typeof doctor_id === 'number') {
      const newUser: DoctorHospital = {
        doctor_id,
        hospital_id
      }

      const associationAlreadyPresent = await DoctorHospitalModel.getUserByCriteria({ doctor_id: doctors[0].doctor_id, hospital_id: hospital_id }, '');
      if (associationAlreadyPresent !== null && associationAlreadyPresent.length > 0) {
        //return res.json({ error: false, message: 'Doctor Hospital Association already present', data: { associationAlreadyPresent } });

        res.send(functions.output(200, 'Doctor Hospital Association already present', associationAlreadyPresent));
        return false;
      }
      const doctorAssociation = await DoctorHospitalModel.createRecord(newUser);

      return res.json({ error: false, message: 'Doctor Association created successfully', data: { doctorAssociation } });

    } else {
      return res.json({ error: false, message: 'Doctor_id is undefined', data: null });

    }

  } catch (error) {
    console.error('Error in doctorHospital creation:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}