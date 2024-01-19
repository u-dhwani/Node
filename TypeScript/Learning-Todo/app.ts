import express=require('express');
import todosRoutes from './routes/todo';
import bodyParser from 'body-parser';

const app=express();

app.use(bodyParser.json());
app.use(todosRoutes);

app.listen(3000);
