import mongoose from "mongoose";

const promSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    day: {
        type: String,
        default: function () {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[this.date.getDay()];
        }
    },
    symptomScores: {
        pain: {
            type: Number,
            required: true,
            min: 0,
            max: 5
        },
        mobility: {
            type: Number,
            required: true,
            min: 0,
            max: 5
        },
        sleepQuality: {
            type: Number,
            required: true,
            min: 0,
            max: 5
        },
        fatigue: {
            type: Number,
            required: true,
            min: 0,
            max: 5
        },
        mood: {
            type: Number,
            required: true,
            min: 0,
            max: 5
        }
    },
    alertRaised: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

export const Prom = mongoose.model("Prom", promSchema);