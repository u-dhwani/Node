import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions=new Functions();


export interface Appointment {
    
}

class AppointmentModel extends Appdb {
  
  constructor() {
    super();
    this.table = 'appointment';
    this.uniqueField = 'appointment_id';
    
  }

}

export default new AppointmentModel();
