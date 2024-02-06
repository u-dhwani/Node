import { QueryResult } from 'pg';
import { Functions } from "../library/functions";
import { Appdb } from './appdb';
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

    async deleteSlots(): Promise<any> {
        const dayIndex = new Date().getDay();
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        // Get the day name for today
        const todayDay = dayNames[dayIndex];

        const setValues = "booked_slots = ARRAY[]::text[] ";
        const whereCondition="days = '"+todayDay+"'";
        const result = await this.updateDynamicQuery(setValues,whereCondition);
        return result;
    }


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
