import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';
import { set } from 'date-fns';
const cron = require('node-cron');

const functions = new Functions();

export interface DoctorAvailability {
    doctor_availability_id?: number;
    hospital_id: number;
    doctor_id: number;
    start_time: string,
    end_time: string,
    duration: number;
    days: string

}

class DoctorAvailabilityModel extends Appdb {

    constructor() {
        super();
        this.table = 'doctor_availability';
        this.uniqueField = 'doctor_availability_id';


    }


    /**
    * Adds a booked slot for a doctor's availability on a specific day.
    * @param doctor_id The ID of the doctor.
    * @param hospital_id The ID of the hospital.
    * @param appointment_time The time of the appointment.
    * @param day The day of the appointment.
    * @returns A promise that resolves to the result of the query.
    */

    async addBookedSlot(doctor_id: number, hospital_id: number, appointment_time: string, day: string) {

        //  const setValues = "booked_slots = array_append(booked_slots, '" + appointment_time + "')";
        const data = {
            booked_slots: `array_append(booked_slots, '${appointment_time}')`
        };
        const whereCondition = "WHERE doctor_id=" + doctor_id + " and hospital_id=" + hospital_id + " and days = '" + day + "'";
        const results = await this.update(this.table, data, whereCondition);
        return results;
    }


    
    async updateDoctorAvailability(doctor_id: number, hospital_id: number, start_time: string, end_time: string, days: string) {
        //  const setValues = "start_time = '" + start_time + "', end_time = '" + end_time + "'";
        const data = {
            start_time: start_time,
            end_time: end_time
        }
        const whereCondition = "WHERE doctor_id = " + doctor_id + " AND hospital_id = " + hospital_id + " AND days='" + days + "'";
        const result = await this.update(this.table, data, whereCondition);

        return result;

    }



    /**
     * Deletes all booked slots for the current day.
     * @returns A promise that resolves to the result of the query.
     */
    async deleteSlots(): Promise<any> {
        const dayIndex = new Date().getDay();
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        // Get the day name for today
        const todayDay = dayNames[dayIndex];

        // const setValues = "booked_slots = ARRAY[]::text[] ";
        const data = {
            booked_slots: [] // Empty array as per your setValues
        };
        const whereCondition = "WHERE days = '" + todayDay + "'";
        const result = await this.update(this.table,data, whereCondition);
        return result;
    }


    /**
     * Schedules a task to run daily at a specified time to delete booked slots for the current day.
     */
    public scheduleTask() {
        // Schedule a task to run every day at 12:0
        console.log("scheduleTask");
        cron.schedule('26 21 * * *', async () => {
            console.log('Running scheduled task at:', new Date());
            try {
                // Call the function to delete slots
                await this.deleteSlots();
                console.log('Scheduled task completed.');
            } catch (error) {
                console.error('Error in scheduled task:', error);
            }
        });
    }
}

export default new DoctorAvailabilityModel();
