import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from 'axios';

const chatBot = asyncHandler(async (req, res) => {
    const { text, behavior = "Medical" } = req.body;

    if (!text) {
        return res.status(400).json(new ApiError(400, "Text field is required"));
    }

    const behaviorInstructions = {
        Medical: "Your name is VedaVite. You are a medical assistant. Only answer questions related to health and medical guidance. Keep responses short and crisp.",
        Casual: "Your name is VedaVite. You are an assistant at a medical company. Avoid vulgar or unrelated questions. Focus on health-related assistance only.",
    };

    const prompt = `${behaviorInstructions[behavior] || "You are a helpful assistant."} ${text}`;

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const postData = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ]
        };

        const response = await axios.post(apiUrl, postData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

        res.status(200).json(new ApiResponse(200, reply, "Response generated successfully"));
    } catch (error) {
        console.error("Gemini API error:", error?.response?.data || error.message);
        res.status(500).json(new ApiError(500, 'Failed to fetch response from Gemini API'));
    }
});

export { chatBot };
