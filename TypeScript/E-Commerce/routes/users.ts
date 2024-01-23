// routes/users.ts

import { Router } from 'express';


import { checkAuth,role_access } from '../middleware/checkAuth'; // Import checkAuth
import controllers from '../controller/users';

const authController = new controllers.AuthController();
const userController = new controllers.UserController();

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/all',checkAuth,userController.getUsers);
router.delete('/deleteUser',checkAuth,role_access('admin'),userController.deleteByEmail);
router.put('/update',checkAuth,role_access('user'),userController.updateAddressOfUserByEmail);


export default router;
