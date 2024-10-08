import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minLength: 6,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isPro: {
        type: Boolean,
        default: false
    },
    emailText: {
        type: String,
        default: ""
    },
    jsonCookies: {
        type: String,
        default: ""
    },
    gmailToken: {
        type: Object,
        default: {}
    },
    viewed: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
        }
    ],
    applied: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
        }
    ],
    deleted: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
        }
    ]
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;