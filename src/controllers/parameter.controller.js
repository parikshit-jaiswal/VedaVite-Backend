import { Vitals } from "../models/vitals.model";
import User from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const addParameter = async (req, res) => {
    const { bloodPressure, heartRate, oxygenSaturation, temperature } = req.body;

    if (!bloodPressure || !heartRate || !oxygenSaturation || !temperature) {
        return res.status(400).json(new ApiError(400, 'All fields are required', null));
    }

    const vitals = await Vitals.create({
        bloodPressure,
        heartRate,
        oxygenSaturation,
        temperature,
    });

    if (!vitals) {
        return res.status(400).json(new ApiError(400, 'Vitals not added', null));
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, { $push: { vitals: vitals._id } });

    if (!updatedUser) {
        return res.status(400).json(new ApiError(400, 'User not found', null));
    }


    res.status(201).json(new ApiResponse(201, 'Vitals added successfully', vitals));
}

export { addParameter };


const getParameters = async (req, res) => {

    const vitals = await Vitals.find({ recordedBy: req.user._id });

    if (!vitals) {
        return res.status(404).json(new ApiError(404, 'Vitals not found', null));
    }

    res.status(200).json(new ApiResponse(200, 'Vitals fetched successfully', vitals));
}

export { getParameters };
