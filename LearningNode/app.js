// Understanding request - response
// Headers are metadata that we get when we run the server
// / is the url , GET is the method


const http=require('http');
const routes=require('./routes');
// function rqListener(req,res){   // request,response

// }
console.log(routes.someText);
const server=http.createServer(routes.handler);

    // console.log(req);
    // console.log(req.url,req.method,req.headers);
    // process.exit();     // quit the process - don't need to do bcz we want the html page
    
server.listen(3000);    //port number

// single javascript thread -> fs -> send to worker pool - > different threads
// event loop -> started by node js and handle callbacks by order(setTimeout, setInterval)
// event loop - > timers, pending callbacks, poll, check, close callbacks, process.exit


