import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import PatientModel,{Patient} from '../model/dbpatient';
import DoctorModel,{Doctor} from '../model/dbdoctor';
import HospitalModel,{Hospital} from '../model/dbhospital';
import AdminModel,{Admin} from '../model/dbadmin';
import { Functions } from '../library/functions';
import * as Joi from 'joi';
import  {validations}  from '../library/validations';
import { generateToken,verifyToken } from './checkAuth';
const functions=new Functions();

export function validatesignUpAdmin(req: any, res: any, next: any) {
  
    const schema = Joi.object({
        first_name: Joi.string().trim().required(),
        last_name: Joi.string().trim().required(),
        phone_number: Joi.string().trim().required(),
        email: Joi.string().trim().email().required(),
        password: Joi.string().required()
    });
    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }   
}

export function validatesignUpDoctor(req: any, res: any, next: any) {
  
    const schema = Joi.object({
        first_name: Joi.string().trim().required(),
        last_name: Joi.string().trim().required(),
        speciality: Joi.string().trim().required(),
        gender: Joi.string().valid('Male', 'Female').required(),
        address: Joi.string().trim().required(),
        phone_number: Joi.string().trim().required(),
        email: Joi.string().trim().email().required(),
        fees: Joi.number().required(),
        password: Joi.string().required()
    });
    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }   
}

export function validatesignUpHospital(req: any, res: any, next: any) {
  
    const schema = Joi.object({
        hospital_name: Joi.string().trim().required(),
        address: Joi.string().trim().required(),
        phone_number: Joi.string().trim().required(),
        email: Joi.string().trim().email().required(),
        password: Joi.string().required(),
        city:Joi.string().required(),
        state:Joi.string().required()
    });
    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }   
}

export function validatesignUpPatient(req: any, res: any, next: any) {
  
    const schema = Joi.object({
        first_name: Joi.string().trim().required(),
        last_name: Joi.string().trim().required(),
        date_of_birth: Joi.date().required(),
        gender: Joi.string().valid('Male', 'Female').required(),
        address: Joi.string().trim().required(),
        phone_number: Joi.string().trim().required(),
        email: Joi.string().trim().email().required(),
        password: Joi.string().required()
    });
    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }   
}

export function loginSchema(req: any, res: any, next: any) {
  
    const schema = Joi.object({
        email: Joi.string().trim().email().required(),
        password: Joi.string().required(),
        role:Joi.string().required()
    });
  
    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }
  }

export async function signUp(req: Request, res: Response, role: string): Promise<Response<any, Record<string, any>> | any> {
  try {
    let userQuery;
    let newUser: Patient | Hospital | Doctor | Admin ;
    const commonFields = {
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
    };

    switch (role) {
      case 'patient':
        const dateOfBirth = new Date(req.body.date_of_birth);
        const formattedDate = dateOfBirth.toISOString().split('T')[0];
        
        newUser= {
          ...commonFields,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          date_of_birth: formattedDate,
          gender: req.body.gender,
          address: req.body.address,
          phone_number: req.body.phone_number,
        } as Patient;
        console.log(req.body.date_of_birth);
        userQuery = await PatientModel.createRecord(newUser);
        break;

      case 'hospital':
        newUser = {
          ...commonFields,
          hospital_name: req.body.hospital_name,
          address: req.body.address,
          phone_number: req.body.phone_number,
          city: req.body.city,
          state: req.body.state
        } as Hospital;
        userQuery = await HospitalModel.createRecord(newUser);
        break;

      case 'doctor':
        newUser = {
          ...commonFields,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          speciality: req.body.speciality,
          gender: req.body.gender,
          address: req.body.address,
          phone_number: req.body.phone_number,
          fees: req.body.fees,
        } as Doctor;
        userQuery = await DoctorModel.createRecord(newUser);
        break;

        case 'admin':
            newUser = {
              ...commonFields,
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              phone_number: req.body.phone_number,
            } as Admin;
            userQuery = await AdminModel.createRecord(newUser);
            break;

      default:
        return res.status(400).json({ error: true, message: 'Invalid role specified', data: null });
    }

    if (userQuery.status_code === '500') {
      return res.json(functions.output(500, userQuery.status_message, null));
    }

    const token = generateToken({ email: req.body.email, role, user_id: userQuery.data });
    return res.json({ error: false, message: 'Signup successful', data: { token } });
  } catch (error) {
    console.error('Error in signup:', error);
    return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
  }
}


export async function login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
    try {
      const { email, password,role} = req.body;
  
      let userModel: any;
      let findUserByTableID: string;
  
      // Determine the user model and property based on the specified role
      switch (role) {
        case 'patient':
          userModel = PatientModel;
          findUserByTableID = 'patient_id';
          break;

          case 'admin':
            userModel = AdminModel;
            findUserByTableID = 'admin_id';
            break;
  
        case 'doctor':
          userModel = DoctorModel;
          findUserByTableID = 'doctor_id';
          break;
  
        case 'hospital':
          userModel = HospitalModel;
          findUserByTableID = 'hospital_id';
          break;
  
        default:
          return res.status(400).json({ error: true, message: 'Invalid role specified', data: null });
      }
  
    
      const user: any = await userModel.getUserByCriteria({ email: email },'');

      console.log('User:', user);

      if (!user || user.length === 0) {
          return res.status(404).json({ error: true, message: 'User not found', data: null });
      }

      const userData = user[0];

      // Check if userData has the 'password' property
      if (userData && 'password' in userData) {
          const isMatch = await bcrypt.compare(password, userData.password);

          if (isMatch) {
              // Rest of your code for successful login
              if (userData[findUserByTableID] !== undefined) {
                  const token = generateToken({ email, role, user_id: userData[findUserByTableID] });
                  return res.json({ error: false, message: 'Login successful', data: { token } });
              } else {
                  return res.json({ error: true, message: 'Login Unsuccessful', data: null });
              }
          } else {
              return res.status(401).json({ error: true, message: 'Password is incorrect', data: null });
          }
      } else {
          console.log('Unexpected user structure:', userData);
          return res.status(500).json({ error: true, message: 'Unexpected user structure', data: null });
      }

    } catch (error) {
      console.error('Error in login:', error);
      return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
    }
  }


