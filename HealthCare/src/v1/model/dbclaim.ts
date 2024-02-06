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

    async updateAmountinClaim(patient_admit_id: number) {
        const setValues = "claim_amount = PA.billing_amount FROM PATIENT_ADMIT AS PA";
        const whereClause = " CLAIM.admit_id = PA.patient_admit_id AND CLAIM.admit_id = " + patient_admit_id;
        const result = this.updateDynamicQuery(setValues, whereClause);
        return result;
    }
}

export default new ClaimModel();
