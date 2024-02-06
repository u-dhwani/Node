import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions = new Functions();


export interface Doctor {
  doctor_id?: bigint,
  first_name: string,
  last_name: string,
  speciality: string,
  gender: string,
  address: string,
  phone_number: string,
  email: string,
  fees: number,
  password: string
}

class DoctorModel extends Appdb {

  constructor() {
    super();
    this.table = 'doctor';
    this.uniqueField = 'doctor_id';
    this.findUserByEmail = 'email';
  }

  async allPatientOfParticularDoctor(doctor_id: number): Promise<any> {
    let start = (this.page - 1) * this.rpp;

    const selectFields = "p.first_name, p.last_name, p.date_of_birth, p.gender, p.phone_number, p.email, MAX(a.appointment_date) AS latest_appointment_date, MAX(a.appointment_time) AS latest_appointment_time ";
    const fromTable = "patient p JOIN appointment a ON p.patient_id = a.patient_id";
    const whereCondition = "a.appointment_status = 'Completed' AND doctor_id =" + doctor_id + " GROUP BY p.patient_id";
    const limitValue = this.rpp;
    const offsetValue = start;
    const result = await this.selectdynamicQuery(selectFields, fromTable, whereCondition, limitValue, offsetValue)
    return result;


  }

  async incomeOfThatDay(app_date: string, doctor_id: number): Promise<any> {
    const selectFields = "hospital_id, SUM(appointment_fee) AS total_income";
    const whereCondition = "doctor_id = " + doctor_id + " AND appointment_date = '" + app_date + "' GROUP BY hospital_id";
    const result = await this.select('appointment', selectFields, whereCondition, '', '');
    return result;
  }

}

export default new DoctorModel();
