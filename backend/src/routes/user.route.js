import express from "express";
import { checkAuth, login, logout, signup } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const userRouter = express.Router();

userRouter.post('/signup', signup)
userRouter.post('/login', login)
userRouter.post('/logout', logout)
userRouter.get('/check', protectRoute, checkAuth)

export default userRouter;
