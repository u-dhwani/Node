// const express=require('express');
// const app=express();
// const auth=require('./routes/auth')


// app.use(express.json());
// app.use("/auth",auth);
// app.get("/",(req,res)=>{
//     res.send("Dhwani Upadhyay");
// })

const express = require("express")

const app = express();

app.use(express.json())

app.use('/auth', require("./routes/auth"))
app.use('/posts', require("./routes/post"))


app.listen(3006);