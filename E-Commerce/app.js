const express = require("express")
const { pool } = require("./dbConfig");
const app = express();
// app.use(bodyParser.json());

require("dotenv").config();

app.use(express.json());

app.use('/user', require("./routes/users"))
app.use('/products',require("./routes/products"))
app.use('/cart',require("./routes/cart"))


app.listen(3006);