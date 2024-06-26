import express from 'express';
import {updateUser,deleteUser,getUserListing} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
const router = express.Router();

router.post('/update/:id',verifyToken,updateUser);
router.delete('/delete/:id',verifyToken,deleteUser);
router.get('/listing/:id',verifyToken,getUserListing);
export default router;