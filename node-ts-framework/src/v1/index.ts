import express from "express";
import Joi from "joi";
import { validations } from "./library/validations";

const router = express.Router();

router.use(validateSchema, checkAccess);

/**
 * Validation function for search medicine route
 */
function validateSchema(req: any, res: any, next: any) {
    let schema = Joi.object({
        user_id: Joi.number().integer().required(),
        accesstoken: Joi.string().trim().alphanum().min(32).max(32).required()
    });

    let validationsObj = new validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }
}

/**
 * Check Access of a chemist or a Staff
 */
async function checkAccess(req: any, res: any, next: any) {
    // Logic to check access

    next();
}

/*
 *  Controllers (route handlers)
 */
let productsRouter = require('./controller/products');

/*
 * Primary app routes.
 */
router.use('/products', productsRouter);

module.exports = router;