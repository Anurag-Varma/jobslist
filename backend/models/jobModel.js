import mongoose from "mongoose";

const jobSchema = mongoose.Schema({
    job_url_direct: {
        type: String,
        required: true,
        unique: true,
    },
    job_url_linkedin: {
        type: String,
        required: true,
        unique: true,
    },
    job_title: {
        type: String,
        required: true
    },
    job_company: {
        type: String,
        required: true
    },
    job_location: {
        type: String,
        required: true
    },
    job_type: {
        type: String,
        required: true
    },
    job_date_posted: {
        type: Date,
        required: true
    },
    job_experience_level: {
        type: String,
        required: true
    },
    job_function: {
        type: String,
        required: true
    },
    job_company_industry: {
        type: String,
        required: true
    },
    job_description: {
        type: String,
        required: true,
        unique: true
    },
    job_company_linkedin_url: {
        type: String,
        required: true
    },
    job_company_logo: {
        type: String,
        required: true
    },
    job_easy_apply: {
        type: Boolean,
        required: true
    },
    job_active: {
        type: Boolean,
        default: true
    },
    error_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

export default Job;