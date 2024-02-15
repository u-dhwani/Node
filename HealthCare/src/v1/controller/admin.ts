/*200 for success, 404 for not found, 400 for bad request, */
import express, { Request, Response } from "express";
import * as Joi from 'joi';
import { Functions } from '../library/functions';
import { validations } from '../library/validations';
import { signUp, validatesignUpAdmin } from '../middleware/UserAuthHandler';
import { checkAccess, checkAuth, getPageNumber } from '../middleware/checkAuth';
import { Appdb } from '../model/appdb';
import AdminModel, { Admin } from '../model/dbadmin';
import { start } from "repl";

const functions = new Functions();
const appdb = new Appdb();

const adminRouter = express.Router();

adminRouter.post('/signup', validatesignUpAdmin, signup);
adminRouter.get('/disease', checkAuth, checkAccess('admin'), validatecountOfDisease, countOfDisease);
adminRouter.get('/topFiveDoctors', checkAuth, checkAccess('admin'), topFiveDoctorsAsPerAppointmentFees);
adminRouter.get('/maxClaim', checkAuth, checkAccess('admin'), topTenPatientsMaxClaim);
export default adminRouter;


// ---------------------------VALIDATIONS---------------------------------------

function validatecountOfDisease(req: any, res: any, next: any) {

  const schema = Joi.object({
    disease_name: Joi.string().trim().min(1).required(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().required()

  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}

// ----------------------------------------------------------------------------------------


async function signup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const user: Admin[]  = await AdminModel.getUserByCriteria({ email: req.body.email }, '', getPageNumber(req));

    if (user.length===0) {
      const role: string = 'admin';
      return signUp(req, res, role);
    }
    else {
      return res.send(functions.output(200, 'User Found', null));
    }
  }
  catch (error) {
    console.error('Error in signup:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

async function topFiveDoctorsAsPerAppointmentFees(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const topFiveDoctorResult = await AdminModel.topFiveDoctorsAsPerAppointmentFees();
    if (topFiveDoctorResult.length === 0) {
      return res.send(functions.output(404, 'Top 5 doctors Not Found', null));
    }
    return res.send(functions.output(200, 'Top 5 doctors as per income', topFiveDoctorResult));
  }
  catch (error) {
    console.error('Error in signup:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));
  }
}

async function topTenPatientsMaxClaim(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  const maxClaim = await AdminModel.topTenPatientsMaxClaim();
  if (maxClaim.length === 0) {
    return res.send(functions.output(404, 'Top 10 Patients Not Found', null));
  }
  return res.send(functions.output(200, 'Top 10 Patients having maximum claim', maxClaim));

}


async function countOfDisease(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {

    const { disease_name,start_date,end_date } = req.body;
    const lowercasedDiseaseName = disease_name.toLowerCase();

    const formattedstartDate = new Date(start_date).toISOString().split('T')[0];
    const formattedendDate=new Date(end_date).toISOString().split('T')[0];


    const diseaseDetails = await AdminModel.countOfThatDisease(lowercasedDiseaseName,formattedstartDate,formattedendDate);
    if (!diseaseDetails) {
      return res.send(functions.output(404, 'Disease not found', null));
    }
    return res.send(functions.output(200, 'Doctor details retrieved successfully', diseaseDetails));

  }
  catch (error) {
    return res.send(functions.output(500, 'Internal Server Error', null));
  }

}
