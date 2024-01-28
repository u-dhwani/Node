"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class DbConnection {
    constructor(tableName) {
        this.pool = new pg_1.Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT || '5432', 10),
        });
        this.tableName = tableName;
    }
    addRecord(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const columns = Object.keys(record).join(', ');
            const values = Object.values(record);
            const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
            try {
                const result = yield this.pool.query(`INSERT INTO ${this.tableName}(${columns}) VALUES(${placeholders}) RETURNING *`, values);
                return result.rows[0];
            }
            catch (error) {
                console.error(`Error adding record to ${this.tableName}:`, error);
                throw error;
            }
        });
    }
    updateRecord(columnNames, columnValues, record) {
        return __awaiter(this, void 0, void 0, function* () {
            const columnsToUpdate = Object.keys(record).map((key, index) => `${key} = $${index + 1}`).join(', ');
            const values = Object.values(record);
            try {
                const whereClause = columnNames.map((col, index) => `${col} = $${values.length + index + 1}`).join(' AND ');
                const result = yield this.pool.query(`UPDATE ${this.tableName} SET ${columnsToUpdate} WHERE ${whereClause} RETURNING *`, [...values, ...columnValues]);
                return result.rows[0];
            }
            catch (error) {
                console.error(`Error updating record in ${this.tableName}:`, error);
                throw error;
            }
        });
    }
    deleteRecord(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const whereClause = conditions.map((condition, index) => `${condition.columnName} = $${index + 1}`).join(' AND ');
                const values = conditions.map(condition => condition.value);
                const result = yield this.pool.query(`DELETE FROM ${this.tableName} WHERE ${whereClause} RETURNING *`, values);
                return result.rows[0];
            }
            catch (error) {
                console.error(`Error deleting record from ${this.tableName}:`, error);
                throw error;
            }
        });
    }
}
exports.default = DbConnection;
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
