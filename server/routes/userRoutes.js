import express from 'express';
import { auth } from '../middlewares/auth.js';
import { getPublishedCreations, getUserCreations, toggleLikeCreation } from '../controllers/userController.js';


const userRouter = express.Router();

// User specific routes
userRouter.get('/get-user-creations', auth, getUserCreations);

// Public routes (though currently protected by auth middleware in this setup)
userRouter.get('/get-published-creations', auth, getPublishedCreations);

// Interaction routes
userRouter.post('/toggle-Like-Creation', auth, toggleLikeCreation);

export default userRouter;