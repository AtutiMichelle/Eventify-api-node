const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/dashboard-stats', async (req, res) => {
    try {
        const [usersResult] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
        const [eventsResult] = await db.query('SELECT COUNT(*) AS totalEvents FROM events');
        const [registrationsResult] = await db.query('SELECT COUNT(*) AS totalRegisteredEvents FROM event_registrations');

        console.log('🟢 Query Results:', { usersResult, eventsResult, registrationsResult });

        // Directly access the returned object properties
        const totalUsers = usersResult.totalUsers || 0;
        const totalEvents = eventsResult.totalEvents || 0;
        const totalRegisteredEvents = registrationsResult.totalRegisteredEvents || 0;

        res.json({
            totalUsers,
            totalEvents,
            totalRegisteredEvents
        });

    } catch (error) {
        console.error('❌ Database Query Error:', error);
        res.status(500).json({ error: 'Server Error', details: error.message });
    }
});


router.get('/recent-users', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, email, date_joined FROM users ORDER BY date_joined DESC LIMIT 5'
        );

        console.log('✅ Query Result:', result);
        res.json(result);
    } catch (error) {
        console.error('❌ Error in /result:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.get('/all-users', async (req, res) => {
    try {
        const sql = 'SELECT id, name, email, date_joined FROM users'; // Adjust fields as needed
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching users:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/search-users', async (req, res) => {
    try {
        const search = req.query.search || '';

        const users = await db.query(`
            SELECT * FROM users
            WHERE name LIKE ? OR email LIKE ?
            ORDER BY date_joined DESC
        `, [`%${search}%`, `%${search}%`]);

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});



module.exports = router;
