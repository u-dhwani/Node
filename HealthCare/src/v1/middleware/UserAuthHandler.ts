import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import * as Joi from 'joi';
import { Functions } from '../library/functions';
import { validations } from '../library/validations';
import AdminModel, { Admin } from '../model/dbadmin';
import DoctorModel, { Doctor } from '../model/dbdoctor';
import HospitalModel, { Hospital } from '../model/dbhospital';
import InsuranceCompanyModel, { InsuranceCompany } from '../model/dbinsurancecompany';
import PatientModel, { Patient } from '../model/dbpatient';
import { generateToken, getPageNumber } from './checkAuth';
const functions = new Functions();

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

    city: Joi.string().required(),
    state: Joi.string().required()
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

export function validatesignUpInsuranceCompany(req: any, res: any, next: any) {

  const schema = Joi.object({
    company_name: Joi.string().trim().required(),
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
    role: Joi.string().required()
  });

  let validationsObj = new validations();
  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return false;
  }
}

export async function signUp(req: Request, res: Response, role: string): Promise<Response<any, Record<string, any>> | any> {
  try {
    let userQuery;
    let newUser: Patient | Hospital | Doctor | Admin | InsuranceCompany;
    const commonFields = {
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
    };

    switch (role) {
      case 'patient':
        const dateOfBirth = new Date(req.body.date_of_birth);
        const formattedDate = dateOfBirth.toISOString().split('T')[0];

        newUser = {
          ...commonFields,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          date_of_birth: formattedDate,
          gender: req.body.gender,
          address: req.body.address,
          phone_number: req.body.phone_number,
        } as Patient;
        console.log(req.body.date_of_birth);
        userQuery = await PatientModel.insertRecord(newUser);
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
        userQuery = await HospitalModel.insertRecord(newUser);
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
        userQuery = await DoctorModel.insertRecord(newUser);
        break;

      case 'admin':
        newUser = {
          ...commonFields,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          phone_number: req.body.phone_number,
        } as Admin;
        userQuery = await AdminModel.insertRecord(newUser);
        break;

      case 'Insurance Company':
        newUser = {
          ...commonFields,
          company_name: req.body.company_name,
          address: req.body.address,
          phone_number: req.body.phone_number,
        } as InsuranceCompany;
        userQuery = await InsuranceCompanyModel.insertRecord(newUser);
        break;


      default:
        return res.send(functions.output(500, 'Invalid role specified', null));
    }

    const token = generateToken({ email: req.body.email, role, user_id: userQuery.data });
    return res.send(functions.output(200, 'SignUp Successfule', token));

  } catch (error) {
    console.error('Error in signup:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));

  }
}


export async function login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | any> {
  try {
    const { email, password, role } = req.body;

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

      case 'Insurance Company':
        userModel = InsuranceCompanyModel;
        findUserByTableID = 'insurance_company_id';
        break;

      default:
        return res.send(functions.output(500, 'Invalid role specified', null));

    }


    const user: any = await userModel.getUserByCriteria({ email: email }, '',getPageNumber(req));

    console.log('User:', user);

    if (!user || user.length === 0) {
      return res.send(functions.output(404, 'User Not Found', null));

    }

    const userData = user[0];

    // Check if userData has the 'password' property
    if (userData && 'password' in userData) {
      const isMatch = await bcrypt.compare(password, userData.password);

      if (isMatch) {
        // Rest of your code for successful login
        if (userData[findUserByTableID] !== undefined) {
          const token = generateToken({ email, role, user_id: userData[findUserByTableID] });
          return res.send(functions.output(200, 'Login Successful', token));

        } else {
          return res.send(functions.output(500, 'Login Unsuccessful', null));

        }
      } else {
        return res.send(functions.output(401, 'Password is incorrect', null));

      }
    } else {
      console.log('Unexpected user structure:', userData);
      return res.send(functions.output(500, 'Unexpected user structure', null));

    }

  } catch (error) {
    console.error('Error in login:', error);
    return res.send(functions.output(500, 'Internal Server Error', null));

  }
}


