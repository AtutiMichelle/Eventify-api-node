const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); 
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret_key'; 



// User registration
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        
        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error registering user:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (err) {
        console.error('Hashing error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// User login
router.post('/login', (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = 'SELECT * FROM users WHERE name = ?';

    db.query(sql, [name], async (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ user_id: user.id, usertype: user.usertype }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token, usertype: user.usertype });
    });
});


router.get('/user', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Session expired. Please log in again.' });
        }

        const userId = decoded.user_id;

        const sql = 'SELECT id, name, email, date_joined FROM users WHERE id = ?';
        db.query(sql, [userId], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(results[0]);
        });
    });
});


module.exports = router;
