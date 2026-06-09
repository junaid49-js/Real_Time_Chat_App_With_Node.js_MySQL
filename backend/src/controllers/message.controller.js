import cloudinary from '../lib/cloudinary.js'
import { db } from '../db/db.js'
import { getReceiverSocketId, io } from '../lib/socket.js'

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user.id
        const [rows] = await db.execute('SELECT id, fullName FROM users WHERE id != ?', [loggedInUserId])

        return res.status(200).json(rows)
    } catch (error) {
        console.log('Error in getUsersForSidebar controller', error.message)
        return res.status(500).json({ message: 'Internal server error'})
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id:userToChatId } = req.params
        const loggedInUserId = req.user.id

        const [rows] = await db.execute(`
            SELECT * FROM messages
            WHERE (senderId = ? AND receiverId = ?)
            OR (senderId = ? AND receiverId = ?)
            ORDER BY createdAt
        `, [loggedInUserId, userToChatId, userToChatId, loggedInUserId])

        return res.status(200).json(rows)
    } catch (error) {
        console.log('Error in getMessages controller', error.message)
        return res.status(500).json({ message: 'Internal server error'})
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body
        const { id:receiverId } = req.params
        const senderId = req.user.id

        let imageUrl = null;

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: 'real_time_chat_app',
            })
            imageUrl = uploadResponse.secure_url
        }

        const [result] = await db.execute(`
            INSERT INTO messages (senderId, receiverId, text, image)
            VALUES (?, ?, ?, ?)
        `, [senderId, receiverId, text, imageUrl])

        const receiverSocketId = getReceiverSocketId(receiverId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', {
                senderId,
                receiverId,
                text,
                image: imageUrl
            })
        }

        return res.status(201).json({ message: 'Message sent successfully' })
    } catch (error) {
        console.log('Error in sendMessage controller', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
