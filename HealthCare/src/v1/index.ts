import express, {  Request, Response, NextFunction } from 'express'; 
import Joi from "joi";
import {validations} from "./library/validations";
import {Functions} from '../v1/library/functions';

const functions = new Functions();

const router = express.Router();
import patientRouter from './controller/patient';
import doctorRouter from './controller/doctor';

import hospitalRouter from './controller/hospital';

//router.use(validateSchema);

/**
 * Validation function for search medicine route
 */
// function validateSchema(req: any, res: any, next: any) {
//     let schema = Joi.object({
//         user_id: Joi.number().integer().required(),
//         accesstoken: Joi.string().trim().alphanum().min(32).max(32).required()
//     });

//     let validationsObj = new validations();
//     if (!validationsObj.validateRequest(req, res, next, schema)) {
//         return false;
//     }
// }





/*
 *  Controllers (route handlers)
 */
//let productsRouter = require('./controller/products');


/*
 * Primary app routes.
 */
//router.use('/products', productsRouter);
router.use('/patient',patientRouter);
router.use('/doctor',doctorRouter);
router.use('/hospital',hospitalRouter);

module.exports = router;