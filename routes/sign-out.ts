import express from "express";
import { signOut } from "../controllers/SignOut";
const router = express.Router();

router.post("/", signOut);

export default router;
