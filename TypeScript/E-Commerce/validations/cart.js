"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProductId = exports.validateUpdateProductQuantity = exports.productIdSchema = exports.updateProductQuantitySchema = void 0;
const Joi = __importStar(require("joi"));
exports.updateProductQuantitySchema = Joi.object({
    prod_id: Joi.number().required(),
    quantity: Joi.number().required(),
});
exports.productIdSchema = Joi.object({
    prod_id: Joi.number().required(),
});
function validateUpdateProductQuantity(data) {
    const result = exports.updateProductQuantitySchema.validate(data);
    if (result.error) {
        // If there is an error in validation, return an object with an 'error' property
        return { error: result.error };
    }
    // If validation is successful, return the validated value
    return { value: result.value };
}
exports.validateUpdateProductQuantity = validateUpdateProductQuantity;
function validateProductId(data) {
    const result = exports.productIdSchema.validate(data);
    if (result.error) {
        // If there is an error in validation, return an object with an 'error' property
        return { error: result.error };
    }
    // If validation is successful, return the validated value
    return { value: result.value };
}
exports.validateProductId = validateProductId;
;
