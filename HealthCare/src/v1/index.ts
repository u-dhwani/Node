import express from 'express';
import { Functions } from '../v1/library/functions';
import adminRouter from './controller/admin';
import doctorRouter from './controller/doctor';
import hospitalRouter from './controller/hospital';
import insuranceCompanyRouter from './controller/insurance_company';
import patientRouter from './controller/patient';

const functions = new Functions();

const router = express.Router();

router.use('/patient',patientRouter);
router.use('/doctor',doctorRouter);
router.use('/hospital',hospitalRouter);
router.use('/admin',adminRouter);
router.use('/insurance-company',insuranceCompanyRouter);

module.exports = router;