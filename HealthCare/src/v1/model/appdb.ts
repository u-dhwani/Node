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
			return functions.output(500, `Something went wrong while inserting ${this.table}`);
			//return res.json(functions.output(500, user_id_query.status_message, null));
		  } else {
			return functions.output(200, `${this.table} inserted successfully`, result);
		  }
	
		} catch (error: any) {
		  return functions.output(500, `Error creating ${this.table}`);
		}
	  }

	  async getUserByEmail(email: string): Promise<Response<any, Record<string, any>> |  any> {
		try {
		  
		  const result=await this.selectRecordByEmail(email);
		  if(result){
			return result;
		  }
		  else{
			return functions.output(500, 'Error in retrieving',null);
			
		  }
	
		} catch (error: any) {
			return functions.output(500, error.message,null);
		}
	  }

	  async getUserById(id: number): Promise<Response<any, Record<string, any>> |  any> {
		try {
		  
		  const result=await this.selectRecord(id);
		  if(result){
			return result;
		  }
		  else{
			return functions.output(500, 'Error in retrieving',null);
			
		  }
	
		} catch (error: any) {
			return functions.output(500, error.message,null);
		}
	  }

	
}

export default new Appdb();