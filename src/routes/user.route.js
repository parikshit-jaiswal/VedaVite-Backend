import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, googleAuth, fillPersonalInfo, fillMedicalInfo } from '../controllers/user.controller.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/google-login").post(googleAuth);
router.route("/get-user").get(verifyJWT, getCurrentUser);
router.route("/fill-personal-info").post(verifyJWT, fillPersonalInfo);
router.route("/fill-medical-info").post(verifyJWT, fillMedicalInfo);

// secure route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(verifyJWT, refreshAccessToken);

export default router;