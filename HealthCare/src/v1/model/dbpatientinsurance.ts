import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions = new Functions();


export interface PatientInsurance {
    patient_insurance_id?: bigint,
    patient_id: number,
    insurance_plan_id: number,
    policy_number: string,
    policy_buy_date: string,
    subscriber_first_name: string,
    subscriber_last_name: string,
    subscriber_date_of_birth: string,
    subscriber_phone_number: string

}

class PatientInsuranceModel extends Appdb {

    constructor() {
        super();
        this.table = 'patient_insurance';
        this.uniqueField = 'patient_insurance_id';
    }

}

export default new PatientInsuranceModel();
