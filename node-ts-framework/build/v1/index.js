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
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const validations_1 = require("./library/validations");
const router = express_1.default.Router();
router.use(validateSchema, checkAccess);
/**
 * Validation function for search medicine route
 */
function validateSchema(req, res, next) {
    let schema = joi_1.default.object({
        user_id: joi_1.default.number().integer().required(),
        accesstoken: joi_1.default.string().trim().alphanum().min(32).max(32).required()
    });
    let validationsObj = new validations_1.validations();
    if (!validationsObj.validateRequest(req, res, next, schema)) {
        return false;
    }
}
/**
 * Check Access of a chemist or a Staff
 */
function checkAccess(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Logic to check access
        next();
    });
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
//# sourceMappingURL=index.js.map