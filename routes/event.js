const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db'); 
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret_key';

// Middleware to authenticate users
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('❌ Invalid Token:', err.message);
            return res.status(401).json({ message: 'Invalid token' });
        }

        console.log('✅ Decoded Token:', decoded); // Debugging

        if (!decoded.user_id) {
            return res.status(401).json({ message: 'Invalid token payload: user_id missing' });
        }

        req.user = decoded;
        next();
    });
};

// Register for an event
router.post('/register-event', authenticateUser, (req, res) => {
    const { event_id, ticket_type, ticket_quantity, payment_method, special_requests } = req.body;
    const user_id = req.user.user_id;

    if (!event_id || !ticket_type || !ticket_quantity || !payment_method) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    console.log(`📌 Registering User ID: ${user_id} for Event ID: ${event_id}`);

    const verification_code = `EVT-${Math.floor(100000 + Math.random() * 900000)}`; 

    const sql = `INSERT INTO event_registrations 
                 (user_id, event_id, ticket_type, ticket_quantity, payment_method, special_requests, verification_code) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [user_id, event_id, ticket_type, ticket_quantity, payment_method, special_requests, verification_code], 
        (err, result) => {
            if (err) {
                console.error('❌ Event registration error:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.status(201).json({ message: '✅ Event registration successful', verification_code });
        }
    );
});

// Get registered events for a user
router.get('/user-events', authenticateUser, (req, res) => {
    const user_id = req.user.user_id;

    console.log(`📌 Fetching events for User ID: ${user_id}`);

    const sql = `SELECT e.name AS event_name, r.ticket_type, r.ticket_quantity, r.payment_method, r.verification_code 
                 FROM event_registrations r 
                 JOIN events e ON r.event_id = e.id 
                 WHERE r.user_id = ?`;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error('❌ Error fetching user events:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
});

module.exports = router;
