import { Request, Response } from 'express';
import express from "express";
import HospitalModel,{Hospital}  from '../model/dbhospital';
import DoctorModel,{Doctor} from '../model/dbdoctor';
import {Appdb }from '../model/appdb';
import { Functions } from '../library/functions';
import DoctorHospitalModel,{DoctorHospital}from '../model/dbdoctorhospital';
import PatientModel,{ Patient } from '../model/dbpatient';
import * as bcrypt from 'bcrypt';
import * as Joi from 'joi';
import  {validations}  from '../library/validations';
import { signUp,validatesignUpHospital,loginSchema,login } from '../middleware/UserAuthHandler';
import PatientAdmitModel,{ PatientAdmit } from '../model/dbpatientadmit';
import PatientProductModel,{ PatientProduct } from '../model/dbpatientproduct';
import ProductModel,{ Products } from '../model/dbproducts';
import { checkAccess, checkAuth} from '../middleware/checkAuth';


const functions=new Functions();
const appdb=new Appdb();

const hospitalRouter = express.Router();

hospitalRouter.post('/signup', validatesignUpHospital,signup);
hospitalRouter.post('/signin',loginSchema,login);
hospitalRouter.post('/addDoctor',checkAuth,checkAccess('hospital'),validateaddDoctor,addDoctor);
hospitalRouter.post('/admit',checkAuth,checkAccess('hospital'),validatepatientAdmit,patientAdmit);
hospitalRouter.get('/listadmitpatients',checkAuth,checkAccess('hospital'),listPatientsAdmitted);
hospitalRouter.post('/patient/product',checkAuth,checkAccess('hospital'),validateaddProductsUsedByPatient,addProductsUsedByPatient);


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
    const user: Hospital[] | null = await HospitalModel.getUserByCriteria({email:req.body.email},'');
        
    if (!user) {
      const role: string = 'hospital';
      return signUp(req, res, role); 
    }
    else{  
        return res.status(404).json({ error: true, message: 'User Found', data: null });
    }
  }
  catch (error) {
    console.error('Error in signup:', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
  }
}


async function patientAdmit(req:Request,res:Response):Promise<Response<any, Record<string, any>> | any> {

    const {patient_email,doctor_id}=req.body;
    const hospital_id=(req as any).user.user_id;
    const patientExist=await PatientModel.getUserByCriteria({email:patient_email},'');
    if(!patientExist){
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
      const newUser:PatientAdmit={
        patient_id,
        doctor_id,
        hospital_id,
        admit_date:formattedDate,
        admit_time:formattedTime

      }
      const patientAdmitRecord=await PatientAdmitModel.createRecord(newUser);
      if(!patientAdmitRecord){
        return res.status(404).json({ error: true, message: 'Error while inserting in Patient Admit', data: null });
   
      }
      return res.status(200).json({ error: false, message: 'Patient Admitted', data: null });
   
    }   

}

async function listPatientsAdmitted(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {

    const hospital_id=(req as any).user.user_id;
    
    const patientAdmitDetails = await PatientAdmitModel.getUsers(hospital_id,'hospital_id');
    
    return res.json({ error: false, message: 'Patients admitted retrieved successfully', data: patientAdmitDetails });
  } catch (error) {
    console.error('Error in retrieving doctor details:', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
  }
}

async function addProductsUsedByPatient(req:Request,res:Response):Promise<Response<any, Record<string, any>> | any> {
    const {email,product_id,quantity} = req.body;
    const patientDetails=await PatientModel.getUserByCriteria({email:email},'');

    if (!patientDetails ) {
      return res.status(404).json({ error: true, message: 'Patient Not Found', data: null });
    }

    const patient_id: bigint | undefined = patientDetails[0]?.patient_id;
    
    if (typeof patient_id === 'number') {
      const admit_id=await PatientAdmitModel.latestAdmitId(patient_id);
      const patient_admit_id = admit_id.length > 0 ? admit_id[0].patient_admit_id : undefined;

      const newEntry:PatientProduct={
        patient_admit_id,
        product_id,
        quantity
      }
       
      const checkQuantity=await ProductModel.checkandUpdateQuantity(product_id,quantity);
      if(checkQuantity===0){
        return res.status(404).json({ error: true, message: 'Product Quantity is more than the available quantity', data: null });
   
      }
      const addProduct=await PatientProductModel.createRecord(newEntry);
      const updateBillingAmount=await PatientAdmitModel.updateBillingAmount(patient_admit_id);
      return res.status(404).json({ error: false, message: 'Amount has been updated', data: updateBillingAmount });
    }
}



async function addDoctor(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const { email } = req.body;
    const hospital_id = (req as any).user.user_id;

    // Retrieve the doctor's user_id using the provided email
    const doctors : Doctor[] | null= await DoctorModel.getUserByCriteria({email:email},'');

    console.log(doctors);
    if (!doctors ) {
      return res.status(404).json({ error: true, message: 'Doctor not found', data: null });
  }

      const doctor_id: bigint | undefined = doctors[0]?.doctor_id;
    
        if (typeof doctor_id === 'number') {
            const newUser:DoctorHospital={
              doctor_id,
              hospital_id
            }

          const associationAlreadyPresent=await DoctorHospitalModel.getUserByCriteria({doctor_id:doctors[0].doctor_id,hospital_id:hospital_id},'');
          if(associationAlreadyPresent!==null && associationAlreadyPresent.length>0){
            //return res.json({ error: false, message: 'Doctor Hospital Association already present', data: { associationAlreadyPresent } });
           
            res.send(functions.output(1,'Doctor Hospital Association already present',associationAlreadyPresent));
            return false;
          }
          const doctorAssociation = await DoctorHospitalModel.createRecord(newUser);

      
          return res.json({ error: false, message: 'Doctor Association created successfully', data: { doctorAssociation } });

      } else {
        return res.json({ error: false, message: 'Doctor_id is undefined', data: null });
 
      }
    
     } catch (error) {
    console.error('Error in doctorHospital creation:', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
  }
}