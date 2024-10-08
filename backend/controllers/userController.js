import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { generateTokenAndSetCookie } from "../utils/helpers/generateTokenAndSetCookie.js"

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

import { google } from "googleapis";
const OAuth2 = google.auth.OAuth2;

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const getOAuth2Client = async (user) => {
    const credentials = JSON.parse(process.env.GOOGLE_OAUTH_CREDENTIALS);
    const { client_id, client_secret, redirect_uris } = credentials.web;
    const oAuth2Client = new OAuth2(client_id, client_secret, redirect_uris[0]);

    // Fetch the token from the database
    const token = user.gmailToken;

    if (token) {
        oAuth2Client.setCredentials(token);

        // If the token is expired or expiring, refresh it
        if (oAuth2Client.isTokenExpiring()) {
            console.log('Token is expired or expiring, refreshing...');
            const refreshedToken = await oAuth2Client.refreshAccessToken();
            user.gmailToken = refreshedToken.credentials;
            await user.save();
            oAuth2Client.setCredentials(refreshedToken.credentials);
            console.log('Token refreshed and saved to database.');
        }
    } else {
        // No token available, generate an OAuth URL
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        return { authUrl };  // Return auth URL to frontend
    }

    return oAuth2Client;
};

const sendMail = async (user, recipient, subject, body) => {
    try {
        const oAuth2Client = await getOAuth2Client(user);

        if (oAuth2Client.authUrl) {
            // If we need to authenticate, send the auth URL back
            return { authUrl: oAuth2Client.authUrl };
        }

        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        const raw = createMail(recipient, subject, body);

        const response = await gmail.users.messages.send({
            userId: 'me',
            resource: { raw: raw },
        });

        return { data: response.data };
    } catch (error) {
        console.error('Error sending email: ', error);
        throw error;
    }
};

const createMail = (to, subject, messageText) => {
    const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        messageText,
    ].join('\n');

    return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
};

const sendEmail = async (req, res) => {
    const { recipient, subject, body } = req.body;
    const user = req.user;
    try {
        const result = await sendMail(user, recipient, subject, body);

        if (result.authUrl) {
            res.status(200).send({ authUrl: result.authUrl });
        } else {
            res.status(200).send(result);
        }
    } catch (error) {
        console.error('Error sending email: ', error);
        res.status(500).send({ error: 'Error sending email' });
    }
};

const oauth2callback = async (req, res) => {
    const { code } = req.body;
    const user = req.user;

    const credentials = JSON.parse(process.env.GOOGLE_OAUTH_CREDENTIALS);
    const { client_id, client_secret, redirect_uris } = credentials.web;
    const oAuth2Client = new OAuth2(client_id, client_secret, redirect_uris[0]);

    // const oAuth2Client = await getOAuth2Client(user);  // Retrieve client secrets as before

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // Save the new tokens to the user's record in the database
        user.gmailToken = tokens;
        await user.save();

        res.status(200).send('Tokens successfully saved to the database!');
    } catch (error) {
        console.error('Error exchanging authorization code: ', error);
        res.status(500).send('Failed to exchange authorization code.');
    }
};

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

        const pythonArgs = [job.job_company, job.job_url_direct, user.jsonCookies, user.emailText];

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const scriptsDir = path.join(__dirname, '../../scripts');

        // Construct the path to the Python script dynamically
        const referralEmailScriptPath = path.join(scriptsDir, 'referralEmailScript.py');

        const pythonProcess = spawn('python3.10', [referralEmailScriptPath, ...pythonArgs]);

        pythonProcess.stdout.on('data', (data) => {
            const result = JSON.parse(data.toString()); // Convert the Python output to JSON

            // Send the result back to the client
            res.status(200).json(result);
        });

        // Handle any errors from the Python script
        pythonProcess.stderr.on('data', (data) => {
            // console.error(data.toString());
            res.status(500).json({ error: "Error executing Python script" });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export { signup, login, logout, updateJobDetails, updateUser, referralEmail, sendEmail, oauth2callback };
