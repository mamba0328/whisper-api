import express from "express";
import { Request, Response } from "express";

import { getUsers, postUsers, putUsers, deleteUsers } from '../controllers/Users';

const router = express.Router();

router.get("/", getUsers);

router.post("/", postUsers);

router.put("/:id", putUsers);

router.delete("/:id", deleteUsers);

module.exports = router;
