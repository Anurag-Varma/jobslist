import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { generateTokenAndSetCookie } from "../utils/helpers/generateTokenAndSetCookie.js"

import { spawn } from 'child_process';

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }

        if (name == "" || email == "" || password == "") {
            return res.status(400).json({ error: "All fields are required" });
        }



        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword
        });

        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);

            return res.status(201).json({
                message: "User created successfully",
                name: newUser.name,
                email: newUser.email,
                isAdmin: newUser.isAdmin,
                isPro: newUser.isPro,
                emailText: newUser.emailText,
                jsonCookies: newUser.jsonCookies
            });
        } else {
            return res.status(400).json({ error: "User not created" });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }


}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            message: "Login successful",
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isPro: user.isPro,
            emailText: user.emailText,
            jsonCookies: user.jsonCookies
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie("jwt");
        res.status(200).json({ message: "Logout successful" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateJobDetails = async (req, res) => {
    try {
        const user = req.user;
        const { jobViewed, jobApplied, jobDeleted } = req.body;

        // Check if jobViewed is provided and update the viewed array
        if (jobViewed) {
            const viewedId = new mongoose.Types.ObjectId(jobViewed);
            if (!user.viewed.includes(viewedId)) {
                user.viewed.push(viewedId);
            }
        }

        // Check if jobApplied is provided and update the applied array
        if (jobApplied) {
            const appliedId = new mongoose.Types.ObjectId(jobApplied);
            if (!user.applied.includes(appliedId)) {
                user.applied.push(appliedId);
            }
        }

        // Check if jobDeleted is provided and update the deleted array
        if (jobDeleted) {
            const deletedId = new mongoose.Types.ObjectId(jobDeleted);
            if (user.deleted.includes(deletedId)) {
                // Job ID is already in the deleted array, remove it
                user.deleted.splice(user.deleted.indexOf(deletedId), 1);
            } else {
                // Job ID is not in the deleted array, add it
                user.deleted.push(deletedId);
            }
        }

        await user.save();
        res.status(200).json({ message: "Job details updated successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateUser = async (req, res) => {
    try {
        const { name, email, password, jsonCookies, emailText } = req.body;

        let user = req.user

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // if (req.params.email !== req.user.email) {
        //     return res.status(403).json({ error: "You can update only your account" });
        // }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        user.name = name || user.name;
        user.email = email || user.email;

        if (user.isPro) {
            user.jsonCookies = jsonCookies;
            user.emailText = emailText;
        }
        else {
            user.jsonCookies = "";
            user.emailText = "";
        }

        await user.save();

        user.password = null;

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}

const referralEmail = async (req, res) => {
    try {
        const { job } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const pythonArgs = [job.job_company, job.job_url_direct];

        const pythonProcess = spawn('python3', ['referralEmailScript.py', ...pythonArgs]);

        pythonProcess.stdout.on('data', (data) => {
            const result = JSON.parse(data.toString()); // Convert the Python output to JSON

            // Send the result back to the client
            res.status(200).json(result);
        });

        // Handle any errors from the Python script
        pythonProcess.stderr.on('data', (data) => {
            res.status(500).json({ error: "Error executing Python script" });
        });

        // Handle the Python process exit
        pythonProcess.on('close', (code) => {
            console.log(`Python script exited with code ${code}`);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export { signup, login, logout, updateJobDetails, updateUser, referralEmail };
