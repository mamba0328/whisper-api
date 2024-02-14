import express from "express";
import userRouter from "./users";
import usersContactsRouter from "./users-contacts";

const router = express.Router();

router.use(usersContactsRouter);

router.use(userRouter);

export default router;
