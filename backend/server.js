import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cors from 'cors';

dotenv.config();

connectDB();

const corsOptions = {
    origin: ["https://www.jobslist.live", "https://jobslist.live",
        // "https://main.d16idowmmspc1k.amplifyapp.com",
        // "http://localhost:3000", 
        // "173.245.48.0/20",
        // "103.21.244.0/22",
        // "103.22.200.0/22",
        // "103.31.4.0/22",
        // "141.101.64.0/18",
        // "108.162.192.0/18",
        // "190.93.240.0/20",
        // "188.114.96.0/20",
        // "197.234.240.0/22",
        // "198.41.128.0/17",
        // "162.158.0.0/15",
        // "104.16.0.0/13",
        // "104.24.0.0/14",
        // "172.64.0.0/13",
        // "131.0.72.0/22"
    ],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    credentials: true
};

const app = express();
app.use(cors(corsOptions));

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/status", (req, res) => {
    res.json({ status: "ok" });
})
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);


app.listen(PORT, () => console.log(`Server started on port ${PORT}`))

