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
    this.findUserByEmail = 'email';
  }

  async getAllDoctorOfParticularHospital(hospital_id: number): Promise<any> {

    const selectFields = "d.speciality, json_agg(json_build_object('first_name', d.first_name, 'last_name', d.last_name, 'gender', d.gender,'phone_number', d.phone_number, 'email', d.email, 'fees', d.fees)) as doctors";
    const fromTable = "doctorhospital dh JOIN doctor d ON dh.doctor_id = d.doctor_id";
    const whereCondition = "dh.hospital_id = " + hospital_id + " GROUP BY d.speciality ORDER BY d.speciality, MIN(d.fees) ";
    const limitCondition = "" + this.rpp;
    const result = await this.selectdynamicQuery(selectFields, fromTable, whereCondition, 20, 0);
    return result;


  }
  async addBookedSlot(doctor_id: number, hospital_id: number, appointment_time: string, day: string) {

    this.table = 'doctor_availability';
    const setValues = "booked_slots = array_append(booked_slots, '" + appointment_time + "')";
    const whereCondition = "doctor_id=" + doctor_id + " and hospital_id=" + hospital_id + " and days = '" + day + "'";
    const results = await this.updateDynamicQuery(setValues, whereCondition);
    return results;
  }


}

export default new PatientModel();
