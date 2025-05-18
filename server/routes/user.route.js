import express from 'express';
import { getUser, login, logout, register} from '../controllers/user.controller.js';

const router = express.Router();
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/me').get(getUser);

export default router; 