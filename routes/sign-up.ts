import express from "express";
import { postUsers } from "../controllers/Users";

const router = express.Router();

router.post("/", postUsers);

export default router;
