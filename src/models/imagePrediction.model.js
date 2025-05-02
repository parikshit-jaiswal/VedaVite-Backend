import mongoose from 'mongoose';

const imagePredictionSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    result: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const ImagePrediction = mongoose.model('ImagePrediction', imagePredictionSchema);

export default ImagePrediction;

