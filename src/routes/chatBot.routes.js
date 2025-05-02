import { Router } from "express";
import { chatBot } from "../controllers/chatBot.controller.js";

const router = Router();

router.route("/").post(chatBot);

export default router;