import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';

const functions=new Functions();


export interface Products {
    products_id?: bigint,
    product_name : string,
    price : number,
    quantity : number
       
}

class ProductModel extends Appdb {
  
  constructor() {
    super();
    this.table = 'products';
    this.uniqueField = 'products_id';
  
  }

  async checkandUpdateQuantity(product_id:number,quantity:number):Promise<any>{
    
    const setValues = "quantity = CASE WHEN "+quantity+" < quantity THEN quantity - "+quantity+" ELSE quantity END";
    const whereCondition = 'products_id = '+product_id;
     const result=await this.updateDynamicQuery(setValues, whereCondition);
    return result;

  }

}

export default new ProductModel();
