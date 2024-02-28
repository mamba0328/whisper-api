import express from "express";

import { getUsers, postUsers, putUsers, deleteUsers, updateUserWritesInChat } from "../../controllers/Users";

const router = express.Router();

router.put("/users/writes-in-chat/:id", updateUserWritesInChat);

router.get("/users", getUsers);

router.post("/users", postUsers);

router.put("/users/:id", putUsers);

router.delete("/users/:id", deleteUsers);

export default router;
