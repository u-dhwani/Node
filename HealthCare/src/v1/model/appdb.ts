import { db } from "../library/db";
import { Functions } from "../library/functions";
import { QueryResult } from 'pg';
import { Patient } from "./dbpatient";
import { Request, Response } from 'express';
import express from "express";

const functions=new Functions();
export interface Condition {
	columnName: string;
	value: any;
}

export class Appdb extends db {
	
	constructor() {
		super();
	}
	
	async createRecord<T>(recordData: T): Promise<Response<any, Record<string, any>> | any> {
		try {
		  const result = await this.insertRecord(recordData);
			
		  if (!result) {
			return { status: 500, message: `Something went wrong while inserting ${this.table}`, data: null };
		  } else {
			return { status: 200, message: `${this.table} inserted successfully`, data: result };
		  }
	  
		} catch (error: any) {
		  return { status: 500, message: `Error creating ${this.table}`, data: null };
		}
	  }
	  
	  async getUserByCriteria(criteria: Record<string, any>,orderBy:string): Promise<Response<any, Record<string, any>> | any> {
		try {
			this.orderby=orderBy;
			const result = await this.selectRecord(criteria);
			return result || null;
	
		} catch (error: any) {
			return { status: 500, message: error.message, data: null };
		}
	}

	//   async getUserByEmail(email: string): Promise<Response<any, Record<string, any>> | any> {
	// 	try {
	// 	  const result = await this.selectRecord({email:email});
	// 	  return result || { status: 500, message: 'Error in retrieving', data: null };
	  
	// 	} catch (error: any) {
	// 	  return { status: 500, message: error.message, data: null };
	// 	}
	//   }
	  
	//   async getUserById(id: number): Promise<Response<any, Record<string, any>> | any> {
	// 	try {
	// 	  const result = await this.selectRecord({id:id});
	// 	  return result || { status: 500, message: 'Error in retrieving', data: null };
	  
	// 	} catch (error: any) {
	// 	  return { status: 500, message: error.message, data: null };
	// 	}
	//   }
	  
	  async recordUpdate(id: number, data: any): Promise<Response<any, Record<string, any>> | any> {
		try {
		  const result = await this.updateRecord(id, data);
		  return result > 0 ? { status: 200, message: 'Record updated successfully', data: result } : { status: 404, message: 'Record not found', data: null };
		} catch (error: any) {
		  return { status: 500, message: error.message, data: null };
		}
	  }

	  
	  
	 }


export default new Appdb();