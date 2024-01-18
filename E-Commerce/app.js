const express = require("express")
const { pool } = require("./dbConfig");
const router = require("./routes/cart");
const app = express();
const bodyParser = require('body-parser'); // Import body-parser

// Use body-parser middleware to parse JSON in the request body
app.use(bodyParser.json());

require("dotenv").config();




app.use('/user', require("./routes/users"))
app.use('/products',require("./routes/products"))
app.use('/cart',require("./routes/cart"))
app.use('/order',require("./routes/order"))



app.listen(3006);