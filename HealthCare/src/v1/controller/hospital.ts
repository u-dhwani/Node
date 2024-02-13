import express, { Request, Response } from "express";
import * as Joi from 'joi';
import { Functions } from '../library/functions';
import { validations } from '../library/validations';
import { signUp, validatesignUpHospital } from '../middleware/UserAuthHandler';
import { checkAccess, checkAuth, validatepage } from '../middleware/checkAuth';
import { Appdb } from '../model/appdb';
import ClaimModel, { Claim } from '../model/dbclaim';
import DoctorModel, { Doctor } from '../model/dbdoctor';
import DoctorHospitalModel, { DoctorHospital } from '../model/dbdoctorhospital';
import HospitalModel, { Hospital } from '../model/dbhospital';
import InsurancePlanModel from "../model/dbinsuranceplan";
import PatientModel from '../model/dbpatient';
import PatientAdmitModel, { PatientAdmit } from '../model/dbpatientadmit';
import PatientBillingModel, { PatientBilling } from "../model/dbpatientbilling";
import PatientProductModel, { PatientProduct } from '../model/dbpatientproduct';
import ProductModel from '../model/dbproducts';


const functions = new Functions();
const appdb = new Appdb();

const hospitalRouter = express.Router();

hospitalRouter.post('/signup', validatesignUpHospital, signup);
hospitalRouter.post('/addDoctor', checkAuth, checkAccess('hospital'), validateaddDoctor, addDoctor);
hospitalRouter.post('/admit', checkAuth, checkAccess('hospital'), validatepatientAdmit, patientAdmit);
hospitalRouter.get('/listadmitpatients', checkAuth, checkAccess('hospital'), validatepage, listPatientsAdmitted);
hospitalRouter.post('/patient/product', checkAuth, checkAccess('hospital'), validateaddProductsUsedByPatient, addProductsUsedByPatient);
hospitalRouter.post('/dischargePatient', checkAuth, checkAccess('hospital'), validatedischargePatient, dischargePatient);


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


function validatedischargePatient(req: any, res: any, next: any) {

  const schema = Joi.object({
    patient_id: Joi.number().integer().required(),

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
      return res.send(functions.output(404, 'User Found', null));
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

  if (patientExist.length === 0) {
    return res.send(functions.output(404, 'Patient not found...Register the patient', null));
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

    const patientAdmitRecord = await PatientAdmitModel.insertRecord(newUser);

    if (!patientAdmitRecord) {
      return res.send(functions.output(500, 'Error while inserting in Patient Admit', null));

    }

    else {

      const getInsuranceCompanyID = await InsurancePlanModel.getUserByCriteria({ insurance_plan_id: insurance_plan_id }, '');

      if (getInsuranceCompanyID.length === 0) {
        return res.send(functions.output(500, 'Error in finding Insurance Company', null));
      }
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

        // const patientAdmitRecord = await PatientAdmitModel.insertRecord(newUser);
        const claimRecord = await ClaimModel.insertRecord(newClaim);

        if (!claimRecord) {

          return res.send(functions.output(500, 'Error while inserting in Claim', null));

        }

        return res.send(functions.output(200, 'Insertion in claim done', claimRecord));

      }
    }

  }
}

async function listPatientsAdmitted(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {

    const hospital_id = (req as any).user.user_id;
    const page: number = Number(req.query.page) || 1;


    const patientAdmitDetails = await PatientAdmitModel.getUsers(hospital_id, 'hospital_id', page);
    if (patientAdmitDetails.length === 0) {
      return res.send(functions.output(404, 'Patient Not Found', null));
    }

    return res.send(functions.output(200, 'Patients admitted retrieved successfully', patientAdmitDetails));
  } catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

async function addProductsUsedByPatient(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {

  try {
    const { email, product_id, quantity } = req.body;
    const patientDetails = await PatientModel.getUserByCriteria({ email: email }, '');

    if (patientDetails.length === 0) {
      return res.send(functions.output(404, 'Patient Not Found', null));
    }

    const patient_id: bigint | undefined = patientDetails[0]?.patient_id;

    if (typeof patient_id === 'number') {
      const admit_id = await PatientAdmitModel.latestAdmitId(patient_id);

      if (admit_id.length === 0) {
        return res.send(functions.output(500, 'Admit_ID Not found', null));
      }
      const patient_admit_id = admit_id.length > 0 ? admit_id[0].patient_admit_id : undefined;

      const newEntry: PatientProduct = {
        patient_admit_id,
        product_id,
        quantity
      }

      const checkQuantity = await ProductModel.checkandUpdateQuantity(product_id, quantity);
      console.log("kem che", checkQuantity);

      if (!checkQuantity) {

        return res.send(functions.output(404, 'Product Quantity is more than the available quantity', null));

      }
      const addProduct = await PatientProductModel.insertRecord(newEntry);

      if (!addProduct) {
        return res.send(functions.output(500, 'Product not added in the list', null));
      }

      const calculateBillingAmount = await HospitalModel.calculateBillingAmount(patient_admit_id);

      if (calculateBillingAmount.length === 0) {
        return res.send(functions.output(500, 'Bill not found', null));
      }
      console.log("welcome:      ", calculateBillingAmount[0].billing_amount);

      const updateBillingAmount = await PatientAdmitModel.updateBillingAmount(patient_admit_id, calculateBillingAmount[0].billing_amount);

      if (!updateBillingAmount) {
        return res.send(functions.output(500, 'Billing Amount not updated', null));
      }

      return res.send(functions.output(200, 'Amount has been updated', updateBillingAmount));
    }
  }
  catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

async function dischargePatient(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {

  try {
    const { patient_id } = req.body;

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const seconds = today.getSeconds();

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const patientAdmit = await PatientAdmitModel.getUserByCriteria({ patient_id: patient_id }, '');
    if (patientAdmit.length === 0) {
      return res.send(functions.output(500, 'Patient not found in Admit', null));
    }

    const patient_admit_id: bigint | undefined = patientAdmit[0]?.patient_admit_id;

    if (typeof patient_admit_id === 'number') {
      const dischargeDate = {
        discharge_date: formattedDate,
        discharge_time: formattedTime
      };

      const discharge_date = await PatientAdmitModel.updateRecord(patient_admit_id, dischargeDate);

      if (!discharge_date) {
        return res.send(functions.output(500, 'Discharge Date Not Found', null));
      }

      const calculateBillingAmount = await HospitalModel.calculateBillingAmount(patient_admit_id);

      if (calculateBillingAmount.length === 0) {
        return res.send(functions.output(500, 'Bill not found', null));
      }

      console.log("bill:", calculateBillingAmount);

      const updateBillingAmount = await PatientAdmitModel.updateBillingAmount(patient_admit_id, calculateBillingAmount.billing_amount);

      if (!updateBillingAmount) {
        return res.send(functions.output(500, 'Billing Amount not found', null));
      }

      const getUpdatedBillingAmount = await PatientAdmitModel.getUserByCriteria({ patient_admit_id: patient_admit_id }, '');

      const updateclaimAmount = await ClaimModel.updateAmountinClaim(patient_admit_id, getUpdatedBillingAmount.billing_amount);

      if (!updateclaimAmount) {
        return res.send(functions.output(500, 'Claim amount not been updated from admit table', null));
      }

      const getClaimId = await ClaimModel.getUserByCriteria({ admit_id: patient_admit_id }, '');

      if (getClaimId.length === 0) {
        return res.send(functions.output(500, 'Claim not found', null));
      }

      const claim_id: bigint | undefined = getClaimId[0]?.claim_id;

      let claimAmount, payableAmount;
      if (getClaimId[0].total_amount > getClaimId[0].claim_amount) {
        claimAmount = getClaimId[0].claim_amount;
        payableAmount = getClaimId[0].claim_amount - claimAmount;
      }
      else {
        claimAmount = getClaimId[0].total_amount;
        payableAmount = 0.0;
      }


      if (typeof claim_id === 'number') {
        const createBill: PatientBilling = {
          patient_id,
          admit_id: patient_admit_id,
          claim_id,
          billing_date: formattedDate,
          billing_total_amount: getClaimId[0].claim_amount,
          claim_amount: claimAmount,
          payable_amount: payableAmount,
          payment_status: "Pending"


        }

        const billcreated = await PatientBillingModel.insertRecord(createBill);

        if (!billcreated) {
          return res.send(functions.output(500, 'Patient Bill Not Created', null));
        }

        console.log("bill:", billcreated);
        return res.send(functions.output(200, 'Bill Created ', billcreated));
        // const patientadmitdelete = PatientAdmitModel.deleteRow(patient_admit_id);

        // if (!patientadmitdelete) {
        //   return res.send(functions.output(500, 'Patient details from admit table not deleted', null));
        // }
        // return res.send(functions.output(200, 'Bill Created ', billcreated));


      }

    }

  }
  catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
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
      return res.send(functions.output(404, 'Doctor not found', null));

    }

    const doctor_id: bigint | undefined = doctors[0]?.doctor_id;

    if (typeof doctor_id === 'number') {
      const newUser: DoctorHospital = {
        doctor_id,
        hospital_id
      }

      const associationAlreadyPresent = await DoctorHospitalModel.getUserByCriteria({ doctor_id: doctors[0].doctor_id, hospital_id: hospital_id }, '');
      if (associationAlreadyPresent !== null && associationAlreadyPresent.length > 0) {

        res.send(functions.output(200, 'Doctor Hospital Association already present', associationAlreadyPresent));
        return false;
      }
      const doctorAssociation = await DoctorHospitalModel.insertRecord(newUser);
      if (!doctorAssociation) {
        return res.send(functions.output(500, 'Doctor - Hospital Association not created', null));
      }

      return res.send(functions.output(200, 'Doctor Association created successfully', doctorAssociation));
    } else {
      return res.send(functions.output(404, 'Doctor_id is undefined', null));

    }

  } catch (error) {
    console.error('Error in doctorHospital creation:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}