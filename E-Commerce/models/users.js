const {pool} = require('../dbConfig');

const addUser = async (userData) => {
  try {
    const { full_name, email, password, phone_no, address, role } = userData;
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password, phone_no, address, role) VALUES ($1, $2, $3, $4, $5, $6)',
      [full_name, email, password, phone_no, address, role]);
    return {rows:result.rows[0]};
  } catch (error) {
    console.error('Error executing addUser query:', error);
    throw error;
  }
};




const getAllUsers = async (pageSize, offset) => {
  try {
    const result = await pool.query('SELECT * FROM users LIMIT $1 OFFSET $2', [pageSize, offset]);
    return result;
  } catch (error) {
    console.error('Error executing getAllUsers query:', error);
    throw error;
  }
};



  const user_IdDetails = async (email) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing user_IdDetails query:', error);
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

  const updateAddressOfUserByEmail = async (address, email) => {
    try {
      const result = await pool.query('UPDATE users SET address = $1 WHERE email = $2 ', [address, email]);
      return result;
    } catch (error) {
      console.error('Error executing updateUserByEmail query:', error);
      throw error;
    }
  };

  const checkUserRole = async (userId, role) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE user_id = $1 AND role = $2', [userId, role]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error checking if user with ID ${userId} is a ${role}:`, error);
      throw error;
    }
  };


//const checkEmailExists="SELECT * FROM users WHERE email = $1";
// const addUser="INSERT INTO users (full_name,email, password,phone_no,address,role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING full_name,user_id, password,phone_no,address,role";
//const getAllUsers="select * from users";
//const removeUserByEmail="Delete from users where email=$1";
//const updateUserByEmail="update users set address=$1 where email=$2";
// const user_IdDetails="select user_id from users where email=$1";

 
module.exports={
    addUser,    
    removeUserByEmail,  // done
    updateAddressOfUserByEmail,  // done
    user_IdDetails,  // done
    getAllUsers,
    checkUserRole
}