import express from 'express';
import { addParameter, getParameters } from '../controllers/parameter.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyJWT, addParameter);
router.get('/', verifyJWT, getParameters);

export default router;

