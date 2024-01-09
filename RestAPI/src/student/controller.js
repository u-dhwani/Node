const pool =require('../../db');
const queries=require('./queries');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const getStudents=(req,res)=>{
    pool.query(queries.getStudents,(error,results)=>{
        if(error)   throw error;
        res.status(200).json(results.rows); // OK STATUS
    });
};

const addStudent=(req,res)=>{
    const{name,email,age,dob,password}=req.body;
    
    pool.query(queries.checkEmailExists,[email],(error,results)=>{
        if(results.rows.length){
            res.send("E-Mail ID already exists...");
        }
        else{
    //         pool.query(queries.addStudent,[name,email,age,dob],(error,results)=>{
    //             if(error)   throw error;
    //             res.status(201).send("Student Created Successfully!");
    //         })
    // }
    // });
    bcrypt.hash(password, saltRounds, (hashError, password) => {
        if (hashError) throw hashError;

        pool.query(queries.addStudent, [name, email, age, dob, password], (addError, addResults) => {
            if (addError) throw addError;
            res.status(201).send("Student Created Successfully!");
        });
    });
}
});
};

const getStudentById=(req,res)=>{
    const id=parseInt(req.params.id);

    pool.query(queries.getStudentById,[id],(error,results)=>{
        if(error)   throw error;
        res.status(200).json(results.rows); // OK STATUS
    });
};

const removeStudent=(req,res)=>{
    const id=parseInt(req.params.id);

    pool.query(queries.getStudentById,[id],(error,results)=>{
        const noStudentFound=!results.rows.length;
        if(noStudentFound){
            res.send("Student does not exist in the database");
        }
        pool.query(queries.removeStudent,[id],(error,results)=>{
            if(error) throw error;
            res.status(200).send("Student removed Successfully!!!");
        })
    });
};

const updateStudent=(req,res)=>{
    const id=parseInt(req.params.id);
    const {name}=req.body;
    pool.query(queries.getStudentById,[id],(error,results)=>{
        const noStudentFound=!results.rows.length;
        if(noStudentFound){
            res.send("Student does not exist in the database");
        }
        pool.query(queries.updateStudent,[name,id],(error,results)=>{
            if(error) throw error;
            res.status(200).send("Student Updated Successfully!!!");
        });
    });
};


const login = (req, res) => {
    
    // const { email, password } = req.body;

    // pool.query(queries.checkEmailExists, [email], async (error, results) => {
    //     if (!results.rows.length) {
    //         res.status(401).send("Invalid email or password");
    //     } else {
    //         const user = results.rows[0];
    //         const match = await bcrypt.compare(password, user.password);

    //         if (match) {
    //             res.status(200).json({ message: 'Login successful', user });
    //         } else {
    //             res.status(401).send("Invalid email or password");
    //         }
    //     }
    // });
//};
    
    const { email, password } = req.body;
    console.log(email);
    try {
    const result =  pool.query('SELECT * FROM students WHERE email = $1', [email]);
  //  console.log(email);
    const user = result.rows[0];
    console.log(result.rows);
        if (user &&  bcrypt.compare(password, user.password)) {
            req.session.user = user;
            res.json({ success: true, message: 'Login successful.' });
        }
        else {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } 
    catch (err) { 
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};





// router.post('/login', async (req, res) => {
//     const { username, password } = req.body;
  
//     try {
//       const result = await pool.query('SELECT * FROM login WHERE username = $1', [username]);
//       const user = result.rows[0];
  
//       if (user && await bcrypt.compare(password, user.password)) {
//         req.session.user = user;
//         res.json({ success: true, message: 'Login successful.' });
//       } else {
//         res.status(401).json({ success: false, message: 'Invalid credentials.' });
//       }
//     } catch (err) { 
//       console.error(err);
//       res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
//   });

module.exports={
    getStudents,
    addStudent,
    getStudentById,
    removeStudent,
    updateStudent,
    login,
};

