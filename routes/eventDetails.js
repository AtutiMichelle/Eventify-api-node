const express=require ("express");
const router= express.Router();
const db=require("../db");

//retrieve all events
router.get('/event-details', async (req, res) => {
    const sql = 'SELECT * FROM events'; 
    try {
      db.query(sql, (err, events) => {  
        if (err) {
          console.error('Error fetching events:', err);
          return res.status(500).json({ error: 'Error fetching event details', message: err.message });
        }

        if (events.length === 0) {
          return res.status(404).json({ error: 'No events found' });
        }
        
        res.json(events); 
      });
    } catch (error) {
      console.error('Error fetching events:', error); 
      res.status(500).json({ error: 'Error fetching event details', message: error.message });
    }
});
 
//retrieve a single event
router.get("/:id", async (req ,res)=>
{
    const eventId=req.params.id;

    try{
        const [event]= await db.execute("SELECT * FROM events where id =? ", [eventId]);
        if(event.length===0){
            return res.status(404).json({error :"Event not found"});

        }
        res.json(event[0]);
    }
    catch(error){
        res.status(500).json({error:"Error fetching event details"});
    }
});

//create a new event
router.post("/events", async (req, res) => {
  const { name, description, location, date, time, organizer, capacity, status } = req.body;
  
  try {
      const sql = `INSERT INTO events (name, description, location, date, time, organizer, capacity, status) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const [result] = await db.execute(sql, [name, description, location, date, time, organizer, capacity, status || 'Upcoming']);

      res.status(201).json({ message: "Event created successfully", eventId: result.insertId });
  } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Error creating event" });
  }
});

//update an event
router.put('/events/:id', async (req, res) => {
    console.log('Received PUT request:', req.params, req.body);
    const eventId = req.params.id;
    const updatedData = req.body;

    try {
        const result = await db.query(
            'UPDATE events SET id =?,name = ?, description = ?, location = ?, date = ?, time = ?, organizer = ?, capacity = ?, status = ? WHERE id = ?',
            [updatedData.id, updatedData.name, updatedData.description, updatedData.location, updatedData.date, updatedData.time, updatedData.organizer, updatedData.capacity, updatedData.status, eventId]
        );

        console.log('Update Result:', result);

        if (result.affectedRows > 0) {
            res.json({ message: 'Event updated successfully' });
        } else {
            res.status(404).json({ message: 'Event not found or no changes made' });
        }
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ error: error.message });
    }
});


//delete an event
router.delete("/events/:id", async (req, res) => {
    const eventId = req.params.id;
    try {
      const sql = "DELETE FROM events WHERE id = ?";
      // This should return an object, not an array
      const result = await db.execute(sql, [eventId]);
  
      // Check the structure of the result object
      console.log('Delete result:', result);
  
      // Ensure result is an object with affectedRows property
      if (result && result.affectedRows === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
  
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Error deleting event" });
    }
  });
  

//search for an event
router.get('/search-events', async (req, res) => {
  console.log('🛠 Entered /search-events route');

  try {
      const { search } = req.query;
      console.log('🔍 Received search query:', search);

      if (!search) {
          console.error('❌ No search query provided');
          return res.status(400).json({ message: 'Search query is required' });
      }

      // Construct SQL query
      const sql = `
          SELECT * FROM events WHERE 
          name LIKE ? OR 
          description LIKE ? OR 
          location LIKE ? OR 
          date LIKE ? OR 
          time LIKE ? OR 
          organizer LIKE ? OR 
          capacity LIKE ? OR 
          status LIKE ?
      `;

      const searchPattern = `%${search}%`;

      // Execute the query
      const [results] = await db.query(sql, [
          searchPattern, searchPattern, searchPattern, searchPattern,
          searchPattern, searchPattern, searchPattern, searchPattern
      ]);

      console.log('✅ Search results:', results);
      res.json(Array.isArray(results) ? results : [results]);
  } catch (error) {
      console.error('❌ Error during search operation:', error);
      res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});


module.exports=router;
