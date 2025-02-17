const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db'); 
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret_key';

// 🔐 Middleware to authenticate users
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

        if (!decoded.user_id) {
            return res.status(401).json({ message: 'Invalid token payload: user_id missing' });
        }

        req.user = decoded;
        next();
    });
};

// 🎟️ **Register for an Event**
router.post('/register-event', authenticateUser, async (req, res) => {
    const { event_id, ticket_id, ticket_quantity, payment_method, special_requests } = req.body;
    const user_id = req.user.user_id;

    if (!event_id || !ticket_id || !ticket_quantity || !payment_method) {
        return res.status(400).json({ message: 'All fields except special requests are required' });
    }

    console.log(`📌 Registering User ID: ${user_id} for Event ID: ${event_id} with Ticket ID: ${ticket_id}`);

    try {
        const verification_code = `EVT-${Math.floor(100000 + Math.random() * 900000)}`;

        // ✅ **Insert Registration**
        const sql = `INSERT INTO event_registrations 
                     (user_id, event_id, ticket_id, ticket_quantity, payment_method, special_requests, verification_code) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

        await db.promise().query(sql, [
            user_id, event_id, ticket_id, ticket_quantity, payment_method, special_requests || null, verification_code
        ]);

        res.status(201).json({ message: '✅ Event registration successful', verification_code });

    } catch (err) {
        console.error('❌ Event registration error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 📋 **Get Registered Events for a User**
router.get('/user-registrations', authenticateUser, async (req, res) => {
    const user_id = req.user.user_id;

    console.log(`📌 Fetching registered events for User ID: ${user_id}`);

    try {
        const sql = `SELECT e.id AS event_id, e.name AS event_name, e.date, e.location, e.description, 
                    tt.name AS ticket_type, t.price AS ticket_price, 
                    r.ticket_quantity, r.payment_method, r.verification_code 
             FROM event_registrations r 
             JOIN events e ON r.event_id = e.id 
             JOIN tickets t ON r.ticket_id = t.id
             JOIN ticket_types tt ON t.ticket_type_id = tt.id
             WHERE r.user_id = ?`;



        const [results] = await db.promise().query(sql, [user_id]);

        res.json(results);
    } catch (err) {
        console.error('❌ Error fetching user events:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

//Retrieve all events

module.exports = router;
