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
        const sql = 'SELECT id, name, email, date_joined FROM users'; 
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
        const { search } = req.query;
        console.log('🔍 Received search query:', search);

        if (!search) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Construct SQL query
        const sql = `SELECT * FROM users WHERE name LIKE ? OR email LIKE ? OR date_joined LIKE ?`;
        const searchPattern = `%${search}%`;
        console.log('🛠 Query:', sql, [searchPattern, searchPattern, searchPattern]);

        // Execute query
        const [results] = await db.query(sql, [searchPattern, searchPattern, searchPattern]);

        console.log('✅ Search results:', results);
        res.json(Array.isArray(results) ? results : [results]);

    } catch (error) {
        console.error('❌ Error searching users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const sql = 'DELETE FROM users WHERE id = ?';

        const result = await db.query(sql, [userId]); 

        if (result.affectedRows === 0) {  
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.put('/users/:id', async (req, res) => {
    console.log('Received PUT request:', req.params, req.body);
    const userId = req.params.id;
    const updatedData = req.body;

    try {
        const result = await db.query(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [updatedData.name, updatedData.email, userId]
        ); 

        console.log('Update Result:', result);

        if (result.affectedRows > 0) {
            res.json({ message: 'User updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
