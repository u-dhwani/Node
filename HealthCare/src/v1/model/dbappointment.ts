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

  

   /**
   * Retrieves the income of a particular doctor for a given day.
   * @param app_date The date for which income is to be retrieved.
   * @param doctor_id The ID of the doctor.
   * @returns A promise that resolves to the result of the query.
   */
  async incomeOfThatDay(app_date: string, doctor_id: number): Promise<any> {
    const selectFields = "hospital_id, SUM(appointment_fee) AS total_income";
    this.where = "WHERE doctor_id = " + doctor_id + " AND appointment_date = '" + app_date + "' GROUP BY hospital_id";
    const result = await this.listRecords(selectFields);
    //const result = await this.select('appointment', selectFields, whereCondition, '', '');
    return result;
  }

}

export default new AppointmentModel();
