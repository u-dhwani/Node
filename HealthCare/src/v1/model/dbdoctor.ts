import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions=new Functions();


export interface Doctor {
     doctor_id ?:bigint,
     first_name:string,
     last_name:string,
     speciality:string,
     gender:string,
     address:string,
     phone_number:string,
     email:string,
     fees:number,
     password:string    
}

class DoctorModel extends Appdb {
  
  constructor() {
    super();
    this.table = 'doctor';
    this.uniqueField = 'doctor_id';
    this.findUserByEmail='email';
  }

  }

export default new DoctorModel();
