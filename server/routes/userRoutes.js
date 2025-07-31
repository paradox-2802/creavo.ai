import express from 'express';
import { auth } from '../middlewares/auth.js';
import { getPublishedCreations, getUserCreations, toggleLikeCreation } from '../controllers/userController.js';


const userRouter = express.Router();

userRouter.get('/get-user-creations', auth, getUserCreations);
userRouter.get('/get-published-creations', auth, getPublishedCreations);
userRouter.post('/toggle-Like-Creation', auth, toggleLikeCreation);

export default userRouter;