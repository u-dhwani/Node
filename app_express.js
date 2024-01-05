const path=require('path');
const express = require('express');
const bodyParser=require('body-parser');
// The body-parser middleware is used to parse the body of incoming HTTP requests.

const errorController = require('./controllers/error');


const app = express();
app.set('view engine','ejs');   //  template engine for Node.js that simplifies the process of writing HTML
app.set('views','views');

//const adminData=require('./routes/admin');
const adminRoutes=require('./routes/admin');
const shopRoutes=require('./routes/shop');


app.use(bodyParser.urlencoded({extended:false})); // parse incoming HTTP request bodies. Specifically, it is configured to handle URL-encoded data
app.use(express.static(path.join(__dirname,'public')));


app.use('/admin',adminRoutes);
app.use(shopRoutes);

//app.use('/admin',adminRoutes);
// app.use('/admin',adminData.routes)
// app.use((req,res,next)=>{
//   res.status(404).sendFile(path.join(__dirname,'views','404.html'));
// });  // 404 PAGE

app.use(errorController.get404);

// app.use('/', (req, res, next) => {
//     console.log('This always runs!');
//     next();
// });

app.listen(3001);
