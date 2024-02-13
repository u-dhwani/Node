import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions = new Functions();


export interface PatientBilling {
    patient_billing_id?: bigint,
    patient_id: number,
    admit_id: number,
    claim_id: number,
    billing_date: string,
    billing_total_amount: number,
    claim_amount: number,
    payable_amount: number,
    payment_status: string

}

class PatientBillingModel extends Appdb {

    constructor() {
        super();
        this.table = 'patient_billing';
        this.uniqueField = 'patient_billing_id';

    }
}

export default new PatientBillingModel();
