import mongoose from "mongoose";

const vitalsSchema = new mongoose.Schema({
    heartRate: {
        type: Number,
        required: [true, 'Heart rate is required'],
        min: [0, 'Heart rate cannot be negative'],
        max: [300, 'Heart rate seems abnormally high']
    },
    bloodPressure: {
        type: String,
        required: [true, 'Blood pressure is required'],
        validate: {
            validator: function (v) {
                return /^\d{2,3}\/\d{2,3}$/.test(v);
            },
            message: props => `${props.value} is not a valid blood pressure format! Use format like "120/80"`
        }
    },
    oxygenSaturation: {
        type: Number,
        required: [true, 'Oxygen saturation is required'],
        min: [0, 'Oxygen saturation cannot be negative'],
        max: [100, 'Oxygen saturation cannot exceed 100%']
    },
    temperature: {
        type: Number,
        required: [true, 'Temperature is required'],
        min: [30, 'Temperature seems abnormally low'],
        max: [45, 'Temperature seems abnormally high']
    },
    recordedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    notes: {
        type: String,
        trim: true
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

export const Vitals = mongoose.model("Vitals", vitalsSchema);