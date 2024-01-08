const express=require('express');
const path=require('path');
const bodyparser=require('body-parser');
const exphbs=require('express-handlebars');
const app=express();
const db=require('./config/database');
db.authenticate()
    .then(()=>console.log('Database connected'))
    .catch(err=>console.log('Error:'+err))


app.get('/',(req,res)=> res.send('INDEX'));

app.use('/gigs',require('./routes/gigs'));

app.listen(3002);