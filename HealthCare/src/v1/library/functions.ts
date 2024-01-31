import dateFormat from "dateformat";
import fs from "fs";
import ini from "ini";
import path from "path";
import { constants } from "../constants";
import { NextFunction, Request, Response } from 'express';
//const dateFormatPromise = require('dateformat/lib/dateformat');

let ENVIRONMENT: any = process.env.APP_ENV || 'localhost';

export class Functions {
    static static_languagevars: any = {};
    public languagevars: any = {};
    protected language: string = '';

    constructor() {
        /* Get Language Data */
        this.language = 'english';
      //  this.languagevars = this.getLanguageData();
    }
    
    
    
    
    output(status_code: number, status_message: any, data: any = null) {
        if (this.languagevars[status_message]) status_message = this.languagevars[status_message];

        let output = {
            status_code: status_code.toString(),
            status_message: status_message,
            //datetime: dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
            data: data
        };

        /* if (data.length > 0 || Object.keys(data).length) {
            output.data = data;
        } else {
            delete output.data;
        } */

        return output;
    }
    /**
     * Get language.ini variable to available in whole app
     */
    // getLanguageData() {
    //     if (Object.keys(Functions.static_languagevars).length == 0) {
    //         let languageArray = ini.parse(fs.readFileSync(path.join(__dirname, '../../../', 'language.ini'), 'utf-8'));
    //         Functions.static_languagevars = languageArray[this.language];
    //     }
    //     return Functions.static_languagevars;
    // }

    /*

     * Function to convert date in Long date format
     * @param date Date
     * @param showtime if want to show time or not
     * @returns date in format of "02 Aug 2019" or "02 Aug 2019 12:47 PM"
     */
    //  DatabaseToDisplayDate(date: string, showtime = false) {
    //    // const dateFormat = await import('dateformat');
    //     if (showtime) {
    //         return dateFormat(date, 'dd mmm yyyy h:MM TT');
    //     } else {
    //         return dateFormat(date, 'dd mmm yyyy');
    //     }
   
    // }
    // DatabaseToDisplayDate(date: string, showtime = false) {
    //     return dateFormatPromise.then((dateFormat: (date: string, format: string) => string) => {
    //         if (showtime) {
    //             return dateFormat(date, 'dd mmm yyyy h:MM TT');
    //         } else {
    //             return dateFormat(date, 'dd mmm yyyy');
    //         }
    //     });
    // }

    /**
     * Send output to client with status code and message
     * @param status_code status code of a response
     * @param status_message status message of a response
     * @param data response data
     * @returns object with 3 parameters
     */
}

