const fs=require('fs');
const path=require('path');
// const products=[];
const Cart=require('./cart');

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
    constructor(id, title, imageUrl, description, price) {
        this.id=id;
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
            if (this.id) {
                const existingProductIndex = products.findIndex(
                  prod => prod.id === this.id
                );
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                  console.log(err);
                });
              } else {
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p,JSON.stringify(products),(err)=>{
                    console.log(err);   
                });
            }
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

    static deleteById(id) {
        getProductsFromFile(products => {
          const product = products.find(prod => prod.id === id);
          const updatedProducts = products.filter(prod => prod.id !== id);
          fs.writeFile(p, JSON.stringify(updatedProducts), err => {
            if (!err) {
              Cart.deleteProduct(id, product.price);
            }
          });
        });
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
    static findById(id, cb) {
        getProductsFromFile(products => {
          const product = products.find(p => p.id === id);
          cb(product);
        });
      }
};