import { Router } from 'express';
import { addProm, getProms, getHealthScores } from '../controllers/proms.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyJWT, addProm);
router.get('/', verifyJWT, getProms);
router.get('/health-scores', verifyJWT, getHealthScores);

export default router;
