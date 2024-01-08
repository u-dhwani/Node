const express=require('express');
const router=express.Router();
const db=require('../config/database');
const Gig=require('../models/gig');


router.get('/',(req,res)=>
    Gig.findAll()
        .then(gigs=>{
            console.log(gigs)
            res.sendStatus(200);
        })
        .catch(err=>console.log(err))
    );

// add
router.get('/add',(req,res)=>{
    const data={
        title:'Looking for Node developer',
        technologies:'node,express,postgres',
        budget:'5LPA',
        description:
    }
})

module.exports=router;