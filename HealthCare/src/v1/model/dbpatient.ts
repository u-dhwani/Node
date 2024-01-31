import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions=new Functions();

export interface Patient {
     patient_id ?:bigint,
     first_name:string,
     last_name:string,
     date_of_birth:string,
     gender:string,
     address:string,
     phone_number:string,
     email:string,
     password:string
    
}

class PatientModel extends Appdb {
  
  constructor() {
    super();
    this.table = 'patient';
    this.uniqueField = 'patient_id';
    this.findUserByEmail='email';
  } 


//   async getAllPatients(pageSize: number, offset: number): Promise<{ error: boolean; message: string; data: any }> {
//     try {
//       const result: QueryResult<Patient> = await this.pool.query('SELECT * FROM Patients LIMIT $1 OFFSET $2', [pageSize, offset]);
//       return {
//         error: false,
//         message: "Patients data retrieved successfully",
//         data: result.rows
//       };
//     } catch (error: any) {
//       console.error('Error executing getAllPatients query:', error);
//       return {
//         error: true,
//         message: error.message || "Error fetching Patients data",
//         data: null
//       };
//     }
//   }

//   async removePatientByEmail(email: string): Promise<{ error: boolean; message: string; data: any }> {
//     try {
//       const conditions: Condition[] = [
//         { columnName: 'email', value: email },
//       ];
//       const result = await this.deleteRecord(conditions);
//       return {
//         error: false,
//         message: "Patient removed successfully",
//         data: result
//       };

//     } catch (error: any) {
//       console.error('Error executing removePatientByEmail query:', error);
//       return {
//         error: true,
//         message: error.message || "Error removing Patient",
//         data: null
//       };
//     }
//   }

//   async updateAddressOfPatientByEmail(address: string, email: string): Promise<{ error: boolean; message: string; data: any }> {
//     try {
//       const result = await this.updateRecord(['email'], [email], { address: address });
//       return {
//         error: false,
//         message: "Patient updated successfully",
//         data: result
//       };

//     } catch (error: any) {
//       console.error('Error executing updateAddressOfPatientByEmail query:', error);
//       return {
//         error: true,
//         message: error.message || "Error updating Patient",
//         data: null
//       };
//     }
//   }
 }

export default new PatientModel();
