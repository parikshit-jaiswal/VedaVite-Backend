import mongoose from "mongoose";

const recoveryProgressSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    painLevel: {
        type: Number,
        required: [true, 'Pain level is required'],
        min: [0, 'Pain level cannot be negative'],
        max: [10, 'Pain level cannot exceed 10']
    },
    mobilityScore: {
        type: Number,
        required: [true, 'Mobility score is required'],
        min: [0, 'Mobility score cannot be negative'],
        max: [100, 'Mobility score cannot exceed 100']
    },
    woundImageUrl: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exercisesCompleted: {
        type: Number,
        default: 0,
        min: 0
    },
    medicationAdherence: {
        type: Boolean,
        default: true
    },
    complications: {
        type: String,
        trim: true
    },
    nextCheckupDate: {
        type: Date
    }
});

export const RecoveryProgress = mongoose.model("RecoveryProgress", recoveryProgressSchema);
