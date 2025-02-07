const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const authRoutes = require('./routes/auth');
const eventRoutes=require('./routes/event');
const eventDetailsRoutes=require('./routes/eventDetails');
const ticketsRoutes = require('./routes/tickets');

app.use(cors());
app.use(express.json());

//routes
app.use('/api', authRoutes);

app.use('/api', eventRoutes);

app.use('/api', eventDetailsRoutes);

app.use('/api/tickets', ticketsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
