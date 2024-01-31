import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions=new Functions();


export interface Admin {
     admin_id ?:bigint,
     first_name:string,
     last_name:string,
     password:string,
     email:string,
     phone_number:string
    
}

class AdminModel extends Appdb {
  
  constructor() {
    super();
    this.table = 'admin';
    this.uniqueField = 'admin_id';
    this.findUserByEmail='email';
  }

  }

export default new AdminModel();
