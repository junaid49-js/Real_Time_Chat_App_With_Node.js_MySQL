import {generateToken, clearToken} from "../lib/utils.js";
import { db } from "../db/db.js";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;

    try {
        const normalizedFullName = fullName?.trim();
        const normalizedEmail = email?.toLowerCase()?.trim();

        if (!normalizedFullName || !normalizedEmail || !password) {
            return res.status(400).json({message: "All fields are required"})
        }

        if (password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters"})
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Invalid email address"
            });
        }

        const [rows] = await db.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
        const user = rows[0] ?? null;

        if(user) {
            return res.status(409).json({message: "User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: uuidv4(),
            fullName: normalizedFullName,
            email: normalizedEmail,
            password: hashedPassword
        }

        

        await db.execute('INSERT INTO users (id, fullName, email, password) VALUES (?, ?, ?, ?)', [newUser.id, newUser.fullName, newUser.email, newUser.password]);
        
        generateToken(newUser.id , res)

        return res.status(201).json({
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email,
        })

    } catch (error) {
        console.error("Error during signup:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = email?.toLowerCase()?.trim();

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Invalid email address"
            });
        }
        

        const [rows] = await db.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
        const user = rows[0] ?? null;

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        generateToken(user.id, res);

        return res.status(200).json({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
        })
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const logout = (req, res) => {
    try {
        clearToken(res);
        res.status(200).json({ message: 'Logged out successfully'})
    } catch (error) {
        console.log('Error in logout controller', error.message)
        res.status(500).json({ message: 'Internal server error'})
    }
}

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log('Error in checkAuth controller', error.message);
        res.status(500).json({ message: 'Internal server error'})
    }
}
