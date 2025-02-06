const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { username, firstname, lastname, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, firstname, lastname, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(400).json({ error: 'Signup failed' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

        const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
        res.json({ token, username });
    } catch (err) {
        res.status(400).json({ error: 'Login failed' });
    }
});

module.exports = router;
