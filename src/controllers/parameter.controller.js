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

const getHeartRate = async (req, res) => {

    // get heart rate of the user only in the form of array of object which contains date day and haeart rate use mongodb aggregation
    const heartRate = await Vitals.aggregate([
        { $match: { recordedBy: req.user._id } },
        {
            $project: {
                _id: 0,
                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                day: "$day",
                heartRate: "$heartRate"
            }
        },
        { $sort: { date: -1 } }
    ]);

    if (!heartRate) {
        return res.status(404).json(new ApiError(404, 'Heart rate not found', null));
    }

    res.status(200).json(new ApiResponse(200, heartRate, 'Heart rate fetched successfully'));
}

const getBloodPressure = async (req, res) => {
    const bloodPressure = await Vitals.aggregate([
        { $match: { recordedBy: req.user._id } },
        {
            $project: {
                _id: 0,
                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                day: "$day",
                bloodPressure: "$bloodPressure"
            }
        },
        { $sort: { date: -1 } }
    ]);

    if (!bloodPressure) {
        return res.status(404).json(new ApiError(404, 'Blood pressure not found', null));
    }

    res.status(200).json(new ApiResponse(200, bloodPressure, 'Blood pressure fetched successfully'));
}

const getOxygenSaturation = async (req, res) => {
    const oxygenSaturation = await Vitals.aggregate([
        { $match: { recordedBy: req.user._id } },
        {
            $project: {
                _id: 0,
                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                day: "$day",
                oxygenSaturation: "$oxygenSaturation"
            }
        },
        { $sort: { date: -1 } }
    ]);

    if (!oxygenSaturation) {
        return res.status(404).json(new ApiError(404, 'Oxygen saturation not found', null));
    }

    res.status(200).json(new ApiResponse(200, oxygenSaturation, 'Oxygen saturation fetched successfully'));
}

const getTemperature = async (req, res) => {
    const temperature = await Vitals.aggregate([
        { $match: { recordedBy: req.user._id } },
        {
            $project: {
                _id: 0,
                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                day: "$day",
                temperature: "$temperature"
            }
        },
        { $sort: { date: -1 } }
    ]);

    if (!temperature) {
        return res.status(404).json(new ApiError(404, 'Temperature not found', null));
    }

    res.status(200).json(new ApiResponse(200, temperature, 'Temperature fetched successfully'));
}


export { getParameters, getHeartRate, getBloodPressure, getOxygenSaturation, getTemperature };
