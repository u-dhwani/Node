const getStudents="select * from students";
const getStudentById="SELECT * from students where id=$1";
const checkEmailExists="SELECT s from students s where s.email=$1";
const addStudent="Insert into students (name,email,age,dob) values ($1,$2,$3,$4)";
const removeStudent="Delete from students where id=$1";
const updateStudent="update students set name =$1 where id=$2";

module.exports={
    getStudents,
    getStudentById,
    checkEmailExists,
    addStudent,
    removeStudent,
    updateStudent
};
