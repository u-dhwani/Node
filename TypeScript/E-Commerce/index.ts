// index.ts

import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/users'; // Import the userRoutes
import productRoutes from './routes/product'
import cartRoutes from './routes/cart'
const app = express();

// Use body-parser middleware to parse JSON in the request body
app.use(bodyParser.json());

require('dotenv').config();

// Use the userRoutes for the '/user' path
app.use('/user', userRoutes);
app.use('/product',productRoutes);
app.use('/cart',cartRoutes);

app.listen(3007, () => {
  console.log('Server is running on port 3007');
});
