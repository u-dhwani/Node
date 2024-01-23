"use strict";
// index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const users_1 = __importDefault(require("./routes/users")); // Import the userRoutes
const product_1 = __importDefault(require("./routes/product"));
const cart_1 = __importDefault(require("./routes/cart"));
const app = (0, express_1.default)();
// Use body-parser middleware to parse JSON in the request body
app.use(body_parser_1.default.json());
require('dotenv').config();
// Use the userRoutes for the '/user' path
app.use('/user', users_1.default);
app.use('/product', product_1.default);
app.use('/cart', cart_1.default);
app.listen(3007, () => {
    console.log('Server is running on port 3007');
});
