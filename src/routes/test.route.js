import { Router } from "express";
import { testServer } from "../controllers/test.controller.js";

const router = Router();

router.route("/test").get(testServer);

export default router;