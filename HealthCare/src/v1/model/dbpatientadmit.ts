import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions = new Functions();


export interface PatientAdmit {
  admit_id?: number;
  patient_id: number;
  doctor_id: number;
  hospital_id: number;
  admit_date: string
  admit_time: string;
  discharge_date?: string | null;
  discharge_time?: string | null;
  billing_amount?: number | null;
  doctor_fees?: number | null;

}

class PatientAdmitModel extends Appdb {

  constructor() {
    super();
    this.table = 'patient_admit';
    this.uniqueField = 'patient_admit_id';

  }

  /**
  * Retrieves the latest admit ID for a patient.
  * @param patient_id The ID of the patient.
  * @returns A promise that resolves to the latest admit ID for the patient.
  */
  async latestAdmitId(patient_id: number) {

    this.rpp = 1;
    this.where = "WHERE patient_id = " + patient_id;
    this.orderby = " ORDER BY admit_date DESC, admit_time DESC";
    const result = await this.listRecords(this.uniqueField);
    //const result = await this.select(this.table, this.uniqueField, whereCondition, '', limitValue);
    return result;

  }


  /**
  * Updates the billing amount for a patient admission record.
  * @param patient_admit_id The ID of the patient admission record.
  * @returns A promise that resolves to the result of the update operation.
  */


  async updateBillingAmount(patient_admit_id: number, billing_amount: number) {



    const data = { billing_amount: billing_amount };

    // const whereCondition = `WHERE patient_admit_id = ${patient_admit_id}`;

    let result: any[] = await this.updateRecord(patient_admit_id, data);
    console.log("updatebillingamount:" + result);
    return result;

  }

  async updateDoctorFeesInPatientAdmit(doctor_id: number, hospital_id: number, patient_id: number, doctor_fees: number) {

    const setValues = {
      doctor_fees: `doctor_fees + ${doctor_fees}`
    }
    //doctor_fees: "doctor_fees + " + doctor_fees


    console.log(setValues);
    const whereCondition = "WHERE patient_id = " + patient_id + " AND doctor_id = " + doctor_id + " AND hospital_id = " + hospital_id;

    let result: any[] = await this.update(this.table, setValues, whereCondition);
    console.log(result);
    return result;




  }
}

export default new PatientAdmitModel();
