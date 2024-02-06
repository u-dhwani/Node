import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions=new Functions();
export interface Appointment {
    appointment_id?: number;
    patient_id?: number;
    doctor_id: number;
    hospital_id: number;
    appointment_date: string; 
    Disease?: string;
    appointment_time: string; 
    appointment_fee?: number;
    appointment_status: string;
}

class AppointmentModel extends Appdb {
  
  constructor() {
    super();
    this.table = 'appointment';
    this.uniqueField = 'appointment_id';
    
  }
}

export default new AppointmentModel();
