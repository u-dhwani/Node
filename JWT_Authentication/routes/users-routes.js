import express from 'express';
import pool from '../db.js';
import { TokenExpiredError } from 'jsonwebtoken';
const router=express.Router();

router.get('/',async(req,res)=>{
    try{
        const users=await pool.query('SELECT * from users');
        res.json({users:users.rows});
    }
    catch(error){
        res.status(500).json({error:error.message});

    }
})

export default router;