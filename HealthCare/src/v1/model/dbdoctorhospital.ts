import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions=new Functions();

export interface DoctorHospital {
    appointment_id?: number;
    doctor_id: number;
    hospital_id: number;
}

class DoctorHospitalModel extends Appdb {
  
  constructor() {
    super();
    this.table = 'doctorhospital';
    this.uniqueField = 'doctorhospital_id';
    
  }

  

}

export default new DoctorHospitalModel();
