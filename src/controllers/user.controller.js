import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
import { Surgery } from "../models/surgery.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens");
    }
};

const googleAuth = asyncHandler(async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        throw new ApiError(400, "idToken is required")
    }
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        let user = await User.findOne({ googleId: sub });
        if (!user) {
            user = await User.create({
                googleId: sub,
                email,
                fullName: name,
                profilePicture: picture,
            });
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        const options = {
            httpOnly: true,
            secure: true,
        };
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, {
                user: {
                    _id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    profilePicture: user.profilePicture,
                }, accessToken, refreshToken
            }, "User logged in successfully"));
    } catch (error) {
        console.error("Error during Google authentication:", error);
        throw new ApiError(500, "Something went wrong during Google authentication");
    }
});

const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, password } = req.body
    if (
        [fullName, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        email: email.toLowerCase()
    })

    if (existedUser) {
        throw new ApiError(409, "User with email already exists")
    }

    const user = await User.create({
        fullName,
        email,
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -createdAt -updatedAt -__v -medicalHistory -surgeries -vitals -recoveryProgress -proms -recoveryPlan"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!(email)) {
        throw new ApiError(400, "email required")
    }

    const user = await User.findOne({
        email
    })

    if (!user) {
        throw new ApiError(404, "User doesn't exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect user credintials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -createdAt -updatedAt -__v -medicalHistory -surgeries -vitals -recoveryProgress -proms -recoveryPlan");

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));

})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));

});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required")
    }

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect current password")
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    return res.status(200).json(new ApiResponse(200, user, "User details fetched successfully"));
});

const fillPersonalInfo = asyncHandler(async (req, res) => {
    const { age, gender, phoneNumber, address, emergencyContactName, emergencyContactPhone } = req.body;

    if (!age || !gender || !phoneNumber || !address || !emergencyContactName || !emergencyContactPhone) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.age = age;
    user.gender = gender;
    user.contactInfo = {
        phone: phoneNumber,
        address: address,
    }
    user.emergencyContact = {
        name: emergencyContactName,
        phone: emergencyContactPhone
    }

    await user.save({ validateBeforeSave: false });
    const updatedUser = await User.findById(user._id).select("-password -refreshToken -createdAt -updatedAt -__v -medicalHistory -surgeries -vitals -recoveryProgress -proms -recoveryPlan");

    return res.status(200).json(new ApiResponse(200, updatedUser, "Personal info filled successfully"));

});

const fillMedicalInfo = asyncHandler(async (req, res) => {
    const { height, weight, bloodGroup, allergies, surgeryType, surgeryDate, doctorName, hospitalName } = req.body;

    if (!height || !weight || !bloodGroup || !surgeryType || !surgeryDate || !doctorName || !hospitalName) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.basicInfo = {
        height: height,
        weight: weight,
        bloodGroup: bloodGroup,
        allergies: allergies || []
    }

    const surgery = await Surgery.create({
        patient: user._id,
        surgeryType: surgeryType,
        date: surgeryDate,
        consultingDoctor: doctorName,
        hospitalName: hospitalName
    })

    await user.save({ validateBeforeSave: false });
    await surgery.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(user._id).select("-password -refreshToken -createdAt -updatedAt -__v -medicalHistory -surgeries -vitals -recoveryProgress -proms -recoveryPlan");
    const updatedSurgery = await Surgery.findById(surgery._id).select("-createdAt -updatedAt -__v -complications ");

    return res.status(200).json(new ApiResponse(200, { user: updatedUser, surgery: updatedSurgery }, "Medical info filled successfully"));
});





export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, googleAuth, fillPersonalInfo, fillMedicalInfo };