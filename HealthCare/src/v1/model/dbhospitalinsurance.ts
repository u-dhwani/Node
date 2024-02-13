import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions=new Functions();


export interface HospitalInsurance {
   
     hospital_insurance_id ?:bigint,
     hospital_id:number,
     insurance_company_id:number
    
}

class HospitalInsuranceModel extends Appdb {
  
  constructor() {
    super();
    this.table = 'hospital_insurance';
    this.uniqueField = 'hospital_insurance_id';
    
  }

  }

export default new HospitalInsuranceModel();
