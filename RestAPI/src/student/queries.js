const getStudents="select * from students";
const getStudentById="SELECT * from students where id=$1";
const checkEmailExists="SELECT * from students s where s.email=$1";
const addStudent="INSERT INTO students (name, email, age, dob, password) VALUES ($1, $2, $3, $4, $5)";
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
