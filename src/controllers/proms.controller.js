import { Prom } from '../models/prom.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { Vitals } from '../models/vitals.model.js';



const addProm = async (req, res) => {
    const { symptomScores } = req.body;

    const prom = await Prom.create({ patient: req.user._id, symptomScores });
    if (!prom) {
        throw new ApiError(400, 'Failed to create PROM');
    }

    const structuredProm = {
        _id: prom._id,
        date: prom.date,
        symptomScores: prom.symptomScores
    }

    res.status(201).json(new ApiResponse(201, structuredProm, 'PROM created successfully'));
}

const getProms = async (req, res) => {
    const proms = await Prom.find({ patient: req.user._id });
    if (!proms) {
        throw new ApiError(404, 'No PROMs found');
    }

    const structuredProms = proms.map(prom => ({
        _id: prom._id,
        date: prom.date,
        symptomScores: prom.symptomScores
    }));

    res.status(200).json(new ApiResponse(200, structuredProms, 'PROMs fetched successfully'));
}



const getHealthScores = async (req, res) => {
    try {
        // Get all PROMs for the user
        const proms = await Prom.find({ patient: req.user._id })
            .sort({ createdAt: -1 });

        if (!proms || proms.length === 0) {
            throw new ApiError(404, "No PROM data found");
        }

        // Calculate health scores for each PROM entry
        const healthScores = proms.map(prom => {
            // Calculate average PROM score
            const avgPromScore = (
                prom.symptomScores.pain +
                prom.symptomScores.mobility +
                prom.symptomScores.sleepQuality +
                prom.symptomScores.fatigue +
                prom.symptomScores.mood
            ) / 5;

            // Convert to 0-100 scale (original is 0-5)
            const healthScore = (avgPromScore / 5) * 100;

            return {
                date: prom.date,
                day: prom.day,
                score: Math.round(healthScore)
            };
        });

        res.status(200).json(new ApiResponse(200, healthScores, 'Health scores calculated successfully'));

    } catch (error) {
        throw new ApiError(500, error?.message || "Error calculating health scores");
    }
}


export { addProm, getProms, getHealthScores };
