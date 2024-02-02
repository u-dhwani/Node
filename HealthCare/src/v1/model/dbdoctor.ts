import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';
import { connection } from '../library/connection';

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
  private connectionObj: connection;
 
  constructor() {
    super();
    this.connectionObj = new connection();
    this.connectionObj.connect();
   
    this.table = 'doctor';
    this.uniqueField = 'doctor_id';
    this.findUserByEmail='email';
  }

  async allPatientOfParticularDoctor(doctor_id:number): Promise<any> {
      try {
        const client = await this.connectionObj.getConnection();
        let start = (this.page - 1) * this.rpp;
        const result = await client.query("SELECT p.first_name, p.last_name, p.date_of_birth, p.gender, p.phone_number, p.email, MAX(a.appointment_date) AS latest_appointment_date, MAX(a.appointment_time) AS latest_appointment_time FROM patient p JOIN appointment a ON p.patient_id = a.patient_id WHERE a.appointment_status = 'Completed' AND doctor_id = $1 GROUP BY p.patient_id LIMIT $2 OFFSET $3", [doctor_id,this.rpp,start]);
        return result.rows;
      } catch (error) {
        throw error;
      }
  }

  async incomeOfThatDay(criteria: Record<string, any>,orderBy:string): Promise<any> {
		try {
			this.orderby=orderBy;
			const result = await this.selectRecord(criteria);
			return result || null;
	
		} catch (error: any) {
			return { status: 500, message: error.message, data: null };
		}
	}

}

export default new DoctorModel();
