import { QueryResult } from 'pg';
import DbConnection, { Condition } from '../dbConfig';

export interface User {
  user_id?: bigint;
  full_name: string;
  email: string;
  password: string;
  phone_no: string;
  address: string;
  role: string;
}

class UserModel extends DbConnection<User> {
  constructor() {
    super('users');
  }

  async createUser(user: User): Promise<{ error: boolean; message: string; data: any }> {
    try {
      const result = await this.addRecord(user);

      if (!result) {
        return {
          error: true,
          message: "Something went wrong while inserting",
          data: null
        };
      } else {
        return {
          error: false,
          message: "User inserted successfully",
          data: result
        };
      }

    } catch (error: any) {
      return {
        error: true,
        message: error.message || "Error creating user",
        data: null
      };
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    try {
      const conditions: Condition[] = [
        { columnName: 'email', value: email }
      ];
      const result=await this.select(conditions);
      //const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if(result){
      return {
        error: false,
        message: "User data retrieved successfully",
        data: result
      };}
      else{
        return {
          error: true,
          message: "Error in retrieving",
          data: null
        };
      }

    } catch (error: any) {
      console.error(`Error fetching user by email ${email}:`, error);
      return {
        error: true,
        message: error.message || "Error fetching user data",
        data: null
      };
    }
  }

  async getAllUsers(pageSize: number, offset: number): Promise<{ error: boolean; message: string; data: any }> {
    try {
      const result: QueryResult<User> = await this.pool.query('SELECT * FROM users LIMIT $1 OFFSET $2', [pageSize, offset]);
      return {
        error: false,
        message: "Users data retrieved successfully",
        data: result.rows
      };
    } catch (error: any) {
      console.error('Error executing getAllUsers query:', error);
      return {
        error: true,
        message: error.message || "Error fetching users data",
        data: null
      };
    }
  }

  async removeUserByEmail(email: string): Promise<{ error: boolean; message: string; data: any }> {
    try {
      const conditions: Condition[] = [
        { columnName: 'email', value: email },
      ];
      const result = await this.deleteRecord(conditions);
      return {
        error: false,
        message: "User removed successfully",
        data: result
      };

    } catch (error: any) {
      console.error('Error executing removeUserByEmail query:', error);
      return {
        error: true,
        message: error.message || "Error removing user",
        data: null
      };
    }
  }

  async updateAddressOfUserByEmail(address: string, email: string): Promise<{ error: boolean; message: string; data: any }> {
    try {
      const result = await this.updateRecord(['email'], [email], { address: address });
      return {
        error: false,
        message: "User updated successfully",
        data: result
      };

    } catch (error: any) {
      console.error('Error executing updateAddressOfUserByEmail query:', error);
      return {
        error: true,
        message: error.message || "Error updating user",
        data: null
      };
    }
  }
}

export default new UserModel();


// import { QueryResult } from 'pg';
// import DbConnection,{Condition} from '../dbConfig';

// export interface User {
//   user_id?:bigint;
//   full_name: string;
//   email: string;
//   password: string;
//   phone_no: string;
//   address: string;
//   role: string;
// }

// class UserModel extends DbConnection<User>{
//   constructor() {
//     super('users');
//   }

//   async createUser(user:User): Promise<any> {
//     try{
//       const result=this.addRecord(user);
//       if(!result){
//         return {
//             error : true,
//             message : "Something went wrong while inserting",
//             data : null
//         }
//     }else{
//         // console.log("Model : " , (await result).data);
//         return {
//             error : false,
//             message : "User inserted successfully",
//             data : result
//         }
//     }
      
//     }
//     catch(error){
//       return { error:"true",
//       message:error,
//       data:null };
//     }
//   }

//   async getUserByEmail(email: string): Promise<any> {
//     try {
//       const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
//       return {
//         error:"false",
//         message:"User Data Successfully",
//         data:result.rows
//       }
      
//     } catch (error) {
//       // If an error occurs during the query
//       console.error(`Error fetching user by email ${email}:`, error);
//       return { error:"true",
//       message:error,
//       data:null };
//     }
//   }

//   async getAllUsers(pageSize: number, offset: number): Promise<QueryResult<User>> {
//     try {
//       const result: QueryResult<User> = await this.pool.query('SELECT * FROM users LIMIT $1 OFFSET $2', [pageSize, offset]);
//       return result;
//     } catch (error) {
//       console.error('Error executing getAllUsers query:', error);
//       throw error;
//     }
//   }

//   async removeUserByEmail(email: string): Promise<User> {
//     try {
//       //const result = await this.pool.query('DELETE FROM users WHERE email = $1 returning *', [email]);
//       const conditions: Condition[] = [
//         { columnName: 'email', value: email },];
//       const result=this.deleteRecord(conditions);
//       return result;
     
//     } catch (error) {
//       console.error('Error executing removeUserByEmail query:', error);
//       throw error;
//     }
//   }

//   async updateAddressOfUserByEmail(address: string, email: string): Promise<any> {
//     try {
//       const result=this.updateRecord(['email'],[email],{address:address}); 
//       return result;
//     } catch (error) {
//       console.error('Error executing updateAddressOfUserByEmail query:', error);
//       throw error;
//     }
//   }
// }

// export default new UserModel();

