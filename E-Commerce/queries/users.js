const addUser="INSERT INTO users (full_name,email, password,phone_no,address,role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING full_name,email, password,phone_no,address,role";
const checkEmailExists="SELECT * FROM users WHERE email = $1";
const getUsers="select * from users";
const removeUserByEmail="Delete from users where email=$1";
const updateUserByEmail="update users set full_name=$1 where email=$2";


module.exports={
    addUser,
    checkEmailExists,
    getUsers,
    removeUserByEmail,
    updateUserByEmail,

}