import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions=new Functions();


export interface Hospital {
     hospital_id ?:bigint,
     hospital_name:string,
     address:string,
     city:string,
     state:string,
     password:string,
     email:string,
     phone_number:string
    
}

class HospitalModel extends Appdb {
  
  constructor() {
    super();
    this.table = 'hospital';
    this.uniqueField = 'hospital_id';
    this.findUserByEmail='email';
  }

  

  
  }

export default new HospitalModel();
