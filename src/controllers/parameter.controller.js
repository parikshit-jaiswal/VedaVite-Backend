import { Vitals } from "../models/vitals.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addParameter = async (req, res) => {
    const { bloodPressure, heartRate, oxygenSaturation, temperature } = req.body;

    if (!bloodPressure || !heartRate || !oxygenSaturation || !temperature) {
        return res.status(400).json(new ApiError(400, null, 'All fields are required'));
    }

    const vitals = await Vitals.create({
        recordedBy: req.user._id,
        bloodPressure,
        heartRate,
        oxygenSaturation,
        temperature,
    });

    if (!vitals) {
        return res.status(400).json(new ApiError(400, null, 'Vitals not added'));
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, { $push: { vitals: vitals._id } });

    if (!updatedUser) {
        return res.status(400).json(new ApiError(400, null, 'User not found'));
    }

    const updatedVitals = await Vitals.findByIdAndUpdate(vitals._id, { $set: { recordedBy: req.user._id } });

    if (!updatedVitals) {
        return res.status(400).json(new ApiError(400, null, 'Vitals not updated'));
    }

    res.status(201).json(new ApiResponse(201, updatedVitals, 'Vitals added successfully'));
}

export { addParameter };


const getParameters = async (req, res) => {

    const vitals = await Vitals.find({ recordedBy: req.user._id });

    if (!vitals) {
        return res.status(404).json(new ApiError(404, 'Vitals not found', null));
    }
    // use mongodb pipeline to get the all vitals
    const allVitals = await Vitals.aggregate([
        { $match: { recordedBy: req.user._id } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: null, allVitals: { $push: "$$ROOT" } } },
        { $project: { _id: 0, allVitals: 1 } }
    ]);

    res.status(200).json(new ApiResponse(200, allVitals, 'Vitals fetched successfully'));
}


export { getParameters };
