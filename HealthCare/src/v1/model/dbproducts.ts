import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions = new Functions();


export interface Products {
  products_id?: bigint,
  product_name: string,
  price: number,
  quantity: number

}

class ProductModel extends Appdb {

  constructor() {
    super();
    this.table = 'products';
    this.uniqueField = 'products_id';

  }

  /**
 * Checks and updates the quantity of a product.
 * If the provided quantity is less than the available quantity, it subtracts the provided quantity from the available quantity.
 * If the provided quantity is greater than or equal to the available quantity, it sets the available quantity to 0.
 * @param product_id The ID of the product.
 * @param quantity The quantity to subtract from the available quantity.
 * @returns A promise that resolves to the result of the update operation.
 */

  async checkandUpdateQuantity(product_id: number, quantity_buy: number): Promise<any> {

    const setValues = {
      quantity: `CASE WHEN ${quantity_buy} < quantity THEN quantity - ${quantity_buy} ELSE quantity END`
    };
    //const whereCondition = 'WHERE products_id = ' + product_id;
    //const result = await this.updateDynamicQuery(setValues, whereCondition);
    const result = await this.updateRecord(product_id, setValues);

    return result;
    
  }

}

export default new ProductModel();


 // const data = { claim_amount: billing_amount };
    // this.uniqueField = "CLAIM.admit_id";
    // //const whereClause = `WHERE CLAIM.admit_id = ${patient_admit_id}`; // Construct the WHERE clause
    // // const result = await this.update(this.table, data, whereClause); // Call update
    // const result = await this.updateRecord(patient_admit_id, data);
    // return result;