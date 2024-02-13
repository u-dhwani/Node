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

  }


  /**
   * Retrieves all patients of a particular doctor.
   * @param doctor_id The ID of the doctor.
   * @returns A promise that resolves to the result of the query.
   */
  async allPatientOfParticularDoctor(doctor_id: number,page:number): Promise<any> {
    const selectFields = "p.first_name, p.last_name, p.date_of_birth, p.gender, p.phone_number, p.email, MAX(a.appointment_date) AS latest_appointment_date, MAX(a.appointment_time) AS latest_appointment_time ";
    this.table = "patient p JOIN appointment a ON p.patient_id = a.patient_id";
    this.where = "WHERE a.appointment_status = 'Completed' AND doctor_id =" + doctor_id + " GROUP BY p.patient_id";
    this.rpp = 1;
    this.page=page;
    const result = await this.listRecords(selectFields);
    return result;
  }




}

export default new DoctorModel();
