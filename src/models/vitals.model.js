import mongoose from "mongoose";

const vitalsSchema = new mongoose.Schema({
    heartRate: {
        type: Number,
        required: [true, 'Heart rate is required'],
        min: [0, 'Heart rate cannot be negative'],
        max: [300, 'Heart rate seems abnormally high']
    },
    bloodPressure: {
        systolic: {
            type: Number,
            required: [true, 'Systolic blood pressure is required'],
            min: [0, 'Systolic blood pressure cannot be negative'],
            max: [300, 'Systolic blood pressure seems abnormally high']
        },
        diastolic: {
            type: Number,
            required: [true, 'Diastolic blood pressure is required'],
            min: [0, 'Diastolic blood pressure cannot be negative'],
            max: [300, 'Diastolic blood pressure seems abnormally high']
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
        min: [93.2, 'Temperature is too low to be safe (possible hypothermia)'],
        max: [108.5, 'Temperature is too high to be safe (possible hyperpyrexia)'],
        validate: {
            validator: function (v) {
                return v >= 93.2 && v <= 108.5;
            },
            message: props => `${props.value}°F is outside realistic human limits.`
        }
    },
    date: {
        type: Date,
        default: Date.now
    },
    day: {
        type: String,
        default: null
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

vitalsSchema.pre('save', function (next) {
    const recordedDate = this.date || new Date();
    this.date = recordedDate.toISOString().split('T')[0];
    this.day = recordedDate.toLocaleDateString('en-US', { weekday: 'long' });
    next();
});

vitalsSchema.index({ date: -1 });

export const Vitals = mongoose.model("Vitals", vitalsSchema);