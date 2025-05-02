import express from 'express';
import { addParameter, getParameters } from '../controllers/parameter.controller';

const router = express.Router();

router.post('/', addParameter);
router.get('/', getParameters);

export default router;

