import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions = new Functions();

export interface Admin {
  admin_id?: bigint,
  first_name: string,
  last_name: string,
  password: string,
  email: string,
  phone_number: string

}

class AdminModel extends Appdb {

  constructor() {
    super();
    this.table = 'admin';
    this.uniqueField = 'admin_id';
    this.findUserByEmail = 'email';
  }

  /**
  * Retrieves the count of patients related to a specific disease.
  * @param disease_name The name of the disease to count  for.
  * @returns The count of specified disease.
  */

  async countOfThatDisease(disease_name: string): Promise<any> {

    const whereCondition = "LOWER(disease) LIKE '%" + disease_name + "%'";
    const result = await this.selectCount('appointment', '*', whereCondition);
    return result;

  }


  /**
   * Retrieves the top five doctors based on total appointment fees earned.
   * @returns The top five doctors with the highest total appointment fees.
   */

  async topFiveDoctorsAsPerAppointmentFees(): Promise<any> {

    const selectFields = "d.doctor_id, d.first_name, d.last_name, d.speciality, d.gender, d.address, d.phone_number, d.email, d.fees, SUM(a.appointment_fee) AS total_appointment_fees";
    const fromTable = "doctor d JOIN appointment a ON d.doctor_id = a.doctor_id GROUP BY d.doctor_id ";
    const order = "ORDER BY total_appointment_fees DESC";
    const limit = "LIMIT 5";
    const result = this.select(fromTable, selectFields, '', order, limit);
    return result;
  }


  /**
  * Retrieves the top ten patients based on the maximum claimed billing amount.
  * @returns The top ten patients with the highest maximum claimed billing amount.
  */
  async topTenPatientsMaxClaim(): Promise<any> {
    const selectFields = "pb.patient_id, SUM(pb.billing_total_amount) AS total_billing_amount";
    const fromTable = "patient_billing pb GROUP BY pb.patient_id";
    const order = "ORDER BY total_billing_amount DESC";
    const limit = "LIMIT 10";
    const result = this.select(fromTable, selectFields, '', order, limit);
    return result;
  }


}


export default new AdminModel();
