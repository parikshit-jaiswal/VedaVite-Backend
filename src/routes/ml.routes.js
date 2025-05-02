import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { scanImage } from "../controllers/ml.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/scan-image").post(verifyJWT, upload.single("image"), scanImage);

export default router;


