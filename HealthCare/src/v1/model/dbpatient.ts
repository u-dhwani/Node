import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';
import { connection } from '../library/connection';
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
  private connectionObj: connection;
 
  constructor() {
    super();
    this.connectionObj = new connection();
    this.connectionObj.connect();
    this.table = 'patient';
    this.uniqueField = 'patient_id';
    this.findUserByEmail='email';

    
  } 

  async getAllDoctorOfParticularHospital(hospital_id: number): Promise<any> {
    let client;
  
    try {
      client = await this.connectionObj.getConnection();
      let start = (this.page - 1) * this.rpp;
  
      const result = await client.query(`
        SELECT d.speciality, json_agg(json_build_object('first_name', d.first_name, 'last_name', d.last_name, 'gender', d.gender,
        'phone_number', d.phone_number, 'email', d.email, 'fees', d.fees)) as doctors
        FROM doctorhospital dh
        JOIN doctor d ON dh.doctor_id = d.doctor_id
        WHERE dh.hospital_id = $1
        GROUP BY d.speciality
        ORDER BY d.speciality, MIN(d.fees)
        LIMIT $2 OFFSET $3`, [hospital_id, this.rpp, start]);
  
      return result.rows;
    } catch (error) {
      throw error;
    } 
    
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
