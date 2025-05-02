import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password hash is required']
        },
        role: {
            type: String,
            enum: ['patient', 'provider', 'admin'],
            default: 'patient'
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        profilePicture: {
            type: String,
            default: 'http://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI='
        },
        age: {
            type: Number,
            min: [0, 'Age cannot be negative']
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            default: 'Other'
        },
        contactInfo: {
            phone: {
                type: String,
                trim: true,
                minlength: [10, 'Phone number must be at least 10 digits']
            },
            address: {
                type: String,
                trim: true
            },
        },
        emergencyContact: {
            name: {
                type: String,
                trim: true
            },
            phone: {
                type: String,
                trim: true,
                minlength: [10, 'Emergency number must be at least 10 digits']
            }
        },
        basicInfo: {
            height: {
                type: Number,
                min: 0,
                max: 300,
                default: 0
            },
            weight: {
                type: Number,
                min: 0,
                max: 300,
                default: 0
            },
            bloodGroup: {
                type: String,
                enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
                default: null
            },
            allergies: {
                type: [String],
                default: []
            }
        },
        medicalHistory: {
            type: [String],
            default: []
        },
        surgeries: [{
            type: Schema.Types.ObjectId,
            ref: 'Surgery'
        }],
        doctorAssigned: {
            type: Schema.Types.ObjectId,
            ref: 'Doctor'
        },
        vitals: [{
            type: Schema.Types.ObjectId,
            ref: 'Vitals'
        }],
        recoveryProgress: [{
            type: Schema.Types.ObjectId,
            ref: 'RecoveryProgress'
        }],
        wearableConnected: {
            type: Boolean,
            default: false
        },
        proms: [{
            type: Schema.Types.ObjectId,
            ref: 'PROM'
        }],
        refreshToken: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            immutable: true
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    const accessToken = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            contactNumber: this.contactNumber,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )

    return accessToken;
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)
