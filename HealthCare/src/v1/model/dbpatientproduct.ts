import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions = new Functions();


export interface PatientProduct {
  patients_products_used_id?: bigint,
  patient_admit_id: number,
  product_id: number,
  quantity: number
}

class PatientProductModel extends Appdb {

  constructor() {
    super();
    this.table = 'patient_products_used';
    this.uniqueField = 'patient_products_used_id';

  }

}

export default new PatientProductModel();
