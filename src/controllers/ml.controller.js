import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";



const scanImage = asyncHandler(async (req, res) => {
    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
        throw new ApiError(400, "Image file is missing");
    }

    const image = await uploadOnCloudinary(imageLocalPath);

    if (!image.url) {
        throw new ApiError(400, "Error while uploading image");
    }
    console.log(!image.url)

    const response = await axios.post("https://skin-des.onrender.com/detect_skin", {
        image_url: image.url,
    },
        {
            headers: {
                "Content-Type": "application/json",
            }
        }
    );

    res.json(new ApiResponse(200, response.data, "Image scanned successfully"));

});

export { scanImage };