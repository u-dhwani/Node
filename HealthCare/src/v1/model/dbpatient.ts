import { Functions } from "../library/functions";
import { Appdb } from './appdb';
const functions = new Functions();

export interface Patient {
  patient_id?: bigint,
  first_name: string,
  last_name: string,
  date_of_birth: string,
  gender: string,
  address: string,
  phone_number: string,
  email: string,
  password: string

}

class PatientModel extends Appdb {

  constructor() {
    super();
    this.table = 'patient';
    this.uniqueField = 'patient_id';

  }

  /**
 * Retrieves all doctors of a particular hospital based on the hospital ID.
 * @param hospital_id The ID of the hospital to retrieve doctors for.
 * @returns A promise that resolves to an array of doctors with their speciality and details.
 */


  async getAllDoctorOfParticularHospital(hospital_id: number,page:number): Promise<any> {

    const selectFields = "d.speciality, json_agg(json_build_object('first_name', d.first_name, 'last_name', d.last_name, 'gender', d.gender,'phone_number', d.phone_number, 'email', d.email, 'fees', d.fees)) as doctors";
    this.table = "doctorhospital dh JOIN doctor d ON dh.doctor_id = d.doctor_id";
    this.where = "WHERE dh.hospital_id = " + hospital_id + " GROUP BY d.speciality ORDER BY d.speciality, MIN(d.fees) ";
    this.rpp = 10;
    this.page=page;
    //  const result = await this.select(fromTable, selectFields, whereCondition, '', limitCondition);
    const result = await this.listRecords(selectFields);
    return result;


  }

}

export default new PatientModel();
