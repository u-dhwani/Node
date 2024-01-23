"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkAuth_1 = require("../middleware/checkAuth"); // Import checkAuth
const product_1 = __importDefault(require("../controller/product"));
const router = (0, express_1.Router)();
router.post('/add', checkAuth_1.checkAuth, (0, checkAuth_1.role_access)('seller'), product_1.default.addProducts); // done
router.get('/all', checkAuth_1.checkAuth, product_1.default.getAllProducts); // done
router.get('/:id', checkAuth_1.checkAuth, product_1.default.getProductById); // done
router.get('/category/:category', checkAuth_1.checkAuth, product_1.default.getProductByCategory); // done
router.delete('/delete/:id', checkAuth_1.checkAuth, (0, checkAuth_1.role_access)('seller'), product_1.default.deleteProduct); // done
router.put('/update', checkAuth_1.checkAuth, (0, checkAuth_1.role_access)('seller'), product_1.default.updateProductsByDiscountQuantity); // done
router.get('/finalprice/:id', checkAuth_1.checkAuth, product_1.default.finalPrice); // done
exports.default = router;
