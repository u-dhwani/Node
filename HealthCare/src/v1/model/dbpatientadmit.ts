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

}

class PatientAdmitModel extends Appdb {

  constructor() {
    super();
    this.table = 'patient_admit';
    this.uniqueField = 'patient_admit_id';

  }

  async latestAdmitId(patient_id: number) {


    let start = (this.page - 1) * this.rpp;
    const whereCondition = "patient_id = " + patient_id + " ORDER BY admit_date DESC, admit_time DESC";
    const limitValue = 1;
    const offsetValue = 0;
    const result = await this.selectdynamicQuery(this.uniqueField, this.table, whereCondition, limitValue, offsetValue)
    console.log("latestadmitid" + result);
    return result;


  }

  async updateBillingAmount(patient_admit_id: number) {

    const setValues = "billing_amount = (SELECT SUM(products.price * patient_products_used.quantity) FROM patient_products_used JOIN products ON patient_products_used.product_id = products.products_id WHERE patient_products_used.patient_admit_id = patient_admit.patient_admit_id)";
    const whereCondition = 'patient_admit_id= ' + patient_admit_id;

    let result: any[] = await this.updateDynamicQuery(setValues, whereCondition);
    return result;


  }



}

export default new PatientAdmitModel();
