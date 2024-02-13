import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions = new Functions();

export interface Claim {

    claim_id?: bigint,
    insurance_company_id: number,
    insurance_plan_id: number,
    patient_id: number,
    hospital_id: number,
    admit_id: number,
    total_amount?: number,
    claim_date: string,
    claim_amount: number,
    claim_status: string

}

class ClaimModel extends Appdb {

    constructor() {
        super();
        this.table = 'claim';
        this.uniqueField = 'claim_id';

    }

    /**
     * Updates the claim amount in the claim table based on the billing amount from the patient admit table.
     * @param patient_admit_id The ID of the patient admission record.
     * @returns A promise that resolves to the result of the update operation.
    */


   

    async updateAmountinClaim(patient_admit_id: number, billing_amount: number) {
        const data = { claim_amount: billing_amount };
        this.uniqueField = "CLAIM.admit_id";
        //const whereClause = `WHERE CLAIM.admit_id = ${patient_admit_id}`; // Construct the WHERE clause
        // const result = await this.update(this.table, data, whereClause); // Call update
        const result = await this.updateRecord(patient_admit_id, data);
        return result;


    }

}

export default new ClaimModel();
