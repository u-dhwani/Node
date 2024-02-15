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


	formatValue(value: any): string {
		if (typeof value === 'string') {
			return "'" + value + "'";
		}
		return value.toString();
	}

	/**
	 * Retrieves user records based on specified criteria.
	 * @param criteria Criteria for filtering records.
	 * @param orderBy Column to order the results by.
	 * @returns An array of user records or null if no records found.
	 */
	async getUserByCriteria(criteria: Record<string, any>, orderBy: string, page: number): Promise<Response<any, Record<string, any>> | any> {

		if (orderBy != '')
			this.orderby = 'ORDER BY ' + orderBy;
		let whereClause = '';
		const keys = Object.keys(criteria);
		if (keys.length > 0) {
			whereClause += 'WHERE ';
			keys.forEach((key, index) => {
				whereClause += key + ' = ' + this.formatValue(criteria[key]);
				if (index < keys.length - 1) {
					whereClause += ' AND ';
				}
			});
		}
		this.where = whereClause;
		this.page = page;
		this.rpp = 1;
		const result = await this.listRecords('*');
		//const result = await this.selectRecord(criteria);
		return result;
	}



	/**
	* Retrieves user records by ID.
	* @param id User ID.
	* @param conditionField Field to condition the query.
	* @returns An array of user records or null if no records found.
	*/
	async getUsers(id: number, conditionField: string, page: number) {
		this.where = "WHERE " + conditionField + "= " + id;
		this.rpp = 5;
		this.page = page;
		const result = await this.listRecords("*");
		return result;
	}

	/**
	 * Deletes a row from the database by ID.
	 * @param id The ID of the row to delete.
	 * @returns A promise that resolves to the deletion result.
	 */
	async deleteRow(id: number): Promise<any> {
		const condition = "WHERE " + this.uniqueField + "=" + id;
		const result = this.delete(this.table, condition);
		return result;
	}

}


export default new Appdb();