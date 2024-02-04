import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions=new Functions();


export interface InsuranceCompany {
    insurance_company_id ?:bigint,
    company_name:string,
    address:string,
    phone_number:string,
    email:string,
    password:string    
}

class InsuranceCompanyModel extends Appdb {
  
  constructor() {
    super();
    this.table = 'insurance_company';
    this.uniqueField = 'insurance_company_id';
    this.findUserByEmail='email';
  }

  }

export default new InsuranceCompanyModel();
