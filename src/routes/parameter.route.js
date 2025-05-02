import express from 'express';
import { addParameter, getHeartRate, getParameters, getBloodPressure, getOxygenSaturation, getTemperature } from '../controllers/parameter.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyJWT, addParameter);
router.get('/', verifyJWT, getParameters);
router.get('/heart-rate', verifyJWT, getHeartRate);
router.get('/blood-pressure', verifyJWT, getBloodPressure);
router.get('/oxygen-saturation', verifyJWT, getOxygenSaturation);
router.get('/temperature', verifyJWT, getTemperature);

export default router;

