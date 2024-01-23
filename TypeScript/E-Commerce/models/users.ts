import pool from '../dbConfig';
import { QueryResult } from 'pg';

export interface User {
  user_id?:bigint;
  full_name: string;
  email: string;
  password: string;
  phone_no: string;
  address: string;
  role: string;
}

class UserModel {
  async createUser(data: any): Promise<any> {
    const { full_name, email, password, phone_no, address, role } = data;

    const result=await pool.query(
      'INSERT INTO users (full_name, email, password, phone_no, address, role) VALUES ($1, $2, $3, $4, $5, $6) returning user_id',
      [full_name, email, password, phone_no, address, role]
    );
    return result.rows[0];
  }

  async getUserByEmail(email: string): Promise<any> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async getAllUsers(pageSize: number, offset: number): Promise<QueryResult<User>> {
    try {
      const result: QueryResult<User> = await pool.query('SELECT * FROM users LIMIT $1 OFFSET $2', [pageSize, offset]);
      return result;
    } catch (error) {
      console.error('Error executing getAllUsers query:', error);
      throw error;
    }
  }

  async removeUserByEmail(email: string): Promise<{ success: boolean; message?: string; deletedUser?: any }> {
    try {
      const result = await pool.query('DELETE FROM users WHERE email = $1 returning *', [email]);

      if (result.rowCount === 0) {
        return { success: false, message: 'User not found or not deleted' };
      }

      console.log('Deleted user:', result);
      return { success: true, deletedUser: result.rows[0] };
    } catch (error) {
      console.error('Error executing removeUserByEmail query:', error);
      throw error;
    }
  }

  async updateAddressOfUserByEmail(address: string, email: string): Promise<any> {
    try {
      const result = await pool.query('UPDATE users SET address = $1 WHERE email = $2', [address, email]);
      return result;
    } catch (error) {
      console.error('Error executing updateAddressOfUserByEmail query:', error);
      throw error;
    }
  }
}

export default new UserModel();

