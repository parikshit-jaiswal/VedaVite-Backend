import mongoose from "mongoose";

const surgerySchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    surgeryType: {
        type: String,
        enum: ['General Surgery', 'Orthopedic Surgery', 'Cardiothoracic Surgery', 'Neurosurgery', 'Urology', 'Ophthalmology', 'Otolaryngology (ENT)', 'Vascular Surgery', 'Gynecological Surgery', 'Minimally Invasive Surgery', 'Robotic Surgery', 'Open Surgery', 'Microsurgery', 'Bariatric Surgery'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Surgery date is required']
    },
    hospitalName: {
        type: String,
        trim: true
    },
    consultingDoctor: {
        type: String,
        trim: true
    },
    recoveryPlan: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    complications: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

export const Surgery = mongoose.model("Surgery", surgerySchema);


