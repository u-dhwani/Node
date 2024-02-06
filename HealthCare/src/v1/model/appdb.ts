import { Response } from 'express';
import { db } from "../library/db";
import { Functions } from "../library/functions";

const functions = new Functions();

/**
 * Interface representing a condition for filtering records.
 */
export interface Condition {
	columnName: string;
	value: any;
}

/**
 * Database access class for application.
 */
export class Appdb extends db {
	constructor() {
		super();
	}

	/**
   * Creates a new record in the database.
   * @param recordData Data of the record to be created.
   * @returns The created record or null if creation fails.
   */
	async createRecord<T>(recordData: T): Promise<Response<any, Record<string, any>> | any> {
		const result = await this.insertRecord(recordData);
		if (!result) {
			return null;
		} else {
			return result;
		}
	}


	/**
	 * Retrieves user records based on specified criteria.
	 * @param criteria Criteria for filtering records.
	 * @param orderBy Column to order the results by.
	 * @returns An array of user records or null if no records found.
	 */
	async getUserByCriteria(criteria: Record<string, any>, orderBy: string): Promise<Response<any, Record<string, any>> | any> {

		this.orderby = orderBy;
		const result = await this.selectRecord(criteria);
		return result || null;
	}


	/**
	* Retrieves user records by ID.
	* @param id User ID.
	* @param conditionField Field to condition the query.
	* @returns An array of user records or null if no records found.
	*/
	async getUsers(id: number, conditionField: string) {
		this.where = conditionField + "= " + id;
		let results: any[] = await this.listRecords("*");
		return results;
	}

	/**
	 * Updates a record in the database by ID.
	 * @param id The ID of the record to update.
	 * @param data The data to update the record with.
	 * @returns The number of records updated or null if no records found.
	 */
	async recordUpdate(id: number, data: any): Promise<Response<any, Record<string, any>> | any> {

		const result = await this.updateRecord(id, data);
		return result > 0 ? result : null;

	}


	/**
	 * Deletes a row from the database by ID.
	 * @param id The ID of the row to delete.
	 * @returns A promise that resolves to the deletion result.
	 */
	async deleteRow(id: number): Promise<any> {
		const condition = "" + this.uniqueField + "=" + id;
		const result = this.delete(this.table, condition);
		return result;
	}

}


export default new Appdb();