
import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export interface Condition {
  columnName: string;
  value: any;
}

class DbConnection <T>{
  
  protected pool: Pool;
  private tableName: string;

  constructor(tableName: string) {
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432', 10),
    });
    this.tableName = tableName;
  }
  async addRecord(record: Partial<T>): Promise<T> {
    const columns = Object.keys(record).join(', ');
    const values = Object.values(record);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    try {
      const result = await this.pool.query(
        `INSERT INTO ${this.tableName}(${columns}) VALUES(${placeholders}) RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error(`Error adding record to ${this.tableName}:`, error);
      throw error;
    }
  }

  async updateRecord(columnNames: string[], columnValues: any[], record: Partial<T>): Promise<T> {
    const columnsToUpdate = Object.keys(record).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(record);

    try {
      const whereClause = columnNames.map((col, index) => `${col} = $${values.length + index + 1}`).join(' AND ');
      const result = await this.pool.query(
        `UPDATE ${this.tableName} SET ${columnsToUpdate} WHERE ${whereClause} RETURNING *`,
        [...values, ...columnValues]
      );

      return result.rows[0];
    } catch (error) {
      console.error(`Error updating record in ${this.tableName}:`, error);
      throw error;
    }
  }

  async deleteRecord(conditions: Condition[]): Promise<T> {
    try {
      const whereClause = conditions.map((condition, index) => `${condition.columnName} = $${index + 1}`).join(' AND ');
      const values = conditions.map(condition => condition.value);

      const result = await this.pool.query(`DELETE FROM ${this.tableName} WHERE ${whereClause} RETURNING *`, values);

      return result.rows[0];
    } catch (error) {
      console.error(`Error deleting record from ${this.tableName}:`, error);
      throw error;
    }
  }


  async select(conditions: Condition[]): Promise<T[]> {
    try {
      const whereClause = conditions.map((condition, index) => `${condition.columnName} = $${index + 1}`).join(' AND ');
      const values = conditions.map(condition => condition.value);
  
      const result = await this.pool.query(`SELECT * FROM ${this.tableName} WHERE ${whereClause}`, values);
  
      return result.rows;
    } catch (error) {
      console.error(`Error selecting records from ${this.tableName}:`, error);
      throw error;
    }
  }

  
 
}
export default DbConnection;


/*conditions.map((condition, index) => ...):

This part iterates over each element in the conditions array using the map function.
condition represents an element of the conditions array (an object with properties columnName and value).
index represents the index of the current element in the array.
${condition.columnName} = $${index + 1}:

For each condition in the array, this expression generates a string representing a condition in the SQL WHERE clause.
${condition.columnName} retrieves the column name from the current condition.
= $${index + 1} adds the condition for equality, where $${index + 1} is a placeholder for a parameter in the SQL query. The index + 1 is used to create a unique placeholder for each condition. */
// interface BaseModel<T> {
//   addRecord(record: T): Promise<T>;
//   updateRecord(columnNames: string[], columnValues: any[], record: Partial<T>): Promise<T>;
//   deleteRecord(conditions: Condition[]): Promise<T>;
// }
// export class GenericModel<T> extends DbConnection implements BaseModel<T> {
//   private tableName: string;

//   constructor(tableName: string, entity: string) {
//     super(entity);
//     this.tableName = tableName;
//   }
  

//   async addRecord(record: Partial<T>): Promise<T> {
//     const columns = Object.keys(record).join(', ');
//     const values = Object.values(record);
//     const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

//     try {
//       const result = await this.pool.query(
//         `INSERT INTO ${this.tableName}(${columns}) VALUES(${placeholders}) RETURNING *`,
//         values
//       );

//       return result.rows[0];
//     } catch (error) {
//       console.error(`Error adding record to ${this.tableName}:`, error);
//       throw error;
//     }
//   }

//   async updateRecord(columnNames: string[], columnValues: any[], record: Partial<T>): Promise<T> {
//     const columnsToUpdate = Object.keys(record).map((key, index) => `${key} = $${index + 1}`).join(', ');
//     const values = Object.values(record);

//     try {
//       const whereClause = columnNames.map((col, index) => `${col} = $${values.length + index + 1}`).join(' AND ');
//       const result = await this.pool.query(
//         `UPDATE ${this.tableName} SET ${columnsToUpdate} WHERE ${whereClause} RETURNING *`,
//         [...values, ...columnValues]
//       );

//       return result.rows[0];
//     } catch (error) {
//       console.error(`Error updating record in ${this.tableName}:`, error);
//       throw error;
//     }
//   }

//   async deleteRecord(conditions: Condition[]): Promise<T> {
//     try {
//       const whereClause = conditions.map((condition, index) => `${condition.columnName} = $${index + 1}`).join(' AND ');
//       const values = conditions.map(condition => condition.value);

//       const result = await this.pool.query(`DELETE FROM ${this.tableName} WHERE ${whereClause} RETURNING *`, values);

//       return result.rows[0];
//     } catch (error) {
//       console.error(`Error deleting record from ${this.tableName}:`, error);
//       throw error;
//     }
//   }
// }

// export default DbConnection;

// // import { Pool } from 'pg';
// // import dotenv from 'dotenv';

// // dotenv.config();

// // // const pool = new Pool({
// // //   user: process.env.DB_USER,
// // //   host: process.env.DB_HOST,
// // //   database: process.env.DB_NAME,
// // //   password: process.env.DB_PASSWORD,
// // //   port: parseInt(process.env.DB_PORT || '5432', 10),
// // // });


// // class DbConnection{
// //   protected pool;
// //   private entity;
// //   public constructor(entity:string){
// //     this.pool = new Pool({
// //       user: process.env.DB_USER,
// //       host: process.env.DB_HOST,
// //       database: process.env.DB_NAME,
// //       password: process.env.DB_PASSWORD,
// //       port: parseInt(process.env.DB_PORT || '5432', 10)
// //     });
// //         this.entity = entity;
// //     }
// // }
