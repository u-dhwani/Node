import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions = new Functions();


export interface Hospital {
  hospital_id?: bigint,
  hospital_name: string,
  address: string,
  city: string,
  state: string,
  password: string,
  email: string,
  phone_number: string

}

class HospitalModel extends Appdb {

  constructor() {
    super();
    this.table = 'hospital';
    this.uniqueField = 'hospital_id';


  }

  // async allRecords(fields = '*') {
  // 	let result = await this.select(this.table, fields, this.where, this.orderby, '');
  // 	return !result ? [] : result;
  // }


  async calculateBillingAmount(patient_admit_id: number) {


    const setValues = 'SUM(products.price * patient_products_used.quantity) + MAX(doctor_fees) as billing_amount ';

    this.table = "patient_products_used JOIN products ON patient_products_used.product_id = products.products_id JOIN patient_admit ON patient_products_used.patient_admit_id = patient_admit.patient_admit_id";
    this.where = "WHERE patient_products_used.patient_admit_id = " + patient_admit_id;
    let result = await this.allRecords(setValues);
    return result;

  }
}

export default new HospitalModel();
