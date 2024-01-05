const fs=require('fs');

const requestHandler=(req,res)=>{
 
    const url=req.url;
    const method=req.method;
    if(url==='/'){
        res.setHeader('Content-Type','text/html');
        res.write('<html>');
        res.write('<head><title>Node JS Server</title></head>');
        // res.write('<body><h1>eVitalRx - Udemy Course of Node JS Server!</h1></body>')
        res.write('<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">SEND</button></form></body>')
        res.write('</html>');
        return res.end();
    }

    if(url==='/message' && method==='POST'){
        const body=[];
        // event listener is triggered whenever a new chunk of data is received in the request body
        req.on('data',(chunk)=>{
            console.log(chunk);
            body.push(chunk);    // we cannot assign values but can push it so it will not change the object
        });   // listen to events

        return req.on('end',()=>{
            const parseBody=Buffer.concat(body).toString();
            const message=parseBody.split('=')[1];
            console.log(parseBody);
            fs.writeFile('message.txt',message,(err)=>{
                res.statusCode=302;
                res.setHeader('Location','/');
                return res.end();
            });
            
        });
        // concatenate all the received data chunks into a single Buffer object.
        // toString() is then called on the Buffer object to convert the binary data into a string, assuming it contains textual data
        
    }
    res.setHeader('Content-Type','text/html');
    res.write('<html>');
    res.write('<head><title>Node JS Server</title></head>');
    res.write('<body><h1>eVitalRx - Udemy Course of Node JS Server!</h1></body>')
    res.write('</html>');
    res.end();
};


// module.exports={
//     handler: requestHandler,
//     someText: 'CODING'
// }; 

// alternative way
// modules.exports.handler=requestHandler;
// modules.exports.someText='CODING';


exports.handler=requestHandler;
exports.someText='CODING';