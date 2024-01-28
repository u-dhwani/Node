// routes/users.ts

import { Router } from 'express';

import {
    validateSignupMiddleware,
    validateLoginMiddleware,
    validateDeleteByEmailMiddleware,
    validateUpdateProfileMiddleware,
  } from '../validations/users';
import { checkAuth,role_access } from '../middleware/checkAuth'; // Import checkAuth
import controllers from '../controller/users';

const authController = new controllers.AuthController();
const userController = new controllers.UserController();

const router = Router();

router.post('/signup', validateSignupMiddleware,authController.signup);
router.post('/login', validateLoginMiddleware,authController.login);
router.get('/all',checkAuth,userController.getUsers);
router.delete('/deleteUser',checkAuth,validateDeleteByEmailMiddleware,role_access('admin'),userController.deleteByEmail);
router.put('/update',checkAuth,validateUpdateProfileMiddleware,role_access('user'),userController.updateAddressOfUserByEmail);


export default router;
