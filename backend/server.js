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
    origin: ["https://www.jobslist.live",
        "https://jobslist.live"
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

// Middleware to verify the custom header
app.use((req, res, next) => {
    const customAuth = req.headers['x-custom-auth-header'];
    if (customAuth === process.env.CUSTOM_HEADER_SECRET) {
        next();
    } else {
        res.status(403).send('Forbidden');
    }
});

app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);


app.listen(PORT, () => console.log(`Server started on port ${PORT}`))

