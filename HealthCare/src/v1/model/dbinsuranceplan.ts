import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions = new Functions();


export interface InsurancePlan {

    insurance_plan_id?: bigint,
    insurance_company_id: number,
    insurance_plan_name: string,
    amount: number,
    duration: number

}

class InsurancePlanModel extends Appdb {

    constructor() {
        super();
        this.table = 'insurance_plan';
        this.uniqueField = 'insurance_plan_id';
    }

}

export default new InsurancePlanModel();
