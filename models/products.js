const fs=require('fs');
const path=require('path');
const products=[];
const p=path.join(process.mainModule.filename,'../','data','products.json');
const getProductsFromFile=cb=>{
        fs.readFile(p,(err,fileContent)=>{
            if(err){
                cb([]); 
            }
            else{
                cb(JSON.parse(fileContent));    
            }
            
    });
};

module.exports=class Product{
    constructor(title, imageUrl, description, price) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
      }
    // constructor(t){
    //     this.title=t;
    // }
    // function
    save(){
        // const p=path.join(process.mainModule.filename,'../','data','products.json');
        getProductsFromFile(products => { 
            products.push(this);
            fs.writeFile(p,JSON.stringify(products),(err)=>{
                console.log(err);   
            });
        } );
        // fs.readFile(p,(err,fileContent)=>{});
       
       // fs.readFile(p,(err,fileContent)=>{
            // let products=[];
            // if(!err){
            //     products=JSON.parse(fileContent);
            //     // helper object in vanilla node js
            // }
            
       // });

    }

    // storing data in file
    static fetchAll(cb){
        getProductsFromFile(cb);
        // const p=path.join(process.mainModule.filename,'../','data','products.json');
        // fs.readFile(p,(err,fileContent)=>{
        //     if(err){
        //         cb([]); 
        //     }
        //     cb(JSON.parse(fileContent));
        // });
       // return products;
    }
};