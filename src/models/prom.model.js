import mongoose from "mongoose";

const promSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    surgery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Surgery',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    symptomScores: {
        pain: {
            type: Number,
            required: true,
            min: 0,
            max: 10
        },
        mobility: {
            type: Number,
            required: true,
            min: 0,
            max: 10
        },
        sleepQuality: {
            type: Number,
            required: true,
            min: 0,
            max: 10
        },
        fatigue: {
            type: Number,
            required: true,
            min: 0,
            max: 10
        },
        mood: {
            type: Number,
            required: true,
            min: 0,
            max: 10
        }
    },
    additionalNotes: {
        type: String,
        trim: true
    },
    alertRaised: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
}, {
    timestamps: true
});

export const PROM = mongoose.model("PROM", promSchema);