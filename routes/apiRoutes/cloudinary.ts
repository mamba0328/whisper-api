import { Router } from "express";
import { getSignature } from "../../controllers/Cloudinary";

const router = Router();

router.get("/cloudinary/signature", getSignature);

export default router;
