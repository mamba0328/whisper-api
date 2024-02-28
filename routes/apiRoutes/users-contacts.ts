import express from "express";

import { getUserContacts, postUserContacts, deleteUserContacts } from "../../controllers/UserContacts";

const router = express.Router();

router.get("/user-contacts", getUserContacts);

router.post("/user-contacts", postUserContacts);

router.delete("/user-contacts/:id", deleteUserContacts);

export default router;
