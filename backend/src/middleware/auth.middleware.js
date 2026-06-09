import jwt from 'jsonwebtoken'
import { db } from '../db/db.js'

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - No Token Provided'})
        }

        const decoded = jwt.verify( token, process.env.JWT_SECRET)

        if (!decoded){
            return res.status(401).json({ message: 'Unauthorized - Token Invalid'})
        }

        const [rows] = await db.execute('SELECT id, fullName, email FROM users WHERE id = ? LIMIT 1', [decoded.userId]);
        const user = rows[0] ?? null;

        if (!user) {
            return res.status(404).json({ message: 'User not found'})
        }

        req.user = user

        next()
    } catch (error) {
        console.log('Error in protectRoute middleware', error.message)
        res.status(500).json({ message: 'Internal server error'})
    }
}
