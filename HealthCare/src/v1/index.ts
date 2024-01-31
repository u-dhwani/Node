import express, {  Request, Response, NextFunction } from 'express'; 
import {Functions} from '../v1/library/functions';

const functions = new Functions();

const router = express.Router();
import patientRouter from './controller/patient';
import doctorRouter from './controller/doctor';

import hospitalRouter from './controller/hospital';
import adminRouter from './controller/admin';

router.use('/patient',patientRouter);
router.use('/doctor',doctorRouter);
router.use('/hospital',hospitalRouter);
router.use('/admin',adminRouter);

module.exports = router;