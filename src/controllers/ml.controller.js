import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import ImagePrediction from "../models/imagePrediction.model.js";



const scanImage = asyncHandler(async (req, res) => {
    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
        throw new ApiError(400, "Image file is missing");
    }

    const image = await uploadOnCloudinary(imageLocalPath);

    if (!image.url) {
        throw new ApiError(400, "Error while uploading image");
    }

    const response = await axios.post("https://skin-des.onrender.com/detect_skin", {
        image_url: image.url,
    },
        {
            headers: {
                "Content-Type": "application/json",
            }
        }
    );

    const prediction = await ImagePrediction.create({
        patient: req.user._id,
        image: image.url,
        result: response.data.skin_percentage,
        createdAt: new Date(),
    });

    if (!prediction) {
        throw new ApiError(400, "Error while scanning image");
    }
    if (prediction.result < 20) {
        return res.json(new ApiResponse(200, prediction, "Your wound is healing properly"));
    }
    if (prediction.result < 30) {
        return res.json(new ApiResponse(200, prediction, "You are safe, but please consult a doctor"));
    }
    if (prediction.result > 30 && prediction.result < 40) {
        return res.json(new ApiResponse(200, prediction, "Skin infection chances are low, but please consult a doctor"));
    }
    if (prediction.result > 40) {
        return res.json(new ApiResponse(200, prediction, "Skin infection chances are high, please consult a doctor"));
    }
    res.json(new ApiResponse(200, prediction, "Image scanned successfully"));
});

export { scanImage };