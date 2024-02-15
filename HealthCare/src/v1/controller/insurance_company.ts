/*200 for success, 404 for not found, 400 for bad request, */
import express, { Request, Response } from "express";
import * as Joi from 'joi';
import { Functions } from '../library/functions';
import { validations } from '../library/validations';
import { signUp, validatesignUpInsuranceCompany } from '../middleware/UserAuthHandler';
import { checkAccess, checkAuth, getPageNumber } from '../middleware/checkAuth';
import { Appdb } from '../model/appdb';
import ClaimModel from '../model/dbclaim';
import HospitalModel from "../model/dbhospital";
import HospitalInsuranceModel from "../model/dbhospitalinsurance";
import InsuranceCompanyModel, { InsuranceCompany } from '../model/dbinsurancecompany';
import InsurancePlanModel, { InsurancePlan } from "../model/dbinsuranceplan";

const functions = new Functions();
const appdb = new Appdb();

const insuranceCompanyRouter = express.Router();

insuranceCompanyRouter.post('/signup', validatesignUpInsuranceCompany, signup);
insuranceCompanyRouter.post('/addPlan', checkAuth, checkAccess('Insurance Company'), validateaddInsurancePlan, addInsurancePlan);
insuranceCompanyRouter.post('/addHospital', checkAuth, checkAccess('Insurance Company'), validateaddHospitals, addHospitals);
insuranceCompanyRouter.post('/approveClaim', checkAuth, checkAccess('Insurance Company'), validateapproveClaim, approveClaim);

export default insuranceCompanyRouter;


// ---------------------------VALIDATIONS---------------------------------------
function validateaddHospitals(req: any, res: any, next: any) {

  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}

function validateaddInsurancePlan(req: any, res: any, next: any) {

  const schema = Joi.object({
    insurance_plan_name: Joi.string().required(),
    amount: Joi.number().positive().required(),
    duration: Joi.number().positive().required()
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}

function validateapproveClaim(req: any, res: any, next: any) {

  const schema = Joi.object({
    claim_id: Joi.number().integer().positive().required(),
    total_amount: Joi.number().precision(2).positive().required(),
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}


// ---------------------------------------------------------------------------

async function signup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const user: InsuranceCompany[] = await InsuranceCompanyModel.getUserByCriteria({ email: req.body.email }, '', getPageNumber(req));

    if (user.length === 0) {
      const role: string = 'Insurance Company';
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

async function addInsurancePlan(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const { insurance_plan_name, amount, duration } = req.body;
    const insurance_company_id = (req as any).user.user_id;
    const newUser: InsurancePlan = {
      insurance_company_id,
      insurance_plan_name,
      amount,
      duration
    }
    const addInsurance = await InsurancePlanModel.insertRecord(newUser);
    if (!addInsurance) {
      return res.send(functions.output(500, 'Error in adding insurance plan', null));
    }
    return res.send(functions.output(200, 'Appointment created successfully', { addInsurance }));

  }
  catch (error) {
    console.error('Error in Adding Insurance Plan :', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}


async function addHospitals(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {

  try {
    const { email } = req.body;

    const insurance_company_id = (req as any).user.user_id;
    const getHospital = await HospitalModel.getUserByCriteria({ email: email }, '', getPageNumber(req));
    if (getHospital.length === 0) {
      return res.send(functions.output(500, 'Error in getting Hospital', null));
    }
    const hospital_id: bigint | undefined = getHospital[0]?.hospital_id;

    const alreadyAdded = await HospitalInsuranceModel.getUserByCriteria({ hospital_id: hospital_id, insurance_company_id: insurance_company_id }, '', getPageNumber(req));

    if (alreadyAdded.length > 0) {
      return res.send(functions.output(500, 'Hospital is already added', alreadyAdded));
    }

    if (typeof hospital_id === 'number') {
      console.log(hospital_id, insurance_company_id);
      const addHospital = await HospitalInsuranceModel.insertRecord({
        hospital_id,
        insurance_company_id
      });

      if (!addHospital) {
        return res.send(functions.output(404, 'Error while inserting in Hospital', null));

      }
      return res.send(functions.output(200, 'Hospital Added', null));
    }
  }
  catch (error) {
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}



async function approveClaim(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {

  const { claim_id, total_amount } = req.body;
  const approveClaim = await ClaimModel.updateRecord(claim_id, { claim_status: "Approved", total_amount: total_amount });
  if (!approveClaim) {
    return res.send(functions.output(500, 'Error in approving Claim', null));
  }
  return res.send(functions.output(200, 'Claim Approved', approveClaim));


}