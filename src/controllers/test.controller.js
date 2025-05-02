import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const testServer = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, "Test route is working fine")
    );
})

export { testServer };