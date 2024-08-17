import Job from "../models/jobModel.js";

const getDateFilter = (job_date_posted) => {
    const now = new Date();
    switch (job_date_posted) {
        case "day":
            return { $gte: new Date(now - 24 * 60 * 60 * 1000) }; // 24 hours
        case "week":
            return { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) }; // 7 days
        case "month":
            return { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) }; // 30 days
        default:
            return null;
    }
};

const getJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId)
            .select('job_title job_company job_location job_date_posted job_type job_experience_level job_company_industry job_easy_apply job_company_linkedin_url job_company_logo job_url_direct job_url_linkedin job_description');

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json({ job });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getJobIds = async (req, res) => {
    try {
        const filter = {
            job_active: true,
        };

        var jobs = await Job.find(filter)
            .sort({ createdAt: 1 })
            .select('job_url_linkedin');
        if (!jobs) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json({ jobs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getJobs = async (req, res) => {
    try {
        const user = req.user;
        const {
            search_job_title = null,
            job_location = [],
            job_type = [],
            job_experience_level = [],
            job_function = [],
            job_company_industry = [],
            job_easy_apply = "false",
            // show_jobs_applied = "false",
            show_jobs_viewed = "false",
            job_date_posted = "any",
            tags = []
        } = req.body;

        const filter = {
            job_active: true,
        };

        if (getDateFilter(job_date_posted)) {
            filter.job_date_posted = getDateFilter(job_date_posted)
        }

        if (job_easy_apply === "true") filter.job_easy_apply = true;
        if (job_type.length) filter.job_type = { $in: job_type };
        if (job_experience_level.length) filter.job_experience_level = { $in: job_experience_level };
        if (job_location.length) filter.job_location = { $in: job_location };
        if (job_function.length) filter.job_function = { $in: job_function };
        if (job_company_industry.length) filter.job_company_industry = { $in: job_company_industry };

        const combinedArray = [
            ...user.deleted,
            ...(show_jobs_viewed === "false" ? [...user.applied, ...user.viewed] : [])
            // ...(show_jobs_applied === "false" && show_jobs_viewed === "false" ? [...user.applied, ...user.viewed] : [])
            // ...(show_jobs_applied === "true" && show_jobs_viewed === "false" ? user.viewed.filter(id => !user.applied.includes(id)) : [])
        ];
        if (combinedArray.length) filter._id = { $nin: [...new Set(combinedArray.map(id => id.toString()))] };

        if (search_job_title && search_job_title.length) {
            const searchArray = [search_job_title]
            if (searchArray.length) {
                filter.$or = searchArray.map(word => ({
                    $or: [
                        { job_title: { $regex: word, $options: 'i' } },
                        // { job_description: { $regex: word, $options: 'i' } },
                        { job_company: { $regex: word, $options: 'i' } },
                        { job_location: { $regex: word, $options: 'i' } }
                    ]
                }));
            }
        }

        if (tags.length) {
            filter.$and = tags.map(word => ({
                $and: [
                    { job_title: { $not: { $regex: word, $options: 'i' } } },
                    { job_description: { $not: { $regex: word, $options: 'i' } } },
                    { job_company: { $not: { $regex: word, $options: 'i' } } },
                    { job_location: { $not: { $regex: word, $options: 'i' } } }
                ]
            }));
        }

        var jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .select('job_title job_company job_location job_easy_apply job_company_logo _id')
            .limit(500);

        // if (show_jobs_applied == "true" || show_jobs_viewed == "true") {
        if (show_jobs_viewed == "true") {
            jobs = jobs.map(job => {
                const isApplied = user.applied.some(id => id.equals(job._id));
                const isViewed = user.viewed.some(id => id.equals(job._id));

                return {
                    ...job.toObject(),
                    applied: isApplied,
                    viewed: isViewed,
                    deleted: false
                };
            });
        }

        res.status(200).json({ jobs });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addJob = async (req, res) => {
    try {
        const user = req.user;

        const { job_url_direct, job_url_linkedin, job_title, job_company, job_location, job_type,
            job_experience_level, job_function, job_company_industry, job_description,
            job_company_linkedin_url, job_company_logo, job_easy_apply = "false"
        } = req.body;

        if (user.isAdmin) {
            const jobExists = await Job.findOne({
                $or: [
                    { job_url_direct },
                    { job_url_linkedin },
                    { job_description }
                ]
            });

            if (jobExists) {
                return res.status(409).json({ error: "Job already exists" });
            }

            const newJob = new Job({
                job_url_direct,
                job_url_linkedin,
                job_title,
                job_company,
                job_location,
                job_type,
                job_date_posted: new Date(req.body.job_date_posted),
                job_experience_level,
                job_function,
                job_company_industry,
                job_description,
                job_company_linkedin_url,
                job_company_logo,
                job_easy_apply: job_easy_apply === "true",
                job_active: true
            });

            await newJob.save();

            res.status(201).json({ message: "Job created successfully", newJob });
        } else {
            res.status(401).json({ error: "Unauthorized" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const user = req.user;

        if (user.isAdmin) {
            await Job.findByIdAndDelete(req.body.jobId);
            res.status(200).json({ message: "Job deleted successfully" });
        } else {
            res.status(401).json({ error: "Unauthorized" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



export { getJobs, addJob, getJob, deleteJob, getJobIds };
