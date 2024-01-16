const {pool} = require('../dbConfig');

const addUser = async (userData) => {
  try {
    const { full_name, email, password, phone_no, address, role } = userData;
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password, phone_no, address, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING full_name, user_id, password, phone_no, address, role',
      [full_name, email, password, phone_no, address, role]
    );
    return {rows:result.rows[0]};
  } catch (error) {
    console.error('Error executing addUser query:', error);
    throw error;
  }
};

const getUserId = async (email) => {
  try {
    const result = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
    return result.rows[0];
  } catch (error) {
    console.error('Error executing getUserId query:', error);
    throw error;
  }
};


const getAllUsers = async () => {
  try {
    const result = await pool.query('SELECT * FROM users');
    return {rows:result.rows};
  } catch (error) {
    console.error('Error executing getAllUsers query:', error);
    throw error;
  }
};

const checkEmailExists = async (email) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return {rows:result.rows};
    } catch (error) {
      console.error('Error executing checkEmailExists query:', error);
      throw error;
    }
  };

  const removeUserByEmail = async (email) => {
    try {
      const result = await pool.query('DELETE FROM users WHERE email = $1 returning *', [email]);
      
      // Check if any rows were deleted
      if (result.rowCount === 0) {
        return { success: false, message: 'User not found or not deleted' };
      }
  
      console.log('Deleted user:', result);
      return { success: true, deletedUser: result.rows[0] };
    } catch (error) {
      console.error('Error executing removeUserByEmail query:', error);
      throw error;
    }
  };

  const updateUserByEmail = async (address, email) => {
    try {
      const result = await pool.query('UPDATE users SET address = $1 WHERE email = $2 RETURNING *', [address, email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing updateUserByEmail query:', error);
      throw error;
    }
  };

//const checkEmailExists="SELECT * FROM users WHERE email = $1";
// const addUser="INSERT INTO users (full_name,email, password,phone_no,address,role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING full_name,user_id, password,phone_no,address,role";
//const getAllUsers="select * from users";
//const removeUserByEmail="Delete from users where email=$1";
//const updateUserByEmail="update users set address=$1 where email=$2";
// const getUserId="select user_id from users where email=$1";

 
module.exports={
    //addUser,    
    checkEmailExists, // done
    removeUserByEmail,  // done
    updateUserByEmail,  // done
    getUserId,  // done
    getAllUsers
}