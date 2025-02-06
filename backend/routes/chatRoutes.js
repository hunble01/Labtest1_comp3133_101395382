const express = require('express');
const GroupMessage = require('../models/GroupMessage');
const PrivateMessage = require('../models/PrivateMessage');

const router = express.Router();

// Get group messages by room
router.get('/group/:room', async (req, res) => {
    try {
        const messages = await GroupMessage.find({ room: req.params.room }).sort('date_sent');
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving group messages' });
    }
});

// Save group message
router.post('/group', async (req, res) => {
    try {
        const { from_user, room, message } = req.body;
        const newMessage = new GroupMessage({ from_user, room, message });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: 'Error saving group message' });
    }
});

// Get private messages between two users
router.get('/private/:from_user/:to_user', async (req, res) => {
    try {
        const messages = await PrivateMessage.find({
            $or: [
                { from_user: req.params.from_user, to_user: req.params.to_user },
                { from_user: req.params.to_user, to_user: req.params.from_user }
            ]
        }).sort('date_sent');

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving private messages' });
    }
});

// Save private message
router.post('/private', async (req, res) => {
    try {
        const { from_user, to_user, message } = req.body;
        const newMessage = new PrivateMessage({ from_user, to_user, message });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: 'Error saving private message' });
    }
});

module.exports = router;
