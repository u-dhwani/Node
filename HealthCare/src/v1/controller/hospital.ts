import { Request, Response } from 'express';
import express from "express";
import HospitalModel,{Hospital}  from '../model/dbhospital';
import DoctorModel,{Doctor} from '../model/dbdoctor';
import {Appdb }from '../model/appdb';
import { Functions } from '../library/functions';
import DoctorHospitalModel,{DoctorHospital}from '../model/dbdoctorhospital';
import * as bcrypt from 'bcrypt';
import { signUp,validatesignUpHospital,loginSchema,login } from '../middleware/UserAuthHandler';
import { checkAccess, checkAuth} from '../middleware/checkAuth';


const functions=new Functions();
const appdb=new Appdb();

const hospitalRouter = express.Router();

hospitalRouter.post('/signup', validatesignUpHospital,signup);
hospitalRouter.post('/signin',loginSchema,login);
hospitalRouter.post('/addDoctor',checkAuth,checkAccess('hospital'),addDoctor);

export default hospitalRouter;


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
            return res.json({ error: false, message: 'Doctor Hospital Association already present', data: { associationAlreadyPresent } });
    
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